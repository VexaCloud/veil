import { cosmeticSelectors, matchesNetworkFilter } from "./adblock";
import { engineFromCode, resolveEscapedSplat, resolveLeakedRequest, serializePageCookie } from "./codec";
import { jarToCookieHeader, parseSetCookie, readSid } from "./cookies";
import { buildUpstreamHeaders, filterResponseHeaders } from "./headers";
import { buildClientHook } from "./hook";
import { getMemoryJar, mergeMemoryCookie, readCfgCookie } from "./jar-store";
import { isCss, isJs, isSvg, rewriteCss, rewriteHtml, rewriteJs, rewriteSvg, sniffHtml } from "./rewrite";
import { assertPublicUrl } from "./ssrf";
import { DEFAULT_NGINX_LAYER, type EngineId, type NginxLayer } from "./types";

const MAX_BODY = 32 * 1024 * 1024;
const MAX_JS_REWRITE = 3 * 1024 * 1024;
const MAX_REDIRECTS = 8;
const TIMEOUT_MS = 25000;

const ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function errorPage(title: string, message: string, url: string): Response {
  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
<style>
  :root { color-scheme: light dark; }
  body { margin:0; min-height:100vh; display:grid; place-items:center; font:15px/1.5 system-ui, sans-serif;
    background:#f8f9fa; color:#202124; }
  main { max-width: 28rem; padding: 2rem; }
  h1 { font-size: 1.25rem; font-weight: 600; letter-spacing: -0.02em; margin: 0 0 .5rem; }
  p { color:#5f6368; margin: 0 0 1rem; }
  code { font: 12px/1.4 ui-monospace, monospace; color:#3c4043; word-break: break-all; }
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
  return s.replace(/[&<>"']/g, (ch) => ENTITIES[ch] ?? ch);
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
  if (m) {
    try {
      return decodeURIComponent((m[1] || m[2] || "").trim());
    } catch {
      return (m[1] || m[2] || "download").trim();
    }
  }
  const last = url.pathname.split("/").filter(Boolean).pop();
  return last || "download";
}

function nginxFromCfg(raw: Record<string, unknown>): NginxLayer {
  return {
    ...DEFAULT_NGINX_LAYER,
    sslServerName: raw.sslServerName !== false,
    forwardFor: !!raw.forwardFor,
    hidePoweredBy: raw.hidePoweredBy !== false,
    hideServer: raw.hideServer !== false,
    extraRequestHeaders: (raw.extraRequestHeaders as Record<string, string>) ?? {},
    extraHideHeaders: Array.isArray(raw.extraHideHeaders)
      ? (raw.extraHideHeaders as string[])
      : DEFAULT_NGINX_LAYER.extraHideHeaders,
    userAgentOverride: typeof raw.userAgentOverride === "string" ? raw.userAgentOverride : "",
  };
}

const HTML_PERMISSIONS =
  "fullscreen=*, pointer-lock=*, accelerometer=*, gyroscope=*, camera=*, microphone=*, geolocation=*, gamepad=*, clipboard-read=*, clipboard-write=*, display-capture=*";

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

  const pageHint = request.headers.get("x-veil-page");
  const reqUrlEarly = new URL(request.url);
  const explicit = reqUrlEarly.searchParams.get("u");
  const leak = reqUrlEarly.searchParams.get("__veil_leak");
  let decoded = resolveEscapedSplat(splat, request.headers.get("referer"), pageHint);
  if (explicit) {
    try {
      const parts = splat.split("/");
      const engine = engineFromCode(parts[0] ?? "") ?? decoded?.engine ?? "nginx";
      const tabId = parts[1] || decoded?.tabId || "tab";
      const targetUrl = explicit.startsWith("http")
        ? new URL(explicit)
        : new URL(explicit, decoded ? new URL(decoded.target).origin : "https://invalid.invalid");
      decoded = { engine, tabId, target: targetUrl.href, stealth: splat.includes("/x.") || !!decoded?.stealth };
    } catch {
      /* keep splat decode */
    }
  }
  if (leak && decoded) {
    try {
      decoded = {
        ...decoded,
        target: new URL(leak, new URL(decoded.target).origin).href,
      };
    } catch {
      /* keep */
    }
  }
  if (!decoded) decoded = resolveLeakedRequest(request);
  if (!decoded) {
    return errorPage("Invalid proxy path", "Veil could not decode that destination.", splat || reqUrlEarly.pathname);
  }

  let target: URL;
  try {
    target = new URL(decoded.target);
    assertPublicUrl(target);
  } catch (err) {
    return errorPage("Blocked destination", err instanceof Error ? err.message : "Invalid URL", decoded.target);
  }

  const cfg = readCfgCookie(request);
  const extra = cfg.extraFilters;
  const stealth = !!cfg.stealth || decoded.stealth;
  if (cfg.adblock && matchesNetworkFilter(target, extra, pageHint || undefined)) {
    return new Response("", { status: 204, headers: { "x-veil-blocked": "adblock", "cache-control": "no-store" } });
  }

  const reqUrl = new URL(request.url);
  const isDl = reqUrl.searchParams.get("_dl") === "1";
  const sid = decoded.tabId.startsWith("priv-") ? decoded.tabId : (readSid(request) || decoded.tabId);
  const jar = getMemoryJar(sid);
  const engine = decoded.engine;

  const dest = (request.headers.get("sec-fetch-dest") ?? "").toLowerCase();
  const accept = request.headers.get("accept") ?? "";
  const isDocument =
    request.method === "GET" &&
    (dest === "document" || dest === "iframe" || dest === "frame" || (!dest && accept.includes("text/html")));

  const nginx = nginxFromCfg(cfg.nginx ?? {});

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
        stealth,
        cookieHeader: jarToCookieHeader(jar, current) || null,
        referer: pageHint || (i === 0 ? null : chain[i - 1]!),
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
    if (parsed) mergeMemoryCookie(sid, parsed, null);
  }

  const ct = (upstream.headers.get("content-type") ?? "").toLowerCase();
  const binary =
    /^(image|audio|video|font|application\/octet-stream|application\/wasm|application\/pdf|application\/zip|application\/gzip|application\/wasm)/.test(
      ct,
    ) || /\.(png|jpe?g|gif|webp|avif|ico|bmp|mp4|webm|mp3|wav|ogg|woff2?|ttf|otf|eot|wasm|pdf|zip)(\?|$)/i.test(current.pathname);

  const outHeaders = filterResponseHeaders(upstream.headers, nginx);
  outHeaders.set("cache-control", "no-store");
  outHeaders.set("x-veil-final-url", finalUrl);
  outHeaders.set("x-veil-engine", engine);
  if (redirectedFrom) outHeaders.set("x-veil-redirected-from", redirectedFrom);
  outHeaders.delete("content-security-policy");
  outHeaders.set("access-control-allow-origin", "*");
  outHeaders.set("access-control-allow-credentials", "true");
  outHeaders.set("x-veil-sid", sid);
  outHeaders.set("permissions-policy", HTML_PERMISSIONS);
  outHeaders.set("document-policy", "force-load-at-top");

  if ((binary && !isDl) || (!ct && dest === "image") || dest === "font" || dest === "video" || dest === "audio") {
    outHeaders.set("content-type", ct || "application/octet-stream");
    return new Response(upstream.body, { status: upstream.status, headers: outHeaders });
  }

  const looksText =
    !ct ||
    /html|css|javascript|ecmascript|json|xml|svg|text\//i.test(ct) ||
    isDownload(upstream.headers) ||
    isDl;

  if (!looksText && request.method === "GET") {
    outHeaders.set("content-type", ct || "application/octet-stream");
    return new Response(upstream.body, { status: upstream.status, headers: outHeaders });
  }

  const buf = new Uint8Array(await upstream.arrayBuffer());
  if (buf.byteLength > MAX_BODY) {
    return errorPage("Response too large", "This file exceeds Veil’s transfer limit.", finalUrl);
  }

  if (!isDl && isDownload(upstream.headers)) {
    const filename = filenameFrom(upstream.headers, current);
    const intercept = `<!doctype html><html><head><meta charset="utf-8"><title>Download</title></head>
<body><script>
parent.postMessage({ns:'veil',type:'download',tabId:${JSON.stringify(decoded.tabId)},url:${JSON.stringify(reqUrl.pathname + reqUrl.search + (reqUrl.search ? "&" : "?") + "_dl=1")},filename:${JSON.stringify(filename)},mime:${JSON.stringify(upstream.headers.get("content-type") || "application/octet-stream")},size:${buf.byteLength}},'*');
</script><p style="font:14px system-ui;padding:2rem">Saving ${escapeHtml(filename)} in Veil…</p></body></html>`;
    return new Response(intercept, {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
    });
  }

  const head = buf.slice(0, 512);

  if (sniffHtml(ct, finalUrl, head)) {
    const html = new TextDecoder("utf-8", { fatal: false }).decode(buf);
    const fromHost = redirectedFrom && redirectedFrom !== finalUrl ? new URL(redirectedFrom).hostname : null;
    const hook = buildClientHook({
      tabId: decoded.tabId,
      engine,
      realUrl: finalUrl,
      redirectedFrom: fromHost,
      stealth,
      webrtcBlock: cfg.webrtcBlock || stealth,
      fingerprintResist: cfg.fingerprintResist || stealth,
      adblock: cfg.adblock,
      cosmetic: cfg.adblock ? cosmeticSelectors(finalUrl, extra) : [],
    });
    const rewritten = rewriteHtml(html, finalUrl, engine, decoded.tabId, hook, stealth);
    outHeaders.set("content-type", "text/html; charset=utf-8");
    outHeaders.append(
      "set-cookie",
      serializePageCookie({ engine, tabId: decoded.tabId, target: finalUrl, stealth }) +
        (reqUrl.protocol === "https:" ? "; Secure" : ""),
    );
    return new Response(rewritten, { status: upstream.status, headers: outHeaders });
  }

  if (isCss(ct, finalUrl)) {
    const css = rewriteCss(new TextDecoder().decode(buf), finalUrl, engine, decoded.tabId, stealth);
    outHeaders.set("content-type", "text/css; charset=utf-8");
    return new Response(css, { status: upstream.status, headers: outHeaders });
  }

  if (isSvg(ct, finalUrl)) {
    const svg = rewriteSvg(new TextDecoder().decode(buf), finalUrl, engine, decoded.tabId, stealth);
    outHeaders.set("content-type", "image/svg+xml; charset=utf-8");
    return new Response(svg, { status: upstream.status, headers: outHeaders });
  }

  if (isJs(ct, finalUrl) && buf.byteLength <= MAX_JS_REWRITE) {
    const js = rewriteJs(new TextDecoder().decode(buf), finalUrl, engine as EngineId, decoded.tabId, stealth);
    outHeaders.set("content-type", ct || "application/javascript; charset=utf-8");
    return new Response(js, { status: upstream.status, headers: outHeaders });
  }

  outHeaders.set("content-type", ct || "application/octet-stream");
  if (isDl) {
    outHeaders.set("content-disposition", `attachment; filename="${filenameFrom(upstream.headers, current)}"`);
  }
  return new Response(buf, { status: upstream.status, headers: outHeaders });
}
