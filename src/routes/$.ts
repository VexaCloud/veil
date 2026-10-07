import { createFileRoute } from "@tanstack/react-router";
import { handleProxyRequest } from "@/lib/proxy/handler";

async function handle({ request }: { request: Request }) {
  return handleProxyRequest(request, "");
}

export const Route = createFileRoute("/$")({
  server: {
    handlers: {
      GET: handle,
      POST: handle,
      PUT: handle,
      PATCH: handle,
      DELETE: handle,
      HEAD: handle,
      OPTIONS: handle,
    },
  },
});
