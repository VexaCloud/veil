/* Veil service worker — sends escaped same-origin fetches back through /p/ */
const PREFIX = "/p/";
const APP = [
  /^\/src\//,
  /^\/@/,
  /^\/node_modules/,
  /^\/api\//,
  /^\/hacker114/,
  /^\/veil-sw/,
];

function isApp(path) {
  return APP.some((re) => re.test(path));
}

function decodeProxyHref(href) {
  try {
    const u = new URL(href, self.location.origin);
    if (!u.pathname.startsWith(PREFIX)) return null;
    const parts = u.pathname.slice(PREFIX.length).split("/").filter(Boolean);
    if (parts.length < 2) return null;
    return { code: parts[0], tab: parts[1] };
  } catch {
    return null;
  }
}

self.addEventListener("install", (e) => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith(PREFIX)) return;

  const ref = req.referrer || req.headers.get("referer") || "";
  const parent = decodeProxyHref(ref);
  if (!parent) return;
  if (isApp(url.pathname)) return;

  const leak = url.pathname + url.search;
  const rewritten = `${PREFIX}${parent.code}/${parent.tab}/r?__veil_leak=${encodeURIComponent(leak)}`;
  const headers = new Headers(req.headers);
  if (ref) headers.set("referer", ref);
  event.respondWith(
    fetch(
      new Request(rewritten, {
        method: req.method,
        headers,
        body: req.method === "GET" || req.method === "HEAD" ? undefined : req.body,
        redirect: "manual",
        mode: "same-origin",
        credentials: req.credentials,
      }),
    ),
  );
});
