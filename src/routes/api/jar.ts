import { createFileRoute } from "@tanstack/react-router";
import { readSid, type StoredCookie } from "@/lib/proxy/cookies";
import { getMemoryJar, setMemoryJar } from "@/lib/proxy/jar-store";

export const Route = createFileRoute("/api/jar")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const sid = readSid(request) || new URL(request.url).searchParams.get("sid") || "";
        return Response.json({ sid, cookies: getMemoryJar(sid) });
      },
      POST: async ({ request }) => {
        const sid = readSid(request);
        if (!sid) return Response.json({ error: "missing session" }, { status: 400 });
        const body = (await request.json()) as { cookies?: StoredCookie[]; userId?: string | null };
        const cookies = Array.isArray(body.cookies) ? body.cookies : [];
        setMemoryJar(sid, cookies, body.userId ?? null);
        return Response.json({ ok: true, count: cookies.length });
      },
    },
  },
});
