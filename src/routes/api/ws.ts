import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/ws")({
  server: {
    handlers: {
      GET: async () =>
        new Response("Veil WebSocket tunnel. Connect with the Upgrade header from a proxied page.", {
          status: 426,
          headers: {
            "content-type": "text/plain; charset=utf-8",
            upgrade: "websocket",
          },
        }),
    },
  },
});
