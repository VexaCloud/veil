import { Clock, Plus, Search } from "lucide-react";
import { useBrowserStore, currentSearchEngine, type Bookmark } from "@/lib/browser-store";
import { formatRelative, letterMark, normalizeNavigableUrl } from "@/lib/utils";
import { VeilMark } from "./icons";

export function NewTab({ onGo }: { onGo: (url: string) => void }) {
  const bookmarks = useBrowserStore((s) => s.bookmarks);
  const history = useBrowserStore((s) => s.history);
  const settings = useBrowserStore((s) => s.settings);
  const engine = currentSearchEngine(settings);
  const recent = history.slice(0, 6);

  return (
    <div className="relative flex h-full flex-col overflow-auto veil-scroll">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(1200px 400px at 50% -10%, color-mix(in oklab, var(--veil-ring) 18%, transparent), transparent 70%)",
        }}
      />
      <div className="relative mx-auto flex w-full max-w-3xl flex-col gap-10 px-5 pb-16 pt-16 sm:pt-24">
        <header className="flex flex-col items-center gap-4 text-center">
          <VeilMark className="size-11 text-foreground" />
          <div>
            <h1 className="font-sans text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl">
              Veil
            </h1>
            <p className="mt-2 text-sm text-muted">A private window on the open web.</p>
          </div>
        </header>

        <form
          className="flex items-center gap-2 rounded-xl border border-border bg-surface p-1.5 shadow-[var(--shadow-panel)]"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const q = String(fd.get("q") ?? "");
            const url = normalizeNavigableUrl(q, engine.url);
            if (url) onGo(url);
          }}
        >
          <Search className="ml-3 size-4 shrink-0 text-muted" />
          <input
            name="q"
            autoFocus
            placeholder={`Search ${engine.name} or enter an address`}
            className="h-11 min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted"
          />
          <button
            type="submit"
            className="h-11 rounded-[calc(var(--veil-radius)+2px)] bg-accent px-4 text-sm font-medium text-accent-foreground"
          >
            Go
          </button>
        </form>

        {settings.showShortcutsOnNewTab ? (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xs font-medium uppercase tracking-[0.14em] text-muted">Shortcuts</h2>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {bookmarks.slice(0, 8).map((b) => (
                <ShortcutTile key={b.id} bookmark={b} onGo={onGo} />
              ))}
            </div>
          </section>
        ) : null}

        {recent.length ? (
          <section>
            <div className="mb-3 flex items-center gap-2 text-muted">
              <Clock className="size-3.5" />
              <h2 className="text-xs font-medium uppercase tracking-[0.14em]">Recent</h2>
            </div>
            <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
              {recent.map((h) => (
                <li key={h.id}>
                  <button
                    type="button"
                    onClick={() => onGo(h.url)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-surface-2"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-foreground">{h.title}</span>
                      <span className="block truncate text-xs text-muted">{h.url}</span>
                    </span>
                    <span className="shrink-0 text-xs tabular-nums text-muted">{formatRelative(h.at)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <p className="text-center text-xs text-muted">
          Alt+L address · Alt+T tab · Alt+Shift+N stealth · Alt+, settings
        </p>
      </div>
    </div>
  );
}

function ShortcutTile({ bookmark, onGo }: { bookmark: Bookmark; onGo: (url: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onGo(bookmark.url)}
      className="group flex items-center gap-3 rounded-xl border border-border bg-surface p-3 text-left transition-[background-color,transform] duration-[var(--motion-quick)] hover:bg-surface-2 active:scale-[0.99]"
    >
      <span className="grid size-9 place-items-center rounded-lg bg-surface-2 text-xs font-semibold tracking-wide text-foreground">
        {letterMark(bookmark.title)}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium">{bookmark.title}</span>
        <span className="block truncate text-xs text-muted">{bookmark.url.replace(/^https?:\/\//, "")}</span>
      </span>
    </button>
  );
}

export function EmptyShortcutsHint() {
  return (
    <div className="flex items-center gap-2 text-xs text-muted">
      <Plus className="size-3.5" />
      Pin a site from the star in the address bar.
    </div>
  );
}
