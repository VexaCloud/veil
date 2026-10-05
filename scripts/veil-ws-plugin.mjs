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
 */
export function veilWsPlugin() {
  return {
    name: "veil-ws-proxy",
    apply: "serve",
    configureServer(server) {
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
