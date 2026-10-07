import type { EngineId, NginxLayer } from "./types";

export const CHROME_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

export const CHROME_UA_MAC =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
  "content-encoding",
  "cookie",
  "origin",
  "referer",
]);

const STRIP_RESPONSE = new Set([
  "content-security-policy",
  "content-security-policy-report-only",
  "x-frame-options",
  "x-xss-protection",
  "report-to",
  "nel",
  "clear-site-data",
  "strict-transport-security",
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "alt-svc",
  "expect-ct",
  "cross-origin-opener-policy",
  "cross-origin-embedder-policy",
  "cross-origin-resource-policy",
  "origin-agent-cluster",
]);

function uaForEngine(engine: EngineId, override: string): string {
  if (override.trim()) return override.trim();
  if (engine === "mercury") return CHROME_UA_MAC;
  if (engine === "rammerhead") {
    return "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0";
  }
  return CHROME_UA;
}

export function chromeClientHints(engine: EngineId, stealth: boolean): Record<string, string> {
  if (engine === "rammerhead") {
    return {};
  }
  const hints: Record<string, string> = {
    "sec-ch-ua": '"Chromium";v="131", "Not_A Brand";v="24", "Google Chrome";v="131"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": engine === "mercury" ? '"macOS"' : '"Windows"',
  };
  if (stealth || engine === "ultraviolet" || engine === "scramjet") {
    hints["sec-ch-ua-full-version-list"] =
      '"Chromium";v="131.0.6778.86", "Not_A Brand";v="10.0.0.4", "Google Chrome";v="131.0.6778.86"';
    hints["sec-ch-ua-arch"] = '"x86"';
    hints["sec-ch-ua-bitness"] = '"64"';
    hints["sec-ch-ua-model"] = '""';
    hints["sec-ch-ua-platform-version"] = engine === "mercury" ? '"14.6.0"' : '"15.0.0"';
    hints["upgrade-insecure-requests"] = "1";
  }
  return hints;
}

export function buildUpstreamHeaders(opts: {
  incoming: Headers;
  target: URL;
  engine: EngineId;
  nginx: NginxLayer;
  stealth: boolean;
  cookieHeader: string | null;
  referer: string | null;
  isDocument: boolean;
}): Headers {
  const { incoming, target, engine, nginx, stealth, cookieHeader, referer, isDocument } = opts;
  const out = new Headers();

  incoming.forEach((value, key) => {
    const k = key.toLowerCase();
    if (HOP_BY_HOP.has(k)) return;
    if (k.startsWith("x-veil") || k.startsWith("x-forwarded") || k === "via") return;
    if (k === "accept-encoding") return;
    out.set(key, value);
  });

  out.set("user-agent", uaForEngine(engine, nginx.userAgentOverride));
  out.set("host", target.host);
  out.set("accept-language", stealth ? "en-US,en;q=0.9" : (incoming.get("accept-language") ?? "en-US,en;q=0.9"));
  if (!out.has("accept")) {
    out.set(
      "accept",
      isDocument
        ? "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7"
        : "*/*",
    );
  }

  const hints = chromeClientHints(engine, stealth);
  for (const [k, v] of Object.entries(hints)) {
    if (k.startsWith("sec-fetch") && !isDocument) continue;
    out.set(k, v);
  }
  if (isDocument) {
    out.set("sec-fetch-dest", "document");
    out.set("sec-fetch-mode", "navigate");
    out.set("sec-fetch-site", "none");
    out.set("sec-fetch-user", "?1");
    out.set("upgrade-insecure-requests", "1");
  } else {
    out.set("sec-fetch-dest", incoming.get("sec-fetch-dest") ?? "empty");
    out.set("sec-fetch-mode", incoming.get("sec-fetch-mode") ?? "cors");
    out.set("sec-fetch-site", "same-origin");
  }

  if (referer) {
    try {
      out.set("referer", new URL(referer).href);
      out.set("origin", new URL(referer).origin);
    } catch {
      /* ignore */
    }
  } else if (isDocument) {
    out.delete("referer");
    out.delete("origin");
  } else {
    out.set("origin", target.origin);
    out.set("referer", target.origin + "/");
  }

  if (cookieHeader) out.set("cookie", cookieHeader);
  else out.delete("cookie");

  if (nginx.forwardFor && engine === "nginx" && !stealth) {
    const ip = incoming.get("x-forwarded-for") ?? incoming.get("cf-connecting-ip") ?? "1.1.1.1";
    out.set("x-real-ip", ip.split(",")[0]!.trim());
    out.set("x-forwarded-for", ip.split(",")[0]!.trim());
    out.set("x-forwarded-proto", target.protocol.replace(":", ""));
    out.set("x-forwarded-host", target.host);
  } else {
    out.delete("x-real-ip");
    out.delete("x-forwarded-for");
    out.delete("x-forwarded-proto");
    out.delete("x-forwarded-host");
    out.delete("forwarded");
    out.delete("via");
  }

  for (const [k, v] of Object.entries(nginx.extraRequestHeaders)) {
    if (!k.trim()) continue;
    out.set(k, v);
  }

  if (stealth || engine === "ultraviolet" || engine === "rammerhead" || engine === "scramjet") {
    out.delete("x-forwarded-for");
    out.delete("x-real-ip");
    out.delete("via");
    out.delete("forwarded");
  }

  return out;
}

export function filterResponseHeaders(
  upstream: Headers,
  nginx: NginxLayer,
  extraHide: string[] = [],
): Headers {
  const out = new Headers();
  const hide = new Set([...nginx.extraHideHeaders, ...extraHide].map((h) => h.toLowerCase()));
  if (nginx.hidePoweredBy) hide.add("x-powered-by");
  if (nginx.hideServer) hide.add("server");

  upstream.forEach((value, key) => {
    const k = key.toLowerCase();
    if (STRIP_RESPONSE.has(k) || hide.has(k)) return;
    if (k === "set-cookie") return;
    if (k === "location") return;
    out.set(key, value);
  });
  return out;
}
