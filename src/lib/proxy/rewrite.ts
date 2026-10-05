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
  "longdesc",
  "usemap",
  "xlink:href",
]);

const SRCSET_ATTRS = new Set(["srcset", "imagesrcset", "data-srcset"]);

export function rewriteCss(css: string, pageUrl: string, engine: EngineId, tabId: string): string {
  let out = css.replace(/@import\s+(?:url\(\s*)?(["']?)([^"')]+)\1\s*\)?/gi, (_m, _q, u: string) => {
    return `@import url("${rewriteAbsoluteUrl(u, pageUrl, engine, tabId)}")`;
  });
  out = out.replace(/url\(\s*(["']?)([^"')]+)\1\s*\)/gi, (m, q: string, u: string) => {
    const t = String(u).trim();
    if (!t || /^(data:|blob:|#)/i.test(t)) return m;
    const rewritten = rewriteAbsoluteUrl(t, pageUrl, engine, tabId);
    const quote = q || '"';
    return `url(${quote}${rewritten}${quote})`;
  });
  return out;
}

export function rewriteJs(js: string, pageUrl: string, engine: EngineId, tabId: string): string {
  return js.replace(/(["'])(https?:\/\/[^"'\\\s]+)\1/g, (m, q: string, u: string) => {
    if (u.includes("/p/") || u.length > 1800) return m;
    try {
      return `${q}${rewriteAbsoluteUrl(u, pageUrl, engine, tabId)}${q}`;
    } catch {
      return m;
    }
  });
}

function rewriteSrcset(value: string, pageUrl: string, engine: EngineId, tabId: string): string {
  return value
    .split(",")
    .map((part) => {
      const trimmed = part.trim();
      if (!trimmed) return trimmed;
      const bits = trimmed.split(/\s+/);
      const u = bits.shift() ?? "";
      return [rewriteAbsoluteUrl(u, pageUrl, engine, tabId), ...bits].join(" ");
    })
    .join(", ");
}

function rewriteAttrValue(
  name: string,
  value: string,
  pageUrl: string,
  engine: EngineId,
  tabId: string,
): string {
  const n = name.toLowerCase();
  if (n === "style") return rewriteCss(value, pageUrl, engine, tabId);
  if (SRCSET_ATTRS.has(n) || n === "srcset" || n === "imagesrcset") {
    return rewriteSrcset(value, pageUrl, engine, tabId);
  }
  if (n === "ping") {
    return value
      .split(/\s+/)
      .map((u) => rewriteAbsoluteUrl(u, pageUrl, engine, tabId))
      .join(" ");
  }
  if (n === "content") {
    if (/url=/i.test(value)) {
      return value.replace(/url\s*=\s*([^\s;]+)/i, (_m, u: string) => {
        return "url=" + rewriteAbsoluteUrl(u.replace(/^["']|["']$/g, ""), pageUrl, engine, tabId);
      });
    }
    if (/^(https?:)?\/\//i.test(value.trim()) || value.trim().startsWith("/")) {
      return rewriteAbsoluteUrl(value.trim(), pageUrl, engine, tabId);
    }
    return value;
  }
  if (URL_ATTRS.has(n) || (n.startsWith("data-") && /src|href|url/i.test(n))) {
    return rewriteAbsoluteUrl(value, pageUrl, engine, tabId);
  }
  return value;
}

function stripDangerous(html: string): string {
  return html
    .replace(/<meta\b[^>]*http-equiv\s*=\s*["']?content-security-policy[^>]*>/gi, "")
    .replace(/\s+integrity\s*=\s*(["'][^"']*["']|[^\s>]+)/gi, "")
    .replace(/\s+nonce\s*=\s*(["'][^"']*["']|[^\s>]+)/gi, "")
    .replace(/\s+crossorigin\s*=\s*(["'][^"']*["']|[^\s>]+)/gi, "")
    .replace(/<meta\b[^>]*http-equiv\s*=\s*["']?x-frame-options[^>]*>/gi, "");
}

export function rewriteHtml(
  html: string,
  pageUrl: string,
  engine: EngineId,
  tabId: string,
  hookScript: string,
): string {
  let out = stripDangerous(html);

  out = out.replace(
    /<(meta)\b([^>]*http-equiv\s*=\s*["']?refresh["']?[^>]*)>/gi,
    (_m, tag: string, attrs: string) => {
      const next = attrs.replace(/\bcontent\s*=\s*(["'])([\s\S]*?)\1/i, (_a, q: string, v: string) => {
        return `content=${q}${rewriteAttrValue("content", v, pageUrl, engine, tabId)}${q}`;
      });
      return `<${tag}${next}>`;
    },
  );

  out = out.replace(/<\s*([a-zA-Z][\w:-]*)\b([^>]*)>/g, (m, tag: string, attrs: string) => {
    if (!attrs) return m;
    if (/\/\s*$/.test(m) && tag.toLowerCase() === "script" && attrs.includes("data-veil")) return m;
    const rewritten = attrs.replace(
      /(\s)([a-zA-Z_:][\w:.-]*)(\s*=\s*)(["'])([\s\S]*?)\4/g,
      (_a, sp: string, name: string, eq: string, q: string, val: string) => {
        const n = name.toLowerCase();
        if (
          URL_ATTRS.has(n) ||
          SRCSET_ATTRS.has(n) ||
          n === "style" ||
          n === "ping" ||
          n === "srcset" ||
          n === "imagesrcset" ||
          n === "content" ||
          (n.startsWith("data-") && /src|href|url/i.test(n))
        ) {
          return `${sp}${name}${eq}${q}${rewriteAttrValue(n, val, pageUrl, engine, tabId)}${q}`;
        }
        return _a;
      },
    );
    return `<${tag}${rewritten}>`;
  });

  out = out.replace(/<style\b([^>]*)>([\s\S]*?)<\/style>/gi, (_m, attrs: string, css: string) => {
    return `<style${attrs}>${rewriteCss(css, pageUrl, engine, tabId)}</style>`;
  });

  const hook = `<script data-veil="hook">${hookScript}</script>`;
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
