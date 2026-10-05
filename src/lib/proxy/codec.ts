import { ENGINES, type EngineId, PROXY_PREFIX } from "./types";

const UV_KEY = "veil-uv-codec";
const SJ_KEY = "veil-sj-codec";

function bytesXor(input: string, key: string): Uint8Array {
  const out = new Uint8Array(input.length);
  for (let i = 0; i < input.length; i++) {
    out[i] = input.charCodeAt(i) ^ key.charCodeAt(i % key.length);
  }
  return out;
}

function b64urlEncodeBytes(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function b64urlDecodeBytes(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function xorB64Encode(str: string, key: string): string {
  return b64urlEncodeBytes(bytesXor(str, key));
}

function xorB64Decode(str: string, key: string): string {
  const decoded = b64urlDecodeBytes(str);
  let raw = "";
  for (let i = 0; i < decoded.length; i++) raw += String.fromCharCode(decoded[i]!);
  const bytes = bytesXor(raw, key);
  let out = "";
  for (let i = 0; i < bytes.length; i++) out += String.fromCharCode(bytes[i]!);
  return out;
}

function xorHexEncode(str: string, key: string): string {
  const bytes = bytesXor(str, key);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) hex += bytes[i]!.toString(16).padStart(2, "0");
  return hex;
}

function xorHexDecode(hex: string, key: string): string {
  if (hex.length % 2 !== 0) throw new Error("Invalid hex");
  let out = "";
  for (let i = 0; i < hex.length; i += 2) {
    const b = parseInt(hex.slice(i, i + 2), 16);
    out += String.fromCharCode(b ^ key.charCodeAt((i / 2) % key.length));
  }
  return out;
}

function pathStyleEncode(url: string): string {
  const u = new URL(url);
  const path = `${u.protocol.replace(":", "")}/${u.host}${u.pathname}`;
  return path + u.search;
}

function pathStyleDecode(splat: string): string {
  const cut = splat.indexOf("/");
  if (cut < 0) throw new Error("Invalid path-style target");
  const proto = splat.slice(0, cut);
  const rest = splat.slice(cut + 1);
  if (proto !== "http" && proto !== "https") throw new Error("Unsupported protocol");
  return `${proto}://${rest}`;
}

export function engineFromCode(code: string): EngineId | null {
  for (const e of Object.values(ENGINES)) {
    if (e.code === code) return e.id;
  }
  return null;
}

export function encodeProxyPath(engine: EngineId, tabId: string, url: string): string {
  const code = ENGINES[engine].code;
  const abs = new URL(url).href;
  if (engine === "ultraviolet") {
    return `${PROXY_PREFIX}/${code}/${tabId}/${xorB64Encode(abs, UV_KEY)}`;
  }
  if (engine === "mercury") {
    return `${PROXY_PREFIX}/${code}/${tabId}/${b64urlEncodeBytes(new TextEncoder().encode(abs))}`;
  }
  if (engine === "scramjet") {
    return `${PROXY_PREFIX}/${code}/${tabId}/${xorHexEncode(abs, SJ_KEY)}`;
  }
  return `${PROXY_PREFIX}/${code}/${tabId}/${pathStyleEncode(abs)}`;
}

export function decodeProxySplat(splat: string): {
  engine: EngineId;
  tabId: string;
  target: string;
} | null {
  const parts = splat.split("/");
  if (parts.length < 3) return null;
  const code = parts[0] ?? "";
  const tabId = parts[1] ?? "";
  const rest = parts.slice(2).join("/");
  if (!code || !tabId || !rest) return null;
  const engine = engineFromCode(code);
  if (!engine) return null;
  try {
    let target: string;
    if (engine === "ultraviolet") target = xorB64Decode(rest, UV_KEY);
    else if (engine === "mercury") {
      target = new TextDecoder().decode(b64urlDecodeBytes(rest));
    } else if (engine === "scramjet") target = xorHexDecode(rest, SJ_KEY);
    else target = pathStyleDecode(rest);
    const url = new URL(target);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return { engine, tabId, target: url.href };
  } catch {
    return null;
  }
}

export function rewriteAbsoluteUrl(
  raw: string,
  pageUrl: string,
  engine: EngineId,
  tabId: string,
): string {
  const trimmed = raw.trim();
  if (!trimmed) return raw;
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("blob:") ||
    lower.startsWith("mailto:") ||
    lower.startsWith("tel:") ||
    lower.startsWith("#") ||
    lower.startsWith("about:")
  ) {
    return raw;
  }
  if (trimmed.startsWith(PROXY_PREFIX + "/")) return raw;
  try {
    const abs = new URL(trimmed, pageUrl).href;
    const hashIndex = abs.indexOf("#");
    const hash = hashIndex >= 0 ? abs.slice(hashIndex) : "";
    const noHash = hashIndex >= 0 ? abs.slice(0, hashIndex) : abs;
    return encodeProxyPath(engine, tabId, noHash) + hash;
  } catch {
    return raw;
  }
}
