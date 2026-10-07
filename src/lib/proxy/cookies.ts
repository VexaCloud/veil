export type StoredCookie = {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires?: number;
  secure?: boolean;
  httpOnly?: boolean;
};

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

export function upsertCookie(jar: StoredCookie[], cookie: StoredCookie): StoredCookie[] {
  const next = jar.filter(
    (c) => !(c.domain === cookie.domain && c.name === cookie.name && c.path === cookie.path),
  );
  next.push(cookie);
  return next;
}

export function readSid(request: Request): string {
  const raw = request.headers.get("cookie") ?? "";
  const match = /(?:^|;\s*)veil_sid=([^;]+)/.exec(raw);
  return match ? decodeURIComponent(match[1]!) : "";
}
