import { rewriteAbsoluteUrl } from "./codec";
import type { EngineId } from "./types";

const URL_ATTRS = new Set([
  "href",
  "src",
  "action",
  "poster",
  "formaction",
  "cite",
  "background",
  "data-src",
  "data-href",
  "data-original",
  "data-lazy-src",
  "data-lazy",
  "data-url",
  "longdesc",
  "usemap",
  "xlink:href",
]);

const SRCSET_ATTRS = new Set(["srcset", "imagesrcset", "data-srcset"]);

function shouldRewriteAttr(n: string): boolean {
  return (
    URL_ATTRS.has(n) ||
    SRCSET_ATTRS.has(n) ||
    n === "style" ||
    n === "ping" ||
    n === "srcset" ||
    n === "imagesrcset" ||
    n === "content" ||
    (n.startsWith("data-") && /src|href|url/i.test(n))
  );
}

export function rewriteCss(
  css: string,
  pageUrl: string,
  engine: EngineId,
  tabId: string,
  stealth = false,
): string {
  let out = css.replace(/@import\s+(?:url\(\s*)?(["']?)([^"')]+)\1\s*\)?/gi, (_m, _q, u: string) => {
    return `@import url("${rewriteAbsoluteUrl(u, pageUrl, engine, tabId, stealth)}")`;
  });
  out = out.replace(/url\(\s*(["']?)([^"')]+)\1\s*\)/gi, (m, q: string, u: string) => {
    const t = String(u).trim();
    if (!t || /^(data:|blob:|#)/i.test(t)) return m;
    const rewritten = rewriteAbsoluteUrl(t, pageUrl, engine, tabId, stealth);
    const quote = q || '"';
    return `url(${quote}${rewritten}${quote})`;
  });
  return out;
}

export function rewriteSvg(
  svg: string,
  pageUrl: string,
  engine: EngineId,
  tabId: string,
  stealth = false,
): string {
  return rewriteHtml(svg, pageUrl, engine, tabId, "", stealth);
}

/**
 * Only rewrite dotted location access so local variables named `location` survive.
 * Dynamic import() specifiers are rewritten so modules stay on the proxy.
 */
export function rewriteJs(
  js: string,
  pageUrl: string,
  engine: EngineId,
  tabId: string,
  stealth = false,
): string {
  let out = js.replace(
    /(?<![\w$.])(?:window|self|globalThis|document|parent|top)\s*\.\s*location\b/g,
    "window.__veilLoc",
  );
  out = out.replace(/\bimport\s*\(\s*(["'`])([^"'`]+)\1/g, (m, q: string, u: string) => {
    const t = String(u).trim();
    if (!t || /^(data:|blob:|javascript:|#)/i.test(t)) return m;
    return `import(${q}${rewriteAbsoluteUrl(t, pageUrl, engine, tabId, stealth)}${q}`;
  });
  return out;
}

function rewriteSrcset(
  value: string,
  pageUrl: string,
  engine: EngineId,
  tabId: string,
  stealth: boolean,
): string {
  return value
    .split(",")
    .map((part) => {
      const trimmed = part.trim();
      if (!trimmed) return trimmed;
      const bits = trimmed.split(/\s+/);
      const u = bits.shift() ?? "";
      return [rewriteAbsoluteUrl(u, pageUrl, engine, tabId, stealth), ...bits].join(" ");
    })
    .join(", ");
}

function rewriteAttrValue(
  name: string,
  value: string,
  pageUrl: string,
  engine: EngineId,
  tabId: string,
  stealth: boolean,
): string {
  const n = name.toLowerCase();
  if (n === "style") return rewriteCss(value, pageUrl, engine, tabId, stealth);
  if (SRCSET_ATTRS.has(n) || n === "srcset" || n === "imagesrcset") {
    return rewriteSrcset(value, pageUrl, engine, tabId, stealth);
  }
  if (n === "ping") {
    return value
      .split(/\s+/)
      .map((u) => rewriteAbsoluteUrl(u, pageUrl, engine, tabId, stealth))
      .join(" ");
  }
  if (n === "content") {
    if (/url=/i.test(value)) {
      return value.replace(/url\s*=\s*([^\s;]+)/i, (_m, u: string) => {
        return "url=" + rewriteAbsoluteUrl(u.replace(/^["']|["']$/g, ""), pageUrl, engine, tabId, stealth);
      });
    }
    if (/^(https?:)?\/\//i.test(value.trim()) || value.trim().startsWith("/")) {
      return rewriteAbsoluteUrl(value.trim(), pageUrl, engine, tabId, stealth);
    }
    return value;
  }
  if (URL_ATTRS.has(n) || (n.startsWith("data-") && /src|href|url/i.test(n))) {
    return rewriteAbsoluteUrl(value, pageUrl, engine, tabId, stealth);
  }
  return value;
}

function stripDangerous(html: string): string {
  return html
    .replace(/<meta\b[^>]*http-equiv\s*=\s*["']?content-security-policy[^>]*>/gi, "")
    .replace(/\s+integrity\s*=\s*(["'][^"']*["']|[^\s>]+)/gi, "")
    .replace(/\s+nonce\s*=\s*(["'][^"']*["']|[^\s>]+)/gi, "")
    .replace(/\s+crossorigin\s*=\s*(["'][^"']*["']|[^\s>]+)/gi, "")
    .replace(/<meta\b[^>]*http-equiv\s*=\s*["']?x-frame-options[^>]*>/gi, "")
    .replace(/<base\b[^>]*>/gi, "");
}

function rewriteImportMap(
  json: string,
  pageUrl: string,
  engine: EngineId,
  tabId: string,
  stealth: boolean,
): string {
  try {
    const data = JSON.parse(json) as {
      imports?: Record<string, string>;
      scopes?: Record<string, Record<string, string>>;
    };
    if (data.imports) {
      for (const [k, v] of Object.entries(data.imports)) {
        data.imports[k] = rewriteAbsoluteUrl(v, pageUrl, engine, tabId, stealth);
      }
    }
    if (data.scopes) {
      for (const scope of Object.values(data.scopes)) {
        for (const [k, v] of Object.entries(scope)) {
          scope[k] = rewriteAbsoluteUrl(v, pageUrl, engine, tabId, stealth);
        }
      }
    }
    return JSON.stringify(data);
  } catch {
    return json;
  }
}

function rewriteTagAttrs(
  attrs: string,
  pageUrl: string,
  engine: EngineId,
  tabId: string,
  stealth: boolean,
): string {
  let rewritten = attrs.replace(
    /(\s)([a-zA-Z_:][\w:.-]*)(\s*=\s*)(["'])([\s\S]*?)\4/g,
    (_a, sp: string, name: string, eq: string, q: string, val: string) => {
      const n = name.toLowerCase();
      if (shouldRewriteAttr(n)) {
        return `${sp}${name}${eq}${q}${rewriteAttrValue(n, val, pageUrl, engine, tabId, stealth)}${q}`;
      }
      return _a;
    },
  );
  rewritten = rewritten.replace(
    /(\s)([a-zA-Z_:][\w:.-]*)(\s*=\s*)([^\s"'=<>`]+)/g,
    (_a, sp: string, name: string, eq: string, val: string) => {
      const n = name.toLowerCase();
      if (shouldRewriteAttr(n)) {
        return `${sp}${name}${eq}${rewriteAttrValue(n, val, pageUrl, engine, tabId, stealth)}`;
      }
      return _a;
    },
  );
  return rewritten;
}

export function rewriteHtml(
  html: string,
  pageUrl: string,
  engine: EngineId,
  tabId: string,
  hookScript: string,
  stealth = false,
): string {
  let out = stripDangerous(html);

  out = out.replace(
    /<(meta)\b([^>]*http-equiv\s*=\s*["']?refresh["']?[^>]*)>/gi,
    (_m, tag: string, attrs: string) => {
      const next = rewriteTagAttrs(attrs, pageUrl, engine, tabId, stealth);
      return `<${tag}${next}>`;
    },
  );

  out = out.replace(/<\s*([a-zA-Z][\w:-]*)\b([^>]*)>/g, (m, tag: string, attrs: string) => {
    if (!attrs) return m;
    if (/\/\s*$/.test(m) && tag.toLowerCase() === "script" && attrs.includes("data-veil")) return m;
    return `<${tag}${rewriteTagAttrs(attrs, pageUrl, engine, tabId, stealth)}>`;
  });

  out = out.replace(/<style\b([^>]*)>([\s\S]*?)<\/style>/gi, (_m, attrs: string, css: string) => {
    return `<style${attrs}>${rewriteCss(css, pageUrl, engine, tabId, stealth)}</style>`;
  });

  out = out.replace(
    /<script\b([^>]*type\s*=\s*["']importmap["'][^>]*)>([\s\S]*?)<\/script>/gi,
    (_m, attrs: string, body: string) => {
      return `<script${attrs}>${rewriteImportMap(body, pageUrl, engine, tabId, stealth)}</script>`;
    },
  );

  let baseHref = "";
  try {
    const dir = new URL(".", pageUrl).href;
    baseHref = `<base href="${rewriteAbsoluteUrl(dir, pageUrl, engine, tabId, stealth)}">`;
  } catch {
    baseHref = "";
  }

  const hook = hookScript ? `${baseHref}<script data-veil="hook">${hookScript}</script>` : baseHref;
  if (!hook) return out;
  if (/<head[^>]*>/i.test(out)) {
    out = out.replace(/<head[^>]*>/i, (m) => m + hook);
  } else if (/<html[^>]*>/i.test(out)) {
    out = out.replace(/<html[^>]*>/i, (m) => `${m}<head>${hook}</head>`);
  } else {
    out = hook + out;
  }
  return out;
}

export function sniffHtml(contentType: string | null, url: string, head: Uint8Array): boolean {
  const ct = (contentType ?? "").toLowerCase();
  if (ct.includes("text/html") || ct.includes("application/xhtml")) return true;
  if (ct && !ct.includes("octet-stream") && !ct.includes("text/plain")) return false;
  if (head.length >= 8) {
    if (head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47) return false;
    if (head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) return false;
    if (head[0] === 0x47 && head[1] === 0x49 && head[2] === 0x46) return false;
    if (head[0] === 0x52 && head[1] === 0x49 && head[2] === 0x46 && head[8] === 0x57) return false;
    if (head[0] === 0x00 && head[1] === 0x00 && head[2] === 0x01 && head[3] === 0x00) return false;
  }
  const start = new TextDecoder("utf-8", { fatal: false }).decode(head.slice(0, 256)).trimStart();
  if (/^<!doctype html/i.test(start) || /^<html/i.test(start)) return true;
  const path = new URL(url).pathname;
  if (/\.html?$/i.test(path) || path.endsWith("/")) {
    return start.startsWith("<");
  }
  return false;
}

export function isCss(contentType: string | null, url: string): boolean {
  const ct = (contentType ?? "").toLowerCase();
  if (ct.includes("text/css")) return true;
  return /\.css(?:$|\?)/i.test(new URL(url).pathname);
}

export function isJs(contentType: string | null, url: string): boolean {
  const ct = (contentType ?? "").toLowerCase();
  if (ct.includes("javascript") || ct.includes("ecmascript")) return true;
  return /\.m?js(?:$|\?)/i.test(new URL(url).pathname);
}

export function isSvg(contentType: string | null, url: string): boolean {
  const ct = (contentType ?? "").toLowerCase();
  if (ct.includes("image/svg") || ct.includes("svg+xml")) return true;
  return /\.svg(?:$|\?)/i.test(new URL(url).pathname);
}
