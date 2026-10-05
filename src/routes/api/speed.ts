import { createFileRoute } from "@tanstack/react-router";

const TARGETS = [
  { id: "example", name: "example.com", url: "https://example.com/" },
  { id: "cloudflare", name: "cloudflare.com", url: "https://www.cloudflare.com/cdn-cgi/trace" },
  { id: "brave", name: "search.brave.com", url: "https://search.brave.com/" },
  { id: "wikipedia", name: "wikipedia.org", url: "https://www.wikipedia.org/" },
];

async function ping(url: string): Promise<{ ok: boolean; ms: number; status: number; bytes: number; error?: string }> {
  const t0 = Date.now();
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
        accept: "*/*",
      },
    });
    const buf = await res.arrayBuffer();
    return { ok: res.ok, ms: Date.now() - t0, status: res.status, bytes: buf.byteLength };
  } catch (err) {
    return {
      ok: false,
      ms: Date.now() - t0,
      status: 0,
      bytes: 0,
      error: err instanceof Error ? err.message : "failed",
    };
  }
}

export const Route = createFileRoute("/api/speed")({
  server: {
    handlers: {
      GET: async () => {
        const results = await Promise.all(
          TARGETS.map(async (t) => ({
            ...t,
            ...(await ping(t.url)),
          })),
        );
        const ok = results.filter((r) => r.ok);
        const avg = ok.length ? Math.round(ok.reduce((a, r) => a + r.ms, 0) / ok.length) : null;
        return Response.json({ at: Date.now(), avg, results });
      },
    },
  },
});
