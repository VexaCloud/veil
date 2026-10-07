import { Clock, Plus, Search } from "lucide-react";
import { currentSearchEngine, useBrowserStore, type Bookmark } from "@/lib/browser-store";
import { formatRelative, letterMark, normalizeNavigableUrl } from "@/lib/utils";
import { VeilMark } from "./icons";

export function NewTab({ onGo }: { onGo: (url: string) => void }) {
  const bookmarks = useBrowserStore((s) => s.bookmarks);
  const history = useBrowserStore((s) => s.history);
  const settings = useBrowserStore((s) => s.settings);
  const session = useBrowserStore((s) => s.session);
  const engine = currentSearchEngine(settings);
  const recent = session.kind === "guest" ? [] : history.slice(0, 6);

  return (
    <div className="relative flex h-full flex-col overflow-auto bg-surface veil-scroll">
      <div className="relative mx-auto flex w-full max-w-3xl flex-col gap-10 px-5 pb-16 pt-16 sm:pt-24">
        <header className="flex flex-col items-center gap-3 text-center">
          <VeilMark className="size-12 text-foreground" />
          <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Veil</h1>
          <p className="text-sm text-muted">Search or enter an address</p>
        </header>

        <form
          className="flex items-center gap-2 rounded-xl border border-border bg-background p-1.5 shadow-[var(--shadow-panel)]"
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
            className="h-12 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted"
          />
          <button type="submit" className="h-12 rounded-lg bg-accent px-5 text-sm font-medium text-accent-foreground">
            Go
          </button>
        </form>

        {bookmarks.length ? (
          <section>
            <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-muted">Shortcuts</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {bookmarks.slice(0, 8).map((b) => (
                <ShortcutTile key={b.id} bookmark={b} onGo={onGo} />
              ))}
            </div>
          </section>
        ) : (
          <p className="flex items-center justify-center gap-2 text-sm text-muted">
            <Plus className="size-4" />
            Star a site in the address bar to pin it here.
          </p>
        )}

        {recent.length ? (
          <section>
            <div className="mb-3 flex items-center gap-2 text-muted">
              <Clock className="size-3.5" />
              <h2 className="text-xs font-medium uppercase tracking-[0.14em]">Recent</h2>
            </div>
            <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-background">
              {recent.map((h) => (
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
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function ShortcutTile({ bookmark, onGo }: { bookmark: Bookmark; onGo: (url: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onGo(bookmark.url)}
      className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 text-left hover:bg-surface-2"
    >
      <span className="grid size-10 place-items-center rounded-lg bg-surface-2 text-xs font-semibold">
        {letterMark(bookmark.title)}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium">{bookmark.title}</span>
        <span className="block truncate text-xs text-muted">{bookmark.url.replace(/^https?:\/\//, "")}</span>
      </span>
    </button>
  );
}
