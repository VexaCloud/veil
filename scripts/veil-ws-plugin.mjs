import { WebSocketServer } from "ws";

/** Block obvious local / metadata hosts — same spirit as src/lib/proxy/ssrf.ts. */
function isBlockedHost(hostname) {
  const host = String(hostname || "")
    .replace(/\.+$/, "")
    .toLowerCase();
  if (!host) return true;
  if (
    host === "localhost" ||
    host === "localhost.localdomain" ||
    host.endsWith(".localhost") ||
    host.endsWith(".internal") ||
    host.endsWith(".local") ||
    host.includes("metadata.google")
  ) {
    return true;
  }
  if (host === "::1" || host.startsWith("127.") || host.startsWith("10.") || host.startsWith("192.168.") || host.startsWith("169.254.")) {
    return true;
  }
  return false;
}

/**
 * Live-preview WebSocket tunnel for proxied pages. The client hook rewrites
 * `new WebSocket(url)` to `/api/ws?u=…&tab=…`. Production serverless cannot
 * hold a socket; `npm start` (Vite) can.
 *
 * Also rewrites leaked same-origin paths (`/assets/foo.png` from a proxied
 * document) onto `/p/{code}/{tab}/?__veil_leak=…` so the handler can resolve
 * them against the real site origin.
 */
export function veilWsPlugin() {
  return {
    name: "veil-ws-proxy",
    apply: "serve",
    configureServer(server) {
      const APP_PREFIXES = [
        "/src/",
        "/@",
        "/node_modules",
        "/api/",
        "/hacker114",
        "/veil-sw",
        "/p/",
      ];
      function isAppPath(pathOnly) {
        return APP_PREFIXES.some((p) => pathOnly.startsWith(p) || pathOnly === p.replace(/\/$/, ""));
      }
      function proxyBits(ref) {
        try {
          const refUrl = new URL(ref);
          const bits = refUrl.pathname.split("/").filter(Boolean);
          if (bits[0] !== "p" || bits.length < 3) return null;
          return { code: bits[1], tab: bits[2] };
        } catch {
          return null;
        }
      }
      server.middlewares.use((req, _res, next) => {
        try {
          const raw = req.url ?? "/";
          const pathOnly = raw.split("?", 1)[0] ?? "/";
          const ref = String(req.headers.referer || req.headers.referrer || "");
          const parent = proxyBits(ref);
          if (!parent) {
            next();
            return;
          }
          if (isAppPath(pathOnly)) {
            next();
            return;
          }
          const dest = String(req.headers["sec-fetch-dest"] || "").toLowerCase();
          const isTopDocument = dest === "document" && pathOnly === "/" && !ref.includes("/p/");
          if (isTopDocument) {
            next();
            return;
          }
          const leak = pathOnly + (raw.includes("?") ? raw.slice(raw.indexOf("?")) : "");
          req.url = `/p/${parent.code}/${parent.tab}/r?__veil_leak=${encodeURIComponent(leak)}`;
        } catch {
          /* fall through */
        }
        next();
      });

      const wss = new WebSocketServer({ noServer: true });
      server.httpServer?.on("upgrade", (req, socket, head) => {
        const raw = req.url ?? "";
        const pathOnly = raw.split("?", 1)[0] ?? "";
        if (pathOnly !== "/api/ws") return;
        wss.handleUpgrade(req, socket, head, (client) => {
          const url = new URL(raw, "http://veil.local");
          const target = url.searchParams.get("u") || "";
          let parsed;
          try {
            parsed = new URL(target);
            if (parsed.protocol !== "ws:" && parsed.protocol !== "wss:") {
              throw new Error("unsupported protocol");
            }
            if (isBlockedHost(parsed.hostname)) {
              throw new Error("blocked host");
            }
          } catch {
            try {
              client.close(1008, "blocked");
            } catch {
              /* ignore */
            }
            return;
          }

          let upstream;
          try {
            upstream = new WebSocket(parsed.href);
          } catch {
            try {
              client.close(1011, "upstream");
            } catch {
              /* ignore */
            }
            return;
          }

          const closeBoth = (code, reason) => {
            try {
              if (client.readyState === 1) client.close(code, reason);
            } catch {
              /* ignore */
            }
            try {
              if (upstream.readyState === 1) upstream.close();
            } catch {
              /* ignore */
            }
          };

          upstream.addEventListener("open", () => {
            client.on("message", (data) => {
              if (upstream.readyState !== WebSocket.OPEN) return;
              try {
                upstream.send(data);
              } catch {
                /* ignore */
              }
            });
          });
          upstream.addEventListener("message", (ev) => {
            if (client.readyState !== 1) return;
            try {
              client.send(ev.data);
            } catch {
              /* ignore */
            }
          });
          upstream.addEventListener("close", (ev) => closeBoth(ev.code || 1000, ev.reason));
          upstream.addEventListener("error", () => closeBoth(1011, "upstream error"));
          client.on("close", () => {
            try {
              upstream.close();
            } catch {
              /* ignore */
            }
          });
          client.on("error", () => closeBoth(1011, "client error"));
        });
      });
    },
  };
}
