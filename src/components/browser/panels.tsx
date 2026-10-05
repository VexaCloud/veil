import { useEffect, useState } from "react";
import {
  Download,
  Gauge,
  Keyboard,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBrowserStore, type Overlay } from "@/lib/browser-store";
import { formatBytes, formatRelative } from "@/lib/utils";
import { SettingsPanel } from "./settings-panel";

export function OverlayHost({
  overlay,
  onClose,
  onGo,
}: {
  overlay: Overlay;
  onClose: () => void;
  onGo: (url: string) => void;
}) {
  if (overlay === "none") return null;
  const title =
    overlay === "settings"
      ? "Settings"
      : overlay === "history"
        ? "History"
        : overlay === "downloads"
          ? "Downloads"
          : overlay === "devtools"
            ? "Developer tools"
            : overlay === "shortcuts"
              ? "Keyboard shortcuts"
              : overlay === "speed"
                ? "Speed / latency"
                : overlay === "theme"
                  ? "Theme"
                  : "";

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-background/80 p-0 sm:p-6">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-5xl flex-col overflow-hidden border-border bg-surface shadow-[var(--shadow-panel)] sm:rounded-xl sm:border">
        <header className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
          <h2 className="text-sm font-medium">{title}</h2>
          <button type="button" className="grid size-9 place-items-center rounded-md hover:bg-surface-2" onClick={onClose} aria-label="Close">
            <X className="size-4" />
          </button>
        </header>
        <div className="min-h-0 flex-1">
          {overlay === "settings" || overlay === "theme" ? (
            <SettingsPanel onJump={(o) => useBrowserStore.getState().setOverlay(o)} />
          ) : null}
          {overlay === "history" ? <HistoryPanel onGo={onGo} /> : null}
          {overlay === "downloads" ? <DownloadsPanel /> : null}
          {overlay === "devtools" ? <DevtoolsPanel /> : null}
          {overlay === "shortcuts" ? <ShortcutsPanel /> : null}
          {overlay === "speed" ? <SpeedPanel /> : null}
        </div>
      </div>
    </div>
  );
}

function HistoryPanel({ onGo }: { onGo: (url: string) => void }) {
  const history = useBrowserStore((s) => s.history);
  const clearHistory = useBrowserStore((s) => s.clearHistory);
  const [q, setQ] = useState("");
  const filtered = history.filter(
    (h) => h.title.toLowerCase().includes(q.toLowerCase()) || h.url.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border p-3">
        <Search className="size-4 text-muted" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search history" className="h-9" />
        <Button variant="ghost" size="sm" onClick={clearHistory}>
          <Trash2 className="size-4" /> Clear
        </Button>
      </div>
      <ul className="flex-1 overflow-auto veil-scroll">
        {filtered.length === 0 ? (
          <li className="px-4 py-10 text-center text-sm text-muted">No history yet.</li>
        ) : (
          filtered.map((h) => (
            <li key={h.id}>
              <button
                type="button"
                onClick={() => onGo(h.url)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-surface-2"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm">{h.title}</span>
                  <span className="block truncate text-xs text-muted">{h.url}</span>
                </span>
                <span className="shrink-0 text-xs tabular-nums text-muted">{formatRelative(h.at)}</span>
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function DownloadsPanel() {
  const downloads = useBrowserStore((s) => s.downloads);
  const clearDownloads = useBrowserStore((s) => s.clearDownloads);
  return (
    <div className="flex h-full flex-col">
      <div className="flex justify-end border-b border-border p-3">
        <Button variant="ghost" size="sm" onClick={clearDownloads}>
          Clear
        </Button>
      </div>
      <ul className="flex-1 overflow-auto veil-scroll">
        {downloads.length === 0 ? (
          <li className="px-4 py-10 text-center text-sm text-muted">No downloads yet.</li>
        ) : (
          downloads.map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm">{d.filename}</p>
                <p className="text-xs text-muted">
                  {formatBytes(d.size)} · {d.status} · {formatRelative(d.at)}
                </p>
              </div>
              {d.href ? (
                <a href={d.href} download={d.filename} className="text-sm text-ring underline-offset-2 hover:underline">
                  Save
                </a>
              ) : (
                <Download className="size-4 text-muted" />
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export function DevtoolsDock() {
  const nets = useBrowserStore((s) => s.nets);
  const consoles = useBrowserStore((s) => s.consoles);
  const inspect = useBrowserStore((s) => s.inspect);
  const inspectOn = useBrowserStore((s) => s.inspectOn);
  const setInspectOn = useBrowserStore((s) => s.setInspectOn);
  const [tab, setTab] = useState<"elements" | "console" | "network">("network");
  const [code, setCode] = useState("");

  return (
    <div className="flex h-56 flex-col border-t border-border bg-background">
      <div className="flex h-9 items-center gap-1 border-b border-border px-2">
        {(["elements", "console", "network"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`h-7 rounded-md px-2 text-xs capitalize ${tab === t ? "bg-surface-2" : "text-muted"}`}
          >
            {t}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setInspectOn(!inspectOn)}
          className={`ml-auto h-7 rounded-md px-2 text-xs ${inspectOn ? "bg-accent text-accent-foreground" : "text-muted"}`}
        >
          Inspect
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-auto font-mono text-xs veil-scroll">
        {tab === "network"
          ? nets
              .slice()
              .reverse()
              .map((n) => (
                <div key={n.id} className="grid grid-cols-[52px_1fr_48px_56px] gap-2 border-b border-border px-3 py-1.5">
                  <span className="text-muted">{n.method}</span>
                  <span className="truncate">{n.url}</span>
                  <span className="tabular-nums">{n.status ?? n.phase}</span>
                  <span className="tabular-nums text-muted">{n.ms ? `${n.ms}ms` : ""}</span>
                </div>
              ))
          : null}
        {tab === "console"
          ? consoles
              .slice()
              .reverse()
              .map((c) => (
                <div key={c.id} className="border-b border-border px-3 py-1.5">
                  <span className="mr-2 uppercase text-muted">{c.level}</span>
                  {c.args.join(" ")}
                </div>
              ))
          : null}
        {tab === "elements" ? (
          <div className="p-3">
            <p className="mb-2 text-muted">
              {inspectOn ? "Click an element in the page." : "Turn on Inspect, then click in the page."}
            </p>
            {inspect ? (
              <>
                <p className="mb-2 text-ring">{inspect.tag}</p>
                {inspect.styles ? (
                  <pre className="mb-2 whitespace-pre-wrap text-muted">
                    {Object.entries(inspect.styles)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join("\n")}
                  </pre>
                ) : null}
                <pre className="whitespace-pre-wrap break-all">{inspect.html}</pre>
              </>
            ) : null}
          </div>
        ) : null}
      </div>
      {tab === "console" ? (
        <form
          className="flex border-t border-border"
          onSubmit={(e) => {
            e.preventDefault();
            window.dispatchEvent(new CustomEvent("veil:eval", { detail: code }));
            setCode("");
          }}
        >
          <span className="grid size-9 place-items-center text-muted">›</span>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="h-9 flex-1 bg-transparent font-mono text-xs outline-none"
            placeholder="Evaluate in page"
          />
        </form>
      ) : null}
    </div>
  );
}

function DevtoolsPanel() {
  return <DevtoolsDock />;
}

function ShortcutsPanel() {
  const rows: [string, string][] = [
    ["Alt + T", "New tab"],
    ["Alt + W", "Close tab"],
    ["Alt + Shift + T", "Reopen closed tab"],
    ["Alt + L / Alt + D", "Focus address bar"],
    ["Alt + R", "Reload"],
    ["Alt + [", "Back"],
    ["Alt + ]", "Forward"],
    ["Alt + 1–8", "Switch tab"],
    ["Alt + 9", "Last tab"],
    ["Alt + + / −", "Zoom"],
    ["Alt + 0", "Reset zoom"],
    ["Alt + Shift + I", "Developer tools"],
    ["Alt + H", "History"],
    ["Alt + J", "Downloads"],
    ["Alt + ,", "Settings"],
    ["Alt + Shift + N", "Stealth mode"],
    ["Alt + N", "New tab with home"],
  ];
  return (
    <div className="overflow-auto p-5 veil-scroll">
      <p className="mb-4 flex items-center gap-2 text-sm text-muted">
        <Keyboard className="size-4" />
        Shortcuts use Alt / Option instead of Control so they work inside this tab.
      </p>
      <ul className="mx-auto max-w-lg divide-y divide-border overflow-hidden rounded-xl border border-border">
        {rows.map(([k, v]) => (
          <li key={k} className="flex items-center justify-between px-4 py-2.5 text-sm">
            <span>{v}</span>
            <kbd className="rounded-md bg-surface-2 px-2 py-1 font-mono text-xs text-muted">{k}</kbd>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SpeedPanel() {
  const [data, setData] = useState<{
    avg: number | null;
    results: { id: string; name: string; ok: boolean; ms: number; status: number; bytes: number; error?: string }[];
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function run() {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/speed");
      if (!res.ok) throw new Error("Speed test failed");
      setData(await res.json());
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void run();
  }, []);

  return (
    <div className="overflow-auto p-5 veil-scroll">
      <div className="mx-auto max-w-lg">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Average TTFB</p>
            <p className="font-sans text-4xl font-semibold tabular-nums tracking-tight">
              {data?.avg != null ? `${data.avg}ms` : busy ? "…" : "—"}
            </p>
          </div>
          <Button onClick={() => void run()} disabled={busy}>
            <Gauge className="size-4" /> {busy ? "Testing" : "Run again"}
          </Button>
        </div>
        {err ? <p className="mb-3 text-sm text-danger">{err}</p> : null}
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
          {(data?.results ?? []).map((r) => (
            <li key={r.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <span>
                {r.name}
                <span className="ml-2 text-xs text-muted">{r.ok ? r.status : r.error}</span>
              </span>
              <span className="tabular-nums">{r.ms}ms</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
