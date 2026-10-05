import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { Toaster, toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  Ellipsis,
  Home,
  Lock,
  Plus,
  RotateCw,
  Settings,
  Shield,
  ShieldOff,
  Square,
  Star,
  X,
} from "lucide-react";
import { encodeProxyPath } from "@/lib/proxy/codec";
import {
  currentSearchEngine,
  useBrowserStore,
  type TabState,
} from "@/lib/browser-store";
import { cn, hostnameOf, normalizeNavigableUrl, prettyUrl } from "@/lib/utils";
import { LockScreen } from "./lock-screen";
import { NewTab } from "./new-tab";
import { DevtoolsDock, OverlayHost } from "./panels";

export function BrowserShell() {
  const hydrated = useBrowserStore((s) => s.hydrated);
  const locked = useBrowserStore((s) => s.locked);
  const setHydrated = useBrowserStore((s) => s.setHydrated);
  const setLocked = useBrowserStore((s) => s.setLocked);
  const settings = useBrowserStore((s) => s.settings);

  useEffect(() => {
    void Promise.resolve(useBrowserStore.persist.rehydrate()).then(() => {
      const s = useBrowserStore.getState();
      setHydrated(true);
      if (s.settings.lockEnabled && s.settings.lockHash) setLocked(true);
    });
  }, [setHydrated, setLocked]);

  useEffect(() => {
    if (!hydrated) return;
    applyTheme(settings);
    writeCfgCookie(settings);
  }, [hydrated, settings]);

  if (locked) return <LockScreen />;
  return <Chrome />;
}

function applyTheme(settings: ReturnType<typeof useBrowserStore.getState>["settings"]) {
  const root = document.documentElement;
  const theme = settings.theme;
  let light = theme.mode === "light";
  if (theme.mode === "system") {
    light = window.matchMedia("(prefers-color-scheme: light)").matches;
  }
  if (light) root.dataset.theme = "light";
  else delete root.dataset.theme;
  root.style.setProperty("--veil-bg", theme.bg);
  root.style.setProperty("--veil-fg", theme.fg);
  root.style.setProperty("--veil-accent", theme.accent);
  root.style.setProperty("--veil-font", theme.font);
  root.style.setProperty("--veil-mono", theme.mono);
  root.style.setProperty("--veil-radius", `${theme.radius}px`);
  if (light) {
    root.style.setProperty("--veil-accent-fg", theme.bg);
  } else {
    root.style.setProperty("--veil-accent-fg", theme.bg);
  }
}

function writeCfgCookie(settings: ReturnType<typeof useBrowserStore.getState>["settings"]) {
  const cfg = {
    adblock: settings.adblock,
    stealth: settings.stealth || settings.fingerprintResist,
    webrtcBlock: settings.webrtcBlock || settings.stealth,
    fingerprintResist: settings.fingerprintResist || settings.stealth,
    engine: settings.engine,
    nginx: settings.nginx,
  };
  document.cookie = `veil_cfg=${encodeURIComponent(JSON.stringify(cfg))}; path=/p/; SameSite=Lax`;
  document.cookie = `veil_filters=${encodeURIComponent(JSON.stringify(settings.filterLists.slice(0, 80)))}; path=/p/; SameSite=Lax`;
}

function Chrome() {
  const tabs = useBrowserStore((s) => s.tabs);
  const activeId = useBrowserStore((s) => s.activeId);
  const settings = useBrowserStore((s) => s.settings);
  const overlay = useBrowserStore((s) => s.overlay);
  const bookmarks = useBrowserStore((s) => s.bookmarks);
  const addressDraft = useBrowserStore((s) => s.addressDraft);
  const inspectOn = useBrowserStore((s) => s.inspectOn);
  const store = useBrowserStore;
  const tab = tabs.find((t) => t.id === activeId) ?? tabs[0]!;
  const addressRef = useRef<HTMLInputElement>(null);
  const frames = useRef<Record<string, HTMLIFrameElement | null>>({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [tabsOpen, setTabsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const devtools = overlay === "devtools";

  const go = (raw: string, opts?: { replace?: boolean }) => {
    const se = currentSearchEngine(store.getState().settings);
    const url = normalizeNavigableUrl(raw, se.url);
    if (!url) return;
    store.getState().navigate(tab.id, url, { fromUser: true, replace: opts?.replace });
    store.getState().setOverlay("none");
  };

  useHotkeys(addressRef, tab);

  useEffect(() => {
    const onMsg = (ev: MessageEvent) => {
      const d = ev.data;
      if (!d || d.ns !== "veil") return;
      const st = store.getState();
      const id = (d.tabId as string) || st.activeId;
      if (d.type === "meta" || d.type === "ready" || d.type === "navigate" || d.type === "history") {
        const url = d.url as string | undefined;
        const title = d.title as string | undefined;
        const redirectedFrom = (d.redirectedFrom as string | null | undefined) ?? null;
        st.updateTab(id, {
          loading: false,
          ...(url ? { displayUrl: url, redirectedFrom } : {}),
          ...(title ? { title } : {}),
          ...(d.favicon ? { favicon: String(d.favicon) } : {}),
        });
        if (url) {
          st.setAddressDraft(url);
          st.pushHistory(url, title || hostnameOf(url));
        }
        if (d.type === "ready" || d.type === "meta") {
          const frame = frames.current[id];
          const origin = url ? (() => { try { return new URL(url).origin; } catch { return ""; } })() : "";
          const passwords = origin
            ? st.passwords.filter((p) => p.origin === origin || p.origin.startsWith(origin) || origin.startsWith(p.origin))
            : st.passwords;
          if (passwords.length && frame?.contentWindow) {
            frame.contentWindow.postMessage({ ns: "veil", type: "autofill", passwords }, "*");
          }
        }
      }
      if (d.type === "error") {
        st.updateTab(id, { loading: false, crash: String(d.message || d.title || "Error") });
        if (st.settings.logging.error) st.log("error", String(d.message || d.title), tab.url);
      }
      if (d.type === "console") {
        st.pushConsole({ level: d.level, args: d.args ?? [] });
        if (st.settings.logging.console) st.log("console", (d.args ?? []).join(" "));
      }
      if (d.type === "net") {
        st.pushNet({
          method: d.method || "GET",
          url: d.url,
          status: d.status,
          ms: d.ms,
          phase: d.phase,
        });
        if (st.settings.logging.net && d.phase === "end") st.log("net", `${d.status ?? ""} ${d.url}`, d.url);
      }
      if (d.type === "inspect") st.setInspect(d);
      if (d.type === "open" && d.url) st.newTab(d.url);
      if (d.type === "save-password" && d.origin && d.password) {
        st.upsertPassword({ origin: String(d.origin), username: String(d.username || ""), password: String(d.password) });
      }
      if (d.type === "download") {
        void handleDownload(d);
      }
    };
    window.addEventListener("message", onMsg);
    const onEval = (e: Event) => {
      const code = (e as CustomEvent).detail as string;
      const frame = frames.current[tab.id];
      frame?.contentWindow?.postMessage({ ns: "veil", type: "eval", code }, "*");
    };
    window.addEventListener("veil:eval", onEval);
    return () => {
      window.removeEventListener("message", onMsg);
      window.removeEventListener("veil:eval", onEval);
    };
  }, [store, tab.id, tab.url]);

  useEffect(() => {
    const frame = frames.current[tab.id];
    frame?.contentWindow?.postMessage({ ns: "veil", type: "inspect", on: inspectOn }, "*");
  }, [inspectOn, tab.id, tab.frameKey]);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  const bookmarked = bookmarks.some((b) => b.url === tab.url);

  const src = (() => {
    if (!tab.url) return null;
    try {
      return encodeProxyPath(settings.engine, tab.id, tab.url);
    } catch {
      return null;
    }
  })();

  const tabBar = (
    <TabBar
      tabs={tabs}
      activeId={tab.id}
      onNew={() => store.getState().newTab()}
      onClose={(id) => store.getState().closeTab(id)}
      onActivate={(id) => store.getState().activate(id)}
    />
  );

  return (
    <div
      className="veil-chrome flex h-dvh min-h-0 flex-col bg-background text-foreground"
      data-density={settings.theme.density}
    >
      {settings.theme.customCss ? <style id="veil-custom-css">{settings.theme.customCss}</style> : null}
      <Toaster theme={settings.theme.mode === "light" ? "light" : "dark"} position="bottom-right" />

      {settings.layout.tabPosition === "top" ? tabBar : null}

      <div
        className="flex items-center gap-1 border-b border-border bg-surface px-1.5"
        style={{ height: "var(--nav-h)" }}
      >
        <IconBtn
          label="Back"
          disabled={tab.stackIndex <= 0}
          onClick={() => store.getState().back(tab.id)}
        >
          <ArrowLeft />
        </IconBtn>
        <IconBtn
          label="Forward"
          disabled={tab.stackIndex >= tab.stack.length - 1}
          onClick={() => store.getState().forward(tab.id)}
        >
          <ArrowRight />
        </IconBtn>
        {tab.loading ? (
          <IconBtn label="Stop" onClick={() => store.getState().stop(tab.id)}>
            <Square className="size-3.5 fill-current" />
          </IconBtn>
        ) : (
          <IconBtn label="Reload" onClick={() => store.getState().reload(tab.id)}>
            <RotateCw />
          </IconBtn>
        )}
        <IconBtn
          label="Home"
          onClick={() => {
            if (settings.homeUrl) go(settings.homeUrl);
            else {
              store.getState().updateTab(tab.id, {
                url: "",
                displayUrl: "",
                title: "New tab",
                redirectedFrom: null,
                loading: false,
              });
              store.getState().setAddressDraft("");
            }
          }}
        >
          <Home />
        </IconBtn>

        <form
          className="mx-1 flex min-w-0 flex-1 items-center gap-2 rounded-full border border-border bg-background px-3"
          style={{ height: "calc(var(--nav-h) - 10px)" }}
          onSubmit={(e) => {
            e.preventDefault();
            go(addressDraft);
          }}
        >
          {settings.stealth ? (
            <Shield className="size-3.5 shrink-0 text-ok" />
          ) : (
            <ShieldOff className="size-3.5 shrink-0 text-muted" />
          )}
          <input
            ref={addressRef}
            value={addressDraft}
            onChange={(e) => store.getState().setAddressDraft(e.target.value)}
            onFocus={(e) => e.currentTarget.select()}
            spellCheck={false}
            placeholder="Search or enter address"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
            aria-label="Address"
          />
          {tab.redirectedFrom ? (
            <span className="hidden max-w-[40%] truncate rounded-full bg-surface-2 px-2 py-0.5 text-xs text-muted sm:inline">
              redirected from {tab.redirectedFrom}
            </span>
          ) : null}
          <button
            type="button"
            className={cn("grid size-8 place-items-center rounded-full", bookmarked ? "text-warn" : "text-muted")}
            aria-label="Bookmark"
            onClick={() => {
              if (!tab.url) return;
              if (bookmarked) {
                const b = bookmarks.find((x) => x.url === tab.url);
                if (b) store.getState().removeBookmark(b.id);
              } else {
                store.getState().addBookmark({ title: tab.title, url: tab.url });
                toast.success("Saved to shortcuts");
              }
            }}
          >
            <Star className={cn("size-3.5", bookmarked && "fill-current")} />
          </button>
        </form>

        <IconBtn
          label="Stealth mode"
          onClick={() => {
            if (settings.stealth) {
              store.getState().patchSettings({ stealth: false });
              toast("Stealth off");
            } else {
              store.getState().applyStealth();
              toast.success("Stealth mode on");
            }
          }}
        >
          <Lock className={settings.stealth ? "text-ok" : ""} />
        </IconBtn>
        <div className="relative" ref={menuRef}>
          <IconBtn label="Menu" onClick={() => setMenuOpen((v) => !v)}>
            <Ellipsis />
          </IconBtn>
          {menuOpen ? (
            <div className="absolute right-0 top-[calc(100%+6px)] z-40 w-56 overflow-hidden rounded-lg border border-border bg-surface py-1 shadow-[var(--shadow-panel)]">
              {[
                ["Settings", () => store.getState().setOverlay("settings")],
                ["History", () => store.getState().setOverlay("history")],
                ["Downloads", () => store.getState().setOverlay("downloads")],
                ["Developer tools", () => store.getState().setOverlay("devtools")],
                ["Speed test", () => store.getState().setOverlay("speed")],
                ["Keyboard shortcuts", () => store.getState().setOverlay("shortcuts")],
              ].map(([label, fn]) => (
                <button
                  key={String(label)}
                  type="button"
                  className="flex h-9 w-full items-center px-3 text-left text-sm hover:bg-surface-2"
                  onClick={() => {
                    (fn as () => void)();
                    setMenuOpen(false);
                  }}
                >
                  {label as string}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {settings.layout.bookmarkBar && bookmarks.length ? (
        <div className="flex h-9 items-center gap-1 overflow-x-auto border-b border-border bg-background px-2 veil-scroll">
          {bookmarks.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => go(b.url)}
              className="h-7 shrink-0 rounded-md px-2 text-xs text-muted hover:bg-surface-2 hover:text-foreground"
            >
              {b.title}
            </button>
          ))}
        </div>
      ) : null}

      {tab.loading ? <div className="veil-loading-bar" /> : <div className="h-px bg-border" />}

      <div className="relative flex min-h-0 flex-1 bg-background">
        {settings.layout.sidebar !== "none" ? (
          <ChromeSidebar
            kind={settings.layout.sidebar}
            onGo={(url) => go(url)}
          />
        ) : null}
        <div className="relative min-h-0 min-w-0 flex-1">
        {tabs.map((t) => (
          <div
            key={t.id}
            className={cn("absolute inset-0", t.id === tab.id ? "z-10" : "pointer-events-none invisible")}
            aria-hidden={t.id !== tab.id}
          >
            {t.id !== tab.id ? null : t.url && src ? (
              <iframe
                ref={(el) => {
                  frames.current[t.id] = el;
                }}
                key={`${t.id}-${t.frameKey}-${settings.engine}`}
                title={t.title}
                src={src}
                className="h-full w-full border-0 bg-background"
                style={{ transform: t.zoom === 1 ? undefined : `scale(${t.zoom})`, transformOrigin: "0 0" }}
                onLoad={() => store.getState().updateTab(t.id, { loading: false })}
              />
            ) : (
              <NewTab onGo={(url) => store.getState().navigate(t.id, url, { fromUser: true })} />
            )}
          </div>
        ))}

        {tab.crash ? (
          <div className="pointer-events-none absolute inset-x-0 top-3 z-20 flex justify-center">
            <div className="pointer-events-auto rounded-lg border border-border bg-surface px-3 py-2 text-sm text-danger shadow-[var(--shadow-panel)]">
              {tab.crash}
            </div>
          </div>
        ) : null}

        <OverlayHost
          overlay={overlay === "devtools" ? "none" : overlay}
          onClose={() => store.getState().setOverlay("none")}
          onGo={(url) => {
            go(url);
          }}
        />
        {tabsOpen ? (
          <TabSwitcher
            tabs={tabs}
            activeId={tab.id}
            onActivate={(id) => {
              store.getState().activate(id);
              setTabsOpen(false);
            }}
            onClose={(id) => store.getState().closeTab(id)}
            onDismiss={() => setTabsOpen(false)}
          />
        ) : null}
        </div>
      </div>

      {devtools ? <DevtoolsDock /> : null}

      {settings.layout.tabPosition === "bottom" ? tabBar : null}

      {settings.layout.statusBar ? (
        <footer className="flex h-7 items-center justify-between gap-3 border-t border-border bg-surface px-3 text-xs text-muted">
          <span className="truncate">
            {tab.displayUrl || tab.url
              ? `${settings.engine} · ${prettyUrl(tab.displayUrl || tab.url)}${tab.redirectedFrom ? ` · from ${tab.redirectedFrom}` : ""}`
              : "New tab"}
          </span>
          <span className="hidden items-center gap-3 sm:flex">
            <span>{Math.round(tab.zoom * 100)}%</span>
            {settings.adblock ? <span>blocker on</span> : <span>blocker off</span>}
            {settings.stealth ? <span className="text-ok">stealth</span> : null}
          </span>
        </footer>
      ) : null}

      <MobileDock
        tabCount={tabs.length}
        onTabs={() => setTabsOpen(true)}
        onNew={() => store.getState().newTab()}
        onSettings={() => store.getState().setOverlay("settings")}
      />
    </div>
  );
}

function ChromeSidebar({
  kind,
  onGo,
}: {
  kind: "bookmarks" | "history" | "downloads";
  onGo: (url: string) => void;
}) {
  const bookmarks = useBrowserStore((s) => s.bookmarks);
  const history = useBrowserStore((s) => s.history);
  const downloads = useBrowserStore((s) => s.downloads);
  return (
    <aside className="hidden h-full w-56 shrink-0 overflow-auto border-r border-border bg-surface veil-scroll sm:block">
      <p className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted">{kind}</p>
      {kind === "bookmarks"
        ? bookmarks.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => onGo(b.url)}
              className="block w-full truncate px-3 py-2 text-left text-sm hover:bg-surface-2"
            >
              {b.title}
            </button>
          ))
        : null}
      {kind === "history"
        ? history.slice(0, 40).map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => onGo(h.url)}
              className="block w-full truncate px-3 py-2 text-left text-sm hover:bg-surface-2"
            >
              {h.title}
            </button>
          ))
        : null}
      {kind === "downloads"
        ? downloads.map((d) => (
            <div key={d.id} className="px-3 py-2 text-sm">
              {d.href ? (
                <a href={d.href} download={d.filename} className="truncate hover:underline">
                  {d.filename}
                </a>
              ) : (
                <span className="truncate text-muted">{d.filename}</span>
              )}
            </div>
          ))
        : null}
    </aside>
  );
}

function TabSwitcher({
  tabs,
  activeId,
  onActivate,
  onClose,
  onDismiss,
}: {
  tabs: TabState[];
  activeId: string;
  onActivate: (id: string) => void;
  onClose: (id: string) => void;
  onDismiss: () => void;
}) {
  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-background/90 p-4 sm:hidden">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium">Tabs</h2>
        <button type="button" className="grid size-10 place-items-center rounded-md hover:bg-surface-2" onClick={onDismiss} aria-label="Close tabs">
          <X className="size-4" />
        </button>
      </div>
      <ul className="min-h-0 flex-1 space-y-2 overflow-auto veil-scroll">
        {tabs.map((t) => (
          <li key={t.id} className={cn("flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-3", t.id === activeId && "border-ring")}>
            <button type="button" className="min-w-0 flex-1 truncate text-left text-sm" onClick={() => onActivate(t.id)}>
              {t.title || "New tab"}
            </button>
            <button type="button" aria-label={`Close ${t.title}`} className="grid size-10 place-items-center rounded-md hover:bg-surface-2" onClick={() => onClose(t.id)}>
              <X className="size-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TabBar({
  tabs,
  activeId,
  onNew,
  onClose,
  onActivate,
}: {
  tabs: TabState[];
  activeId: string;
  onNew: () => void;
  onClose: (id: string) => void;
  onActivate: (id: string) => void;
}) {
  return (
    <div className="flex items-end gap-1 overflow-x-auto border-b border-border bg-background px-2 pt-2 veil-scroll">
      {tabs.map((t) => {
        const on = t.id === activeId;
        return (
          <div
            key={t.id}
            className={cn(
              "group flex h-[var(--tab-h)] max-w-56 min-w-32 shrink-0 items-center gap-1 rounded-t-lg px-2 text-xs",
              on ? "bg-surface text-foreground" : "text-muted hover:bg-surface/70",
            )}
          >
            <button type="button" className="min-w-0 flex-1 truncate text-left" onClick={() => onActivate(t.id)}>
              {t.title || "New tab"}
            </button>
            <button
              type="button"
              aria-label={`Close ${t.title}`}
              className="grid size-6 place-items-center rounded-md opacity-70 hover:bg-surface-2 hover:opacity-100"
              onClick={() => onClose(t.id)}
            >
              <X className="size-3" />
            </button>
          </div>
        );
      })}
      <button
        type="button"
        aria-label="New tab"
        onClick={onNew}
        className="mb-1 grid size-8 shrink-0 place-items-center rounded-md text-muted hover:bg-surface-2 hover:text-foreground"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  disabled,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-9 shrink-0 place-items-center rounded-md text-foreground hover:bg-surface-2 disabled:opacity-30 [&_svg]:size-4"
    >
      {children}
    </button>
  );
}

function MobileDock({
  tabCount,
  onTabs,
  onNew,
  onSettings,
}: {
  tabCount: number;
  onTabs: () => void;
  onNew: () => void;
  onSettings: () => void;
}) {
  const back = () => {
    const s = useBrowserStore.getState();
    s.back(s.activeId);
  };
  return (
    <div className="flex h-12 items-center justify-around border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] sm:hidden">
      <button type="button" className="grid size-11 place-items-center" aria-label="Back" onClick={back}>
        <ArrowLeft className="size-5" />
      </button>
      <button type="button" className="grid size-11 place-items-center" aria-label="Tabs" onClick={onTabs}>
        <span className="grid size-6 place-items-center rounded-md border border-border text-xs tabular-nums">
          {tabCount}
        </span>
      </button>
      <button type="button" className="grid size-11 place-items-center" aria-label="New tab" onClick={onNew}>
        <Plus className="size-5" />
      </button>
      <button type="button" className="grid size-11 place-items-center" aria-label="Downloads" onClick={() => useBrowserStore.getState().setOverlay("downloads")}>
        <Download className="size-5" />
      </button>
      <button type="button" className="grid size-11 place-items-center" aria-label="Settings" onClick={onSettings}>
        <Settings className="size-5" />
      </button>
    </div>
  );
}

function useHotkeys(addressRef: RefObject<HTMLInputElement | null>, tab: TabState) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.altKey) return;
      const s = useBrowserStore.getState();
      const id = s.activeId;
      const key = e.key.toLowerCase();
      const prevent = () => {
        e.preventDefault();
        e.stopPropagation();
      };
      if (key === "t" && !e.shiftKey) {
        prevent();
        s.newTab();
      } else if (key === "t" && e.shiftKey) {
        prevent();
        s.restoreTab();
      } else if (key === "w") {
        prevent();
        s.closeTab(id);
      } else if (key === "l" || key === "d") {
        prevent();
        addressRef.current?.focus();
        addressRef.current?.select();
      } else if (key === "r") {
        prevent();
        s.reload(id);
      } else if (key === "[" || e.key === "ArrowLeft") {
        prevent();
        s.back(id);
      } else if (key === "]" || e.key === "ArrowRight") {
        prevent();
        s.forward(id);
      } else if (key === "h") {
        prevent();
        s.setOverlay("history");
      } else if (key === "j") {
        prevent();
        s.setOverlay("downloads");
      } else if (key === "," || e.code === "Comma") {
        prevent();
        s.setOverlay("settings");
      } else if (key === "n" && !e.shiftKey) {
        prevent();
        const home = s.settings.homeUrl;
        if (home) s.newTab(home);
        else s.newTab();
      } else if (key === "n" && e.shiftKey) {
        prevent();
        s.applyStealth();
        toast.success("Stealth mode on");
      } else if (key === "i" && e.shiftKey) {
        prevent();
        s.setOverlay(s.overlay === "devtools" ? "none" : "devtools");
      } else if (e.key === "=" || e.key === "+") {
        prevent();
        s.setZoom(id, tab.zoom + 0.1);
      } else if (e.key === "-" || e.key === "_") {
        prevent();
        s.setZoom(id, tab.zoom - 0.1);
      } else if (key === "0") {
        prevent();
        s.setZoom(id, 1);
      } else if (/^[1-8]$/.test(key)) {
        prevent();
        const t = s.tabs[Number(key) - 1];
        if (t) s.activate(t.id);
      } else if (key === "9") {
        prevent();
        const t = s.tabs[s.tabs.length - 1];
        if (t) s.activate(t.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [addressRef, tab.zoom]);
}

async function handleDownload(d: {
  url?: string;
  filename?: string;
  mime?: string;
  size?: number;
  href?: string;
}) {
  const st = useBrowserStore.getState();
  const filename = d.filename || "download";
  st.addDownload({
    filename,
    url: d.url || d.href || "",
    mime: d.mime || "application/octet-stream",
    size: d.size || 0,
    status: "saving",
  });
  const target = d.href || d.url;
  if (!target) return;
  try {
    const res = await fetch(target.startsWith("http") ? target : target);
    const blob = await res.blob();
    const href = URL.createObjectURL(blob);
    const latest = useBrowserStore.getState().downloads[0];
    if (latest) st.updateDownload(latest.id, { status: "done", href, size: blob.size });
    toast.success(`Saved ${filename}`);
  } catch {
    const latest = useBrowserStore.getState().downloads[0];
    if (latest) st.updateDownload(latest.id, { status: "error" });
    toast.error("Download failed");
  }
}
