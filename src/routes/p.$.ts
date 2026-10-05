import { createFileRoute } from "@tanstack/react-router";
import { handleProxyRequest } from "@/lib/proxy/handler";

async function handle({ request, params }: { request: Request; params: { _splat?: string } }) {
  return handleProxyRequest(request, params._splat ?? "");
}

export const Route = createFileRoute("/p/$")({
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
