import { ENGINES, type EngineId, PROXY_PREFIX } from "./types";

const UV_KEY = "veil-uv-codec";
const SJ_KEY = "veil-sj-codec";
const STEALTH_MARK = "x.";

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
  return `${u.protocol.replace(":", "")}/${u.host}${u.pathname}${u.search}`;
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

function isBlobEngine(engine: EngineId, rest: string): boolean {
  return rest.startsWith(STEALTH_MARK) || engine === "ultraviolet" || engine === "mercury" || engine === "scramjet";
}

function encodePayload(engine: EngineId, url: string, stealth: boolean): string {
  const abs = new URL(url).href;
  if (stealth) return STEALTH_MARK + xorB64Encode(abs, UV_KEY);
  if (engine === "ultraviolet") return xorB64Encode(abs, UV_KEY);
  if (engine === "mercury") return b64urlEncodeBytes(new TextEncoder().encode(abs));
  if (engine === "scramjet") return xorHexEncode(abs, SJ_KEY);
  return pathStyleEncode(abs);
}

function decodeBlob(engine: EngineId, blob: string): string {
  if (blob.startsWith(STEALTH_MARK)) {
    return xorB64Decode(blob.slice(STEALTH_MARK.length), UV_KEY);
  }
  if (engine === "ultraviolet") return xorB64Decode(blob, UV_KEY);
  if (engine === "mercury") return new TextDecoder().decode(b64urlDecodeBytes(blob));
  if (engine === "scramjet") return xorHexDecode(blob, SJ_KEY);
  return pathStyleDecode(blob);
}

function joinExtra(decoded: string, extra: string): string {
  if (!extra) return decoded;
  const base = decoded.endsWith("/") ? decoded : decoded.replace(/[^/]*$/, "") || decoded + "/";
  return new URL(extra, base).href;
}

function decodePayload(engine: EngineId, rest: string): { target: string; stealth: boolean } {
  const stealth = rest.startsWith(STEALTH_MARK);
  if (isBlobEngine(engine, rest)) {
    const cut = rest.indexOf("/");
    const blob = cut < 0 ? rest : rest.slice(0, cut);
    const extra = cut < 0 ? "" : rest.slice(cut + 1);
    return { target: joinExtra(decodeBlob(engine, blob), extra), stealth };
  }
  return { target: decodeBlob(engine, rest), stealth };
}

export function encodeProxyPath(
  engine: EngineId,
  tabId: string,
  url: string,
  stealth = false,
): string {
  const code = ENGINES[engine].code;
  const abs = new URL(url).href;
  const hashIndex = abs.indexOf("#");
  const hash = hashIndex >= 0 ? abs.slice(hashIndex) : "";
  const noHash = hashIndex >= 0 ? abs.slice(0, hashIndex) : abs;
  return `${PROXY_PREFIX}/${code}/${tabId}/${encodePayload(engine, noHash, stealth)}${hash}`;
}

export type DecodedProxy = {
  engine: EngineId;
  tabId: string;
  target: string;
  stealth: boolean;
};

export function decodeProxySplat(splat: string): DecodedProxy | null {
  const cleaned = splat.replace(/^\/+/, "");
  const parts = cleaned.split("/");
  if (parts.length < 3) return null;
  const code = parts[0] ?? "";
  const tabId = parts[1] ?? "";
  const rest = parts.slice(2).join("/");
  if (!code || !tabId || !rest) return null;
  const engine = engineFromCode(code);
  if (!engine) return null;
  try {
    const { target, stealth } = decodePayload(engine, rest);
    const url = new URL(target);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return { engine, tabId, target: url.href, stealth };
  } catch {
    return null;
  }
}

export function decodeProxyHref(href: string): DecodedProxy | null {
  try {
    const u = new URL(href, "http://veil.local");
    if (!u.pathname.startsWith(PROXY_PREFIX + "/")) return null;
    return decodeProxySplat(u.pathname.slice(PROXY_PREFIX.length + 1) + u.search);
  } catch {
    return null;
  }
}

export function rewriteAbsoluteUrl(
  raw: string,
  pageUrl: string,
  engine: EngineId,
  tabId: string,
  stealth = false,
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
    return encodeProxyPath(engine, tabId, noHash, stealth) + hash;
  } catch {
    return raw;
  }
}

function parentFromHint(pageHint: string | null, splat: string): DecodedProxy | null {
  if (!pageHint) return null;
  try {
    const u = new URL(pageHint);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    const parts = splat.replace(/^\/+/, "").split("/");
    const engine = engineFromCode(parts[0] ?? "") ?? "nginx";
    const tabId = parts[1] ?? "tab";
    return { engine, tabId, target: u.href, stealth: splat.includes("/x.") };
  } catch {
    return null;
  }
}

export function resolveEscapedSplat(
  splat: string,
  referer: string | null,
  pageHint: string | null,
): DecodedProxy | null {
  const direct = decodeProxySplat(splat);
  if (direct) return direct;

  const parent =
    (referer ? decodeProxyHref(referer) : null) || parentFromHint(pageHint, splat);
  if (!parent) return null;

  const parts = splat.replace(/^\/+/, "").split("/");
  const rest = parts.slice(2).join("/");
  try {
    // Leaked same-origin paths (`/assets/x.png` rewritten to `/p/{code}/{tab}/assets/x.png`)
    // are origin-root. Trailing segments after an encoded blob are handled by decodeProxySplat.
    const rel = rest.startsWith("/") ? rest : `/${rest}`;
    const target = new URL(rel || "/", new URL(parent.target).origin).href;
    const url = new URL(target);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return { engine: parent.engine, tabId: parent.tabId, target: url.href, stealth: parent.stealth };
  } catch {
    return null;
  }
}

/** Resolve a request that escaped the `/p/` prefix (root-relative `/foo` on the Veil origin). */
export function resolveLeakedRequest(request: Request): DecodedProxy | null {
  const url = new URL(request.url);
  if (url.pathname.startsWith(PROXY_PREFIX + "/")) {
    const fromPath = decodeProxySplat(url.pathname.slice(PROXY_PREFIX.length + 1) + url.search);
    if (fromPath) return fromPath;
  }

  const leak = url.searchParams.get("__veil_leak") || url.searchParams.get("u");
  const referer = request.headers.get("referer") || request.headers.get("referrer");
  const pageHint = request.headers.get("x-veil-page");
  const parent =
    (referer ? decodeProxyHref(referer) : null) ||
    parentFromHint(pageHint, "") ||
    pageFromCookie(request);

  if (!parent) return null;

  try {
    if (leak) {
      const target = leak.startsWith("http")
        ? new URL(leak).href
        : new URL(leak, new URL(parent.target).origin).href;
      return { ...parent, target };
    }
    const target = new URL(url.pathname + url.search, new URL(parent.target).origin).href;
    return { ...parent, target };
  } catch {
    return null;
  }
}

export function pageFromCookie(request: Request): DecodedProxy | null {
  const raw = request.headers.get("cookie") ?? "";
  const match = /(?:^|;\s*)veil_page=([^;]+)/.exec(raw);
  if (!match) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(match[1]!)) as {
      engine?: string;
      tabId?: string;
      url?: string;
      stealth?: boolean;
    };
    if (!parsed.url) return null;
    const engine = (parsed.engine as EngineId) || "nginx";
    return {
      engine: ENGINES[engine] ? engine : "nginx",
      tabId: parsed.tabId || "tab",
      target: new URL(parsed.url).href,
      stealth: !!parsed.stealth,
    };
  } catch {
    return null;
  }
}

export function serializePageCookie(decoded: DecodedProxy): string {
  const payload = encodeURIComponent(
    JSON.stringify({
      engine: decoded.engine,
      tabId: decoded.tabId,
      url: decoded.target.slice(0, 1200),
      stealth: decoded.stealth,
    }),
  );
  return `veil_page=${payload}; Path=/; SameSite=Lax`;
}
