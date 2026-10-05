import { BUILTIN_COSMETIC, BUILTIN_NETWORK_FILTERS, compileFilters, matchesNetworkFilter } from "./adblock";
import { decodeProxySplat } from "./codec";
import { jarToCookieHeader, parseSetCookie, readJarFromRequest, setCookieToResponse } from "./cookies";
import { buildUpstreamHeaders, filterResponseHeaders } from "./headers";
import { buildClientHook } from "./hook";
import { isCss, isJs, rewriteCss, rewriteHtml, rewriteJs, sniffHtml } from "./rewrite";
import { assertPublicUrl } from "./ssrf";
import { DEFAULT_NGINX_LAYER, type EngineId, type NginxLayer, type ProxyCfg } from "./types";

const MAX_BODY = 18 * 1024 * 1024;
const MAX_JS_REWRITE = 2 * 1024 * 1024;
const MAX_REDIRECTS = 8;
const TIMEOUT_MS = 22000;

const compiledBuiltin = compileFilters(BUILTIN_NETWORK_FILTERS);

function readCfgCookie(request: Request): ProxyCfg {
  const raw = request.headers.get("cookie") ?? "";
  const match = /(?:^|;\s*)veil_cfg=([^;]+)/.exec(raw);
  if (!match) {
    return {
      adblock: false,
      stealth: false,
      webrtcBlock: false,
      fingerprintResist: false,
      engine: "nginx",
      nginx: DEFAULT_NGINX_LAYER,
    };
  }
  try {
    const parsed = JSON.parse(decodeURIComponent(match[1]!)) as Partial<ProxyCfg>;
    return {
      adblock: !!parsed.adblock,
      stealth: !!parsed.stealth,
      webrtcBlock: !!parsed.webrtcBlock,
      fingerprintResist: !!parsed.fingerprintResist,
      engine: (parsed.engine as EngineId) || "nginx",
      nginx: { ...DEFAULT_NGINX_LAYER, ...(parsed.nginx ?? {}) },
    };
  } catch {
    return {
      adblock: false,
      stealth: false,
      webrtcBlock: false,
      fingerprintResist: false,
      engine: "nginx",
      nginx: DEFAULT_NGINX_LAYER,
    };
  }
}

function extraFilters(request: Request): string[] {
  const raw = request.headers.get("cookie") ?? "";
  const match = /(?:^|;\s*)veil_filters=([^;]+)/.exec(raw);
  if (!match) return [];
  try {
    const parsed = JSON.parse(decodeURIComponent(match[1]!));
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function errorPage(title: string, message: string, url: string): Response {
  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
<style>
  :root { color-scheme: dark; }
  body { margin:0; min-height:100vh; display:grid; place-items:center; font:15px/1.5 Outfit, system-ui, sans-serif;
    background:#0b0c0e; color:#eceef2; }
  main { max-width: 28rem; padding: 2rem; }
  h1 { font-size: 1.25rem; font-weight: 600; letter-spacing: -0.02em; margin: 0 0 .5rem; }
  p { color:#8e939c; margin: 0 0 1rem; }
  code { font: 12px/1.4 ui-monospace, monospace; color:#c9cfd8; word-break: break-all; }
</style></head>
<body><main>
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(message)}</p>
  <code>${escapeHtml(url)}</code>
</main>
<script>try{parent.postMessage({ns:'veil',type:'error',title:${JSON.stringify(title)},message:${JSON.stringify(message)}},'*')}catch(e){}</script>
</body></html>`;
  return new Response(html, {
    status: 502,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case "&":
        return "\u0026amp;";
      case "<":
        return "\u0026lt;";
      case ">":
        return "\u0026gt;";
      case '"':
        return "\u0026quot;";
      default:
        return "\u0026#39;";
    }
  });
}

function collectSetCookies(headers: Headers): string[] {
  const anyHeaders = headers as Headers & { getSetCookie?: () => string[] };
  if (typeof anyHeaders.getSetCookie === "function") return anyHeaders.getSetCookie();
  const single = headers.get("set-cookie");
  return single ? [single] : [];
}

function isDownload(headers: Headers): boolean {
  const cd = headers.get("content-disposition") ?? "";
  return /attachment/i.test(cd);
}

function filenameFrom(headers: Headers, url: URL): string {
  const cd = headers.get("content-disposition") ?? "";
  const m = /filename\*?=(?:UTF-8''|"([^"]+)"|([^;]+))/i.exec(cd);
  if (m) return decodeURIComponent((m[1] || m[2] || "").trim());
  const last = url.pathname.split("/").filter(Boolean).pop();
  return last || "download";
}

function withCookies(res: Response, cookiesOut: string[]): Response {
  for (const c of cookiesOut) res.headers.append("set-cookie", c);
  return res;
}

export async function handleProxyRequest(request: Request, splat: string): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,HEAD,OPTIONS",
        "access-control-allow-headers": request.headers.get("access-control-request-headers") ?? "*",
        "access-control-max-age": "86400",
      },
    });
  }

  const decoded = decodeProxySplat(splat);
  if (!decoded) {
    return errorPage("Invalid proxy path", "Veil could not decode that destination.", splat);
  }

  let target: URL;
  try {
    target = new URL(decoded.target);
    assertPublicUrl(target);
  } catch (err) {
    return errorPage("Blocked destination", err instanceof Error ? err.message : "Invalid URL", decoded.target);
  }

  const cfg = readCfgCookie(request);
  const extra = extraFilters(request);
  const compiled = extra.length ? compileFilters([...BUILTIN_NETWORK_FILTERS, ...extra]) : compiledBuiltin;
  if (cfg.adblock && matchesNetworkFilter(target, compiled)) {
    return new Response("", { status: 204, headers: { "x-veil-blocked": "adblock", "cache-control": "no-store" } });
  }

  const reqUrl = new URL(request.url);
  const isDl = reqUrl.searchParams.get("_dl") === "1";
  const pageHint = request.headers.get("x-veil-page");
  const jar = readJarFromRequest(request, decoded.tabId);
  const cookieHeader = jarToCookieHeader(jar, target) || null;

  const dest = (request.headers.get("sec-fetch-dest") ?? "").toLowerCase();
  const accept = request.headers.get("accept") ?? "";
  const isDocument =
    request.method === "GET" &&
    (dest === "document" || dest === "iframe" || dest === "frame" || (!dest && accept.includes("text/html")));

  const nginx: NginxLayer = cfg.nginx ?? DEFAULT_NGINX_LAYER;
  const engine = decoded.engine;

  const chain: string[] = [target.href];
  let current = target;
  let upstream: Response | null = null;
  const method = request.method === "HEAD" ? "GET" : request.method;
  const body = method === "GET" || method === "HEAD" ? undefined : await request.arrayBuffer();

  try {
    for (let i = 0; i <= MAX_REDIRECTS; i++) {
      const headers = buildUpstreamHeaders({
        incoming: request.headers,
        target: current,
        engine,
        nginx,
        stealth: cfg.stealth,
        cookieHeader: jarToCookieHeader(jar, current) || cookieHeader,
        referer: pageHint,
        isDocument: isDocument && i === 0,
      });
      const ac = AbortSignal.timeout(TIMEOUT_MS);
      upstream = await fetch(current.href, {
        method,
        headers,
        body: i === 0 ? body : undefined,
        redirect: "manual",
        signal: ac,
      });
      const loc = upstream.headers.get("location");
      if (loc && upstream.status >= 300 && upstream.status < 400) {
        const next = new URL(loc, current.href);
        assertPublicUrl(next);
        chain.push(next.href);
        current = next;
        continue;
      }
      break;
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Fetch failed";
    return errorPage("Unable to reach site", msg, target.href);
  }

  if (!upstream) return errorPage("No response", "The upstream server did not respond.", target.href);

  const finalUrl = current.href;
  const redirectedFrom = chain.length > 1 ? chain[0]! : null;

  for (const sc of collectSetCookies(upstream.headers)) {
    const parsed = parseSetCookie(sc, current.hostname);
    if (parsed) jar.push(parsed);
  }

  const buf = new Uint8Array(await upstream.arrayBuffer());
  if (buf.byteLength > MAX_BODY) {
    return errorPage("Response too large", "This file exceeds Veil’s transfer limit.", finalUrl);
  }

  const outHeaders = filterResponseHeaders(upstream.headers, nginx);
  outHeaders.set("cache-control", "no-store");
  outHeaders.set("x-veil-final-url", finalUrl);
  if (redirectedFrom) outHeaders.set("x-veil-redirected-from", redirectedFrom);
  outHeaders.set("x-veil-engine", engine);
  outHeaders.delete("content-security-policy");
  outHeaders.set("access-control-allow-origin", "*");

  const cookiesOut: string[] = [];
  for (const c of jar) {
    cookiesOut.push(setCookieToResponse(c, decoded.tabId, reqUrl));
  }

  if (!isDl && isDownload(upstream.headers)) {
    const filename = filenameFrom(upstream.headers, current);
    const intercept = `<!doctype html><html><head><meta charset="utf-8"><title>Download</title></head>
<body><script>
parent.postMessage({ns:'veil',type:'download',tabId:${JSON.stringify(decoded.tabId)},url:${JSON.stringify(reqUrl.pathname + reqUrl.search + (reqUrl.search ? "&" : "?") + "_dl=1")},filename:${JSON.stringify(filename)},mime:${JSON.stringify(upstream.headers.get("content-type") || "application/octet-stream")},size:${buf.byteLength}},'*');
</script><p style="font:14px system-ui;padding:2rem">Saving ${escapeHtml(filename)}…</p></body></html>`;
    return withCookies(
      new Response(intercept, {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
      }),
      cookiesOut,
    );
  }

  const ct = upstream.headers.get("content-type");
  const head = buf.slice(0, 512);

  if (sniffHtml(ct, finalUrl, head)) {
    const html = new TextDecoder("utf-8", { fatal: false }).decode(buf);
    const fromHost = redirectedFrom && redirectedFrom !== finalUrl ? new URL(redirectedFrom).hostname : null;
    const hook = buildClientHook({
      tabId: decoded.tabId,
      engine,
      realUrl: finalUrl,
      redirectedFrom: fromHost,
      stealth: cfg.stealth,
      webrtcBlock: cfg.webrtcBlock || cfg.stealth,
      fingerprintResist: cfg.fingerprintResist || cfg.stealth,
      adblock: cfg.adblock,
      cosmetic: cfg.adblock ? BUILTIN_COSMETIC : [],
    });
    const rewritten = rewriteHtml(html, finalUrl, engine, decoded.tabId, hook);
    outHeaders.set("content-type", "text/html; charset=utf-8");
    return withCookies(new Response(rewritten, { status: upstream.status, headers: outHeaders }), cookiesOut);
  }

  if (isCss(ct, finalUrl)) {
    const css = rewriteCss(new TextDecoder().decode(buf), finalUrl, engine, decoded.tabId);
    outHeaders.set("content-type", "text/css; charset=utf-8");
    return withCookies(new Response(css, { status: upstream.status, headers: outHeaders }), cookiesOut);
  }

  if (isJs(ct, finalUrl) && buf.byteLength <= MAX_JS_REWRITE) {
    const js = rewriteJs(new TextDecoder().decode(buf), finalUrl, engine, decoded.tabId);
    outHeaders.set("content-type", ct || "application/javascript; charset=utf-8");
    return withCookies(new Response(js, { status: upstream.status, headers: outHeaders }), cookiesOut);
  }

  outHeaders.set("content-type", ct || "application/octet-stream");
  return withCookies(
    new Response(buf, {
      status: upstream.status,
      headers: outHeaders,
    }),
    cookiesOut,
  );
}
