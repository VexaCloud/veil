export type StoredCookie = {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires?: number;
  secure?: boolean;
  httpOnly?: boolean;
};

function b64url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function b64urlDecode(s: string): string {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const bin = atob(b64);
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

function cookieName(tabId: string, domain: string, name: string): string {
  return `v_${tabId}_${b64url(`${domain}\t${name}`)}`;
}

export function parseSetCookie(header: string, fallbackDomain: string): StoredCookie | null {
  const parts = header.split(";").map((p) => p.trim());
  const first = parts.shift();
  if (!first) return null;
  const eq = first.indexOf("=");
  if (eq < 0) return null;
  const name = first.slice(0, eq).trim();
  const value = first.slice(eq + 1).trim();
  if (!name) return null;
  const c: StoredCookie = {
    name,
    value,
    domain: fallbackDomain,
    path: "/",
  };
  for (const p of parts) {
    const [k, ...rest] = p.split("=");
    const key = (k ?? "").trim().toLowerCase();
    const val = rest.join("=").trim();
    if (key === "domain" && val) c.domain = val.replace(/^\./, "");
    else if (key === "path" && val) c.path = val;
    else if (key === "expires" && val) {
      const t = Date.parse(val);
      if (!Number.isNaN(t)) c.expires = t;
    } else if (key === "max-age" && val) {
      const n = Number(val);
      if (Number.isFinite(n)) c.expires = Date.now() + n * 1000;
    } else if (key === "secure") c.secure = true;
    else if (key === "httponly") c.httpOnly = true;
  }
  return c;
}

export function cookieMatches(c: StoredCookie, url: URL): boolean {
  if (c.expires && c.expires < Date.now()) return false;
  if (c.secure && url.protocol !== "https:") return false;
  const host = url.hostname;
  const d = c.domain.replace(/^\./, "");
  if (!(host === d || host.endsWith("." + d))) return false;
  const path = url.pathname || "/";
  const p = c.path || "/";
  return path === p || path.startsWith(p.endsWith("/") ? p : p + "/") || p === "/";
}

export function jarToCookieHeader(cookies: StoredCookie[], url: URL): string {
  return cookies
    .filter((c) => cookieMatches(c, url))
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
}

export function setCookieToResponse(cookie: StoredCookie, tabId: string, reqUrl: URL): string {
  const name = cookieName(tabId, cookie.domain, cookie.name);
  const parts = [`${name}=${encodeURIComponent(cookie.value)}`, `Path=/p/`, `SameSite=Lax`];
  if (reqUrl.protocol === "https:") parts.push("Secure");
  if (cookie.httpOnly) parts.push("HttpOnly");
  if (cookie.expires) parts.push(`Expires=${new Date(cookie.expires).toUTCString()}`);
  return parts.join("; ");
}

export function readJarFromRequest(request: Request, tabId: string): StoredCookie[] {
  const raw = request.headers.get("cookie");
  if (!raw) return [];
  const out: StoredCookie[] = [];
  const prefix = `v_${tabId}_`;
  for (const piece of raw.split(";")) {
    const eq = piece.indexOf("=");
    if (eq < 0) continue;
    const name = piece.slice(0, eq).trim();
    let value = piece.slice(eq + 1).trim();
    try {
      value = decodeURIComponent(value);
    } catch {
      /* keep raw */
    }
    if (!name.startsWith(prefix)) continue;
    const packed = name.slice(prefix.length);
    try {
      const decoded = b64urlDecode(packed);
      const cut = decoded.indexOf("\t");
      if (cut < 1) continue;
      out.push({
        name: decoded.slice(cut + 1),
        value,
        domain: decoded.slice(0, cut),
        path: "/",
      });
    } catch {
      continue;
    }
  }
  return out;
}
