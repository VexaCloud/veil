import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { Toaster, toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  Ellipsis,
  Expand,
  Home,
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
import { currentSearchEngine, useBrowserStore, type TabState } from "@/lib/browser-store";
import { isInternalUrl } from "@/lib/internal";
import { eventMatchesCombo } from "@/lib/shortcuts";
import { cn, hostnameOf, normalizeNavigableUrl } from "@/lib/utils";
import { persistCookieRow, startAccountSync, stopAccountSync } from "@/lib/account-sync";
import { LoginScreen } from "./login";
import { InternalPage } from "./internal-page";
import { DevtoolsDock } from "./devtools";
import { ContextMenu, type MenuItem } from "./context-menu";

const IFRAME_ALLOW =
  "accelerometer; autoplay; camera; clipboard-read; clipboard-write; encrypted-media; fullscreen; gamepad; geolocation; gyroscope; microphone; midi; pointer-lock; display-capture; usb; xr-spatial-tracking";

export function BrowserShell() {
  const hydrated = useBrowserStore((s) => s.hydrated);
  const session = useBrowserStore((s) => s.session);
  const setHydrated = useBrowserStore((s) => s.setHydrated);
  const setSession = useBrowserStore((s) => s.setSession);
  const settings = useBrowserStore((s) => s.settings);

  useEffect(() => {
    void Promise.resolve(useBrowserStore.persist.rehydrate()).then(async () => {
      setHydrated(true);
      const { getSupabase } = await import("@/lib/supabase");
      const sb = getSupabase();
      if (sb) {
        const { data } = await sb.auth.getSession();
        if (data.session?.user) {
          setSession({ kind: "user", userId: data.session.user.id, email: data.session.user.email || "" });
          void startAccountSync(data.session.user.id);
        }
      }
    });
  }, [setHydrated, setSession]);

  useEffect(() => {
    if (!hydrated) return;
    applyTheme(settings);
    writeCfgCookie(settings);
  }, [hydrated, settings]);

  useEffect(() => {
    if (session.kind !== "user") stopAccountSync();
  }, [session.kind]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/veil-sw.js").catch(() => {});
    }
  }, []);

  if (!hydrated) {
    return <div className="grid min-h-dvh place-items-center bg-background text-sm text-muted">Loading Veil…</div>;
  }
  if (session.kind === "none") return <LoginScreen />;
  return <Chrome />;
}

function applyTheme(settings: ReturnType<typeof useBrowserStore.getState>["settings"]) {
  const root = document.documentElement;
  const theme = settings.theme;
  let light = theme.mode === "light";
  if (theme.mode === "system") light = window.matchMedia("(prefers-color-scheme: light)").matches;
  if (theme.preset === "midnight" || theme.preset === "graphite") light = false;
  if (light) root.dataset.theme = "light";
  else root.dataset.theme = "dark";
  root.dataset.preset = theme.preset;
  root.dataset.density = theme.density;
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
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `veil_cfg=${encodeURIComponent(JSON.stringify(cfg))}; path=/; SameSite=Lax${secure}`;
  document.cookie = `veil_filters=${encodeURIComponent(JSON.stringify(settings.filterLists.slice(0, 80)))}; path=/; SameSite=Lax${secure}`;
  if (!/veil_sid=/.test(document.cookie)) {
    const sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    document.cookie = `veil_sid=${sid}; path=/; SameSite=Lax${secure}`;
  }
}

function Chrome() {
  const tabs = useBrowserStore((s) => s.tabs);
  const activeId = useBrowserStore((s) => s.activeId);
  const settings = useBrowserStore((s) => s.settings);
  const bookmarks = useBrowserStore((s) => s.bookmarks);
  const addressDraft = useBrowserStore((s) => s.addressDraft);
  const inspectOn = useBrowserStore((s) => s.inspectOn);
  const devtoolsOpen = useBrowserStore((s) => s.devtoolsOpen);
  const session = useBrowserStore((s) => s.session);
  const store = useBrowserStore;
  const tab = tabs.find((t) => t.id === activeId) ?? tabs[0]!;
  const addressRef = useRef<HTMLInputElement>(null);
  const frames = useRef<Record<string, HTMLIFrameElement | null>>({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [tabsOpen, setTabsOpen] = useState(false);
  const [ctx, setCtx] = useState<{ x: number; y: number; items: MenuItem[] } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const guest = session.kind === "guest";

  const go = (raw: string, opts?: { replace?: boolean }) => {
    const se = currentSearchEngine(store.getState().settings);
    const url = raw.startsWith("veil:") ? raw : normalizeNavigableUrl(raw, se.url);
    if (!url) return;
    store.getState().navigate(tab.id, url, { fromUser: true, replace: opts?.replace });
  };

  useHotkeys(addressRef, tab);

  useEffect(() => {
    const title = tab.title || "New tab";
    document.title = `${title} · Veil`;
    let link = document.querySelector<HTMLLinkElement>("link[data-veil-favicon]");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      link.setAttribute("data-veil-favicon", "1");
      document.head.appendChild(link);
    }
    link.href = tab.favicon || "/favicon.svg";
  }, [tab.title, tab.favicon, tab.url]);

  useEffect(() => {
    const onMsg = (ev: MessageEvent) => {
      const d = ev.data;
      if (!d || d.ns !== "veil") return;
      const st = store.getState();
      const id = (d.tabId as string) || st.activeId;
      const current = st.tabs.find((t) => t.id === id);
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
          if (st.activeId === id) st.setAddressDraft(url);
          if (current && !current.incognito) st.pushHistory(url, title || hostnameOf(url), current.incognito);
        }
      }
      if (d.type === "error") {
        st.updateTab(id, { loading: false, crash: String(d.message || d.title || "Error") });
      }
      if (d.type === "console") st.pushConsole({ level: d.level, args: d.args ?? [] });
      if (d.type === "net") {
        st.pushNet({ method: d.method || "GET", url: d.url, status: d.status, ms: d.ms, phase: d.phase });
      }
      if (d.type === "inspect") {
        st.setInspect(d);
        st.setDevtoolsOpen(true);
      }
      if (d.type === "source") st.setPageSource(String(d.html || ""));
      if (d.type === "open" && d.url) st.newTab(d.url);
      if (d.type === "save-password" && d.origin && d.password && st.session.kind === "user" && !current?.incognito) {
        st.upsertPassword({ origin: String(d.origin), username: String(d.username || ""), password: String(d.password) });
      }
      if (d.type === "download") void handleDownload(d);
      if (d.type === "cookie" && st.session.kind === "user" && !current?.incognito && d.cookie && d.url) {
        void persistCookieFromHook(String(d.cookie), String(d.url), st.session.userId);
      }
      if (d.type === "contextmenu") {
        const frame = frames.current[id];
        const rect = frame?.getBoundingClientRect();
        const x = (rect?.left ?? 0) + Number(d.x || 0);
        const y = (rect?.top ?? 0) + Number(d.y || 0);
        setCtx({
          x,
          y,
          items: pageContextItems(id, () => {
            const src = proxySrcFor(st.tabs.find((t) => t.id === id), st.settings);
            if (src) window.open(src, "_blank", "noopener,noreferrer");
          }),
        });
      }
    };
    window.addEventListener("message", onMsg);
    const onEval = (e: Event) => {
      const code = (e as CustomEvent).detail as string;
      frames.current[tab.id]?.contentWindow?.postMessage({ ns: "veil", type: "eval", code }, "*");
    };
    const onSource = () => frames.current[tab.id]?.contentWindow?.postMessage({ ns: "veil", type: "source" }, "*");
    const onApply = (e: Event) => {
      const html = (e as CustomEvent).detail as string;
      frames.current[tab.id]?.contentWindow?.postMessage({ ns: "veil", type: "apply-html", html }, "*");
    };
    const onEdit = (e: Event) => {
      const html = (e as CustomEvent).detail as string;
      frames.current[tab.id]?.contentWindow?.postMessage({ ns: "veil", type: "edit-html", html }, "*");
    };
    window.addEventListener("veil:eval", onEval);
    window.addEventListener("veil:source", onSource);
    window.addEventListener("veil:apply-html", onApply);
    window.addEventListener("veil:edit-html", onEdit);
    return () => {
      window.removeEventListener("message", onMsg);
      window.removeEventListener("veil:eval", onEval);
      window.removeEventListener("veil:source", onSource);
      window.removeEventListener("veil:apply-html", onApply);
      window.removeEventListener("veil:edit-html", onEdit);
    };
  }, [store, tab.id]);

  useEffect(() => {
    frames.current[tab.id]?.contentWindow?.postMessage({ ns: "veil", type: "inspect", on: inspectOn }, "*");
  }, [inspectOn, tab.id, tab.frameKey]);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  const bookmarked = bookmarks.some((b) => b.url === tab.displayUrl || b.url === tab.url);
  const internal = isInternalUrl(tab.url) || tab.url.startsWith("veil:");

  const openFullscreen = () => {
    const src = proxySrcFor(tab, settings);
    if (!src) return;
    window.open(src, "_blank", "noopener,noreferrer");
  };

  const tabBar = (
    <TabBar
      tabs={tabs}
      activeId={tab.id}
      onNew={() => store.getState().newTab()}
      onClose={(id) => store.getState().closeTab(id)}
      onActivate={(id) => store.getState().activate(id)}
      onContext={(e, t) => {
        e.preventDefault();
        setCtx({
          x: e.clientX,
          y: e.clientY,
          items: [
            { kind: "item", label: "New tab", onSelect: () => store.getState().newTab() },
            { kind: "item", label: "New incognito tab", onSelect: () => store.getState().newTab("veil://newtab", { incognito: true }) },
            { kind: "item", label: "Duplicate", onSelect: () => store.getState().duplicateTab(t.id) },
            { kind: "sep" },
            { kind: "item", label: "Reload", onSelect: () => store.getState().reload(t.id) },
            { kind: "item", label: t.pointerLock ? "Disable cursor lock" : "Enable cursor lock", onSelect: () => store.getState().updateTab(t.id, { pointerLock: !t.pointerLock }) },
            { kind: "item", label: "Close", onSelect: () => store.getState().closeTab(t.id) },
            { kind: "item", label: "Close others", onSelect: () => tabs.filter((x) => x.id !== t.id).forEach((x) => store.getState().closeTab(x.id)) },
            { kind: "sep" },
            {
              kind: "item",
              label: settings.layout.tabPosition === "top" ? "Move tab bar to bottom" : "Move tab bar to top",
              onSelect: () => store.getState().setLayout({ tabPosition: settings.layout.tabPosition === "top" ? "bottom" : "top" }),
            },
          ],
        });
      }}
    />
  );

  const menuItems: [string, () => void][] = [
    ["New tab", () => store.getState().newTab()],
    ["New incognito tab", () => store.getState().newTab("veil://newtab", { incognito: true })],
    ["Settings", () => store.getState().newTab("veil://settings")],
    ...(guest
      ? []
      : ([
          ["History", () => store.getState().newTab("veil://history")],
          ["Downloads", () => store.getState().newTab("veil://downloads")],
          ["Files", () => store.getState().newTab("veil://files")],
          ["Bookmarks", () => store.getState().newTab("veil://bookmarks")],
        ] as [string, () => void][])),
    ["Keyboard shortcuts", () => store.getState().newTab("veil://shortcuts")],
    ["Developer tools", () => store.getState().setDevtoolsOpen(!devtoolsOpen)],
    ["Zoom in", () => store.getState().setZoom(tab.id, tab.zoom + 0.1)],
    ["Zoom out", () => store.getState().setZoom(tab.id, tab.zoom - 0.1)],
  ];

  return (
    <div
      className={cn("veil-chrome flex h-dvh min-h-0 flex-col bg-background text-foreground", tab.incognito && "veil-incognito")}
      data-density={settings.theme.density}
      data-incognito={tab.incognito ? "1" : "0"}
    >
      <Toaster theme={settings.theme.mode === "light" && !tab.incognito ? "light" : "dark"} position="bottom-right" />
      {settings.layout.tabPosition === "top" ? tabBar : null}

      <div
        className="flex items-center gap-1 border-b border-border bg-surface px-2"
        style={{ height: "var(--nav-h)" }}
        onContextMenu={(e) => {
          e.preventDefault();
          setCtx({
            x: e.clientX,
            y: e.clientY,
            items: [
              { kind: "item", label: settings.layout.bookmarkBar ? "Hide bookmarks bar" : "Show bookmarks bar", onSelect: () => store.getState().setLayout({ bookmarkBar: !settings.layout.bookmarkBar }) },
              { kind: "item", label: settings.layout.statusBar ? "Hide status bar" : "Show status bar", onSelect: () => store.getState().setLayout({ statusBar: !settings.layout.statusBar }) },
              { kind: "item", label: settings.layout.tabPosition === "top" ? "Move tab bar to bottom" : "Move tab bar to top", onSelect: () => store.getState().setLayout({ tabPosition: settings.layout.tabPosition === "top" ? "bottom" : "top" }) },
              { kind: "item", label: settings.theme.density === "comfortable" ? "Use compact density" : "Use comfortable density", onSelect: () => store.getState().setTheme({ density: settings.theme.density === "comfortable" ? "compact" : "comfortable" }) },
              { kind: "sep" },
              { kind: "item", label: "Settings", onSelect: () => store.getState().newTab("veil://settings") },
            ],
          });
        }}
      >
        <IconBtn label="Back" disabled={tab.stackIndex <= 0} onClick={() => store.getState().back(tab.id)}>
          <ArrowLeft />
        </IconBtn>
        <IconBtn label="Forward" disabled={tab.stackIndex >= tab.stack.length - 1} onClick={() => store.getState().forward(tab.id)}>
          <ArrowRight />
        </IconBtn>
        {tab.loading ? (
          <IconBtn label="Stop" onClick={() => store.getState().stop(tab.id)}><Square className="size-3.5 fill-current" /></IconBtn>
        ) : (
          <IconBtn label="Reload" onClick={() => store.getState().reload(tab.id)}><RotateCw /></IconBtn>
        )}
        <IconBtn
          label="Home"
          onClick={() => {
            if (settings.homeUrl) go(settings.homeUrl);
            else store.getState().navigate(tab.id, "veil://newtab", { fromUser: true });
          }}
        >
          <Home />
        </IconBtn>

        <form
          className="veil-omnibox mx-2 flex min-w-0 flex-1 items-center gap-2 px-3"
          onSubmit={(e) => { e.preventDefault(); go(addressDraft); }}
        >
          {settings.stealth ? <Shield className="size-3.5 shrink-0 text-ok" /> : <ShieldOff className="size-3.5 shrink-0 text-muted" />}
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
            <span className="hidden max-w-[36%] truncate text-xs text-muted sm:inline">from {tab.redirectedFrom}</span>
          ) : null}
          {!guest ? (
            <button
              type="button"
              className={cn("grid size-8 place-items-center rounded-full", bookmarked ? "text-warn" : "text-muted")}
              aria-label="Bookmark"
              onClick={() => {
                if (!tab.displayUrl && !tab.url) return;
                if (isInternalUrl(tab.url)) return;
                if (bookmarked) {
                  const b = bookmarks.find((x) => x.url === tab.displayUrl || x.url === tab.url);
                  if (b) store.getState().removeBookmark(b.id);
                } else {
                  store.getState().addBookmark({ title: tab.title, url: tab.displayUrl || tab.url });
                  toast.success("Bookmark added");
                }
              }}
            >
              <Star className={cn("size-3.5", bookmarked && "fill-current")} />
            </button>
          ) : null}
        </form>

        <IconBtn label="Open proxy fullscreen" onClick={openFullscreen} disabled={internal}>
          <Expand />
        </IconBtn>
        <div className="relative" ref={menuRef}>
          <IconBtn label="Menu" onClick={() => setMenuOpen((v) => !v)}><Ellipsis /></IconBtn>
          {menuOpen ? (
            <div className="absolute right-0 top-[calc(100%+6px)] z-40 w-56 overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-[var(--shadow-panel)]">
              {menuItems.map(([label, fn]) => (
                <button
                  key={label}
                  type="button"
                  className="flex h-10 w-full items-center px-3 text-left text-sm hover:bg-surface-2"
                  onClick={() => { fn(); setMenuOpen(false); }}
                >
                  {label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {settings.layout.bookmarkBar && bookmarks.length ? (
        <div
          className="flex h-10 items-center gap-1 overflow-x-auto border-b border-border bg-surface px-2 veil-scroll"
          onContextMenu={(e) => {
            e.preventDefault();
            setCtx({
              x: e.clientX,
              y: e.clientY,
              items: [{ kind: "item", label: "Hide bookmarks bar", onSelect: () => store.getState().setLayout({ bookmarkBar: false }) }],
            });
          }}
        >
          {bookmarks.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => go(b.url)}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCtx({
                  x: e.clientX,
                  y: e.clientY,
                  items: [
                    { kind: "item", label: "Open", onSelect: () => go(b.url) },
                    { kind: "item", label: "Open in new tab", onSelect: () => store.getState().newTab(b.url) },
                    { kind: "item", label: "Remove", danger: true, onSelect: () => store.getState().removeBookmark(b.id) },
                  ],
                });
              }}
              className="h-8 shrink-0 rounded-md px-2.5 text-sm text-muted hover:bg-surface-2 hover:text-foreground"
            >
              {b.title}
            </button>
          ))}
        </div>
      ) : null}

      <div className="relative h-0.5 bg-border">
        {tab.loading ? <div className="veil-loading-bar absolute inset-0" /> : null}
      </div>

      <div className="relative flex min-h-0 flex-1 bg-surface">
        <div className="relative min-h-0 min-w-0 flex-1">
          {tabs.map((t) => {
            const src = proxySrcFor(t, settings);
            const on = t.id === tab.id;
            const tInternal = isInternalUrl(t.url);
            return (
              <div key={t.id} className={cn("absolute inset-0", on ? "z-10" : "pointer-events-none invisible")} aria-hidden={!on}>
                {tInternal || !t.url ? (
                  on ? <InternalPage url={t.url || "veil://newtab"} onGo={(url) => store.getState().navigate(t.id, url, { fromUser: true })} /> : null
                ) : src ? (
                  <TabFrame
                    tab={t}
                    src={src}
                    active={on}
                    onBind={(el) => { frames.current[t.id] = el; }}
                    engineKey={`${t.frameKey}-${settings.engine}-${settings.stealth ? "s" : "c"}`}
                  />
                ) : (
                  on ? <InternalPage url="veil://newtab" onGo={(url) => store.getState().navigate(t.id, url, { fromUser: true })} /> : null
                )}
              </div>
            );
          })}

          {tab.crash ? (
            <div className="pointer-events-none absolute inset-x-0 top-3 z-20 flex justify-center">
              <div className="pointer-events-auto rounded-lg border border-border bg-surface px-3 py-2 text-sm text-danger shadow-[var(--shadow-panel)]">
                {tab.crash}
              </div>
            </div>
          ) : null}

          {tabsOpen ? (
            <TabSwitcher
              tabs={tabs}
              activeId={tab.id}
              onActivate={(id) => { store.getState().activate(id); setTabsOpen(false); }}
              onClose={(id) => store.getState().closeTab(id)}
              onDismiss={() => setTabsOpen(false)}
            />
          ) : null}
        </div>
      </div>

      {devtoolsOpen ? <DevtoolsDock /> : null}
      {settings.layout.tabPosition === "bottom" ? tabBar : null}

      {settings.layout.statusBar ? (
        <footer className="hidden h-8 items-center justify-between gap-3 border-t border-border bg-surface px-3 text-xs text-muted sm:flex">
          <span className="truncate">
            {tab.incognito ? "Incognito · " : ""}
            {guest ? "Guest · " : ""}
            {tab.displayUrl || tab.url || "New tab"} · {settings.engine}
            {settings.stealth ? " · stealth" : ""}
          </span>
          <span className="flex items-center gap-3">
            <span>{Math.round(tab.zoom * 100)}%</span>
            {settings.adblock ? <span>blocker on</span> : null}
          </span>
        </footer>
      ) : null}

      <MobileDock
        tabCount={tabs.length}
        guest={guest}
        onTabs={() => setTabsOpen(true)}
        onNew={() => store.getState().newTab()}
        onSettings={() => store.getState().newTab("veil://settings")}
      />

      {ctx ? <ContextMenu x={ctx.x} y={ctx.y} items={ctx.items} onClose={() => setCtx(null)} /> : null}
    </div>
  );
}

function proxySrcFor(t: TabState | undefined, settings: ReturnType<typeof useBrowserStore.getState>["settings"]): string | null {
  if (!t?.url || isInternalUrl(t.url)) return null;
  try {
    const tabKey = t.incognito ? `priv-${t.id}` : t.id;
    return encodeProxyPath(settings.engine, tabKey, t.url, settings.stealth);
  } catch {
    return null;
  }
}

function pageContextItems(tabId: string, openFullscreen: () => void): MenuItem[] {
  const st = useBrowserStore.getState();
  const t = st.tabs.find((x) => x.id === tabId);
  return [
    { kind: "item", label: "Back", disabled: !t || t.stackIndex <= 0, onSelect: () => st.back(tabId) },
    { kind: "item", label: "Forward", disabled: !t || t.stackIndex >= (t?.stack.length ?? 0) - 1, onSelect: () => st.forward(tabId) },
    { kind: "item", label: "Reload", onSelect: () => st.reload(tabId) },
    { kind: "sep" },
    { kind: "item", label: "Inspect", onSelect: () => { st.setDevtoolsOpen(true); st.setInspectOn(true); } },
    { kind: "item", label: "View page source", onSelect: () => { st.setDevtoolsOpen(true); window.dispatchEvent(new Event("veil:source")); } },
    { kind: "item", label: "Open proxy fullscreen", onSelect: openFullscreen },
  ];
}

function TabFrame({
  tab, src, active, onBind, engineKey,
}: {
  tab: TabState;
  src: string;
  active: boolean;
  onBind: (el: HTMLIFrameElement | null) => void;
  engineKey: string;
}) {
  const [committed, setCommitted] = useState(src);
  const [pending, setPending] = useState<string | null>(null);
  const [showCover, setShowCover] = useState(true);
  const liveRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    setCommitted(src);
    setPending(null);
    setShowCover(true);
  }, [engineKey]);

  useEffect(() => {
    if (src === committed) return;
    setPending(src);
  }, [src, committed]);

  useEffect(() => {
    onBind(liveRef.current);
  }, [onBind, committed, pending, active]);

  const bindLive = (el: HTMLIFrameElement | null) => {
    liveRef.current = el;
    onBind(el);
  };

  const allow = tab.pointerLock
    ? IFRAME_ALLOW
    : IFRAME_ALLOW.replace("pointer-lock; ", "");

  return (
    <div className="absolute inset-0 bg-surface">
      {committed ? (
        <iframe
          ref={pending ? undefined : bindLive}
          title={tab.title}
          src={committed}
          allow={allow}
          allowFullScreen
          className="h-full w-full border-0 bg-surface"
          style={{ transform: tab.zoom === 1 ? undefined : `scale(${tab.zoom})`, transformOrigin: "0 0" }}
          onLoad={() => {
            if (!pending) {
              setShowCover(false);
              useBrowserStore.getState().updateTab(tab.id, { loading: false });
            }
          }}
        />
      ) : null}
      {pending ? (
        <iframe
          ref={bindLive}
          title={tab.title}
          src={pending}
          allow={allow}
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0 bg-surface opacity-0"
          style={{ transform: tab.zoom === 1 ? undefined : `scale(${tab.zoom})`, transformOrigin: "0 0" }}
          onLoad={(e) => {
            (e.currentTarget as HTMLIFrameElement).style.opacity = "1";
            setCommitted(pending);
            setPending(null);
            setShowCover(false);
            useBrowserStore.getState().updateTab(tab.id, { loading: false });
          }}
        />
      ) : null}
      {showCover && tab.loading ? (
        <div className="pointer-events-none absolute inset-0 bg-surface" aria-hidden />
      ) : null}
    </div>
  );
}

function TabBar({
  tabs, activeId, onNew, onClose, onActivate, onContext,
}: {
  tabs: TabState[];
  activeId: string;
  onNew: () => void;
  onClose: (id: string) => void;
  onActivate: (id: string) => void;
  onContext: (e: React.MouseEvent, t: TabState) => void;
}) {
  return (
    <div
      className="flex items-end gap-1 overflow-x-auto bg-background px-2 pt-2 veil-scroll"
      onContextMenu={(e) => {
        const t = tabs.find((x) => x.id === activeId);
        if (t) onContext(e, t);
      }}
    >
      {tabs.map((t) => {
        const on = t.id === activeId;
        return (
          <div
            key={t.id}
            onContextMenu={(e) => onContext(e, t)}
            className={cn(
              "veil-tab group flex shrink-0 items-center gap-2 rounded-t-lg px-3 text-sm",
              on ? "bg-surface text-foreground shadow-[0_-1px_0_var(--veil-border)]" : "text-muted hover:bg-surface/70",
              t.incognito && "italic",
            )}
          >
            {t.favicon ? (
              <img
                src={t.favicon}
                alt=""
                className="size-4 rounded-sm"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            ) : (
              <span className="grid size-4 place-items-center rounded-sm bg-surface-2 text-[9px] font-semibold">
                {(t.title || "N").slice(0, 1)}
              </span>
            )}
            {t.loading ? <span className="size-1.5 animate-pulse rounded-full bg-ring" /> : null}
            <button type="button" className="min-w-0 flex-1 truncate text-left" onClick={() => onActivate(t.id)}>
              {t.title || "New tab"}
            </button>
            <button type="button" aria-label={`Close ${t.title}`} className="grid size-7 place-items-center rounded-md opacity-70 hover:bg-surface-2" onClick={() => onClose(t.id)}>
              <X className="size-3.5" />
            </button>
          </div>
        );
      })}
      <button type="button" aria-label="New tab" onClick={onNew} className="mb-1 grid size-9 shrink-0 place-items-center rounded-md text-muted hover:bg-surface-2 hover:text-foreground">
        <Plus className="size-4" />
      </button>
    </div>
  );
}

function TabSwitcher({
  tabs, activeId, onActivate, onClose, onDismiss,
}: {
  tabs: TabState[];
  activeId: string;
  onActivate: (id: string) => void;
  onClose: (id: string) => void;
  onDismiss: () => void;
}) {
  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-background/95 p-4 sm:hidden">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium">Tabs</h2>
        <button type="button" className="grid size-11 place-items-center rounded-md hover:bg-surface-2" onClick={onDismiss} aria-label="Close tabs">
          <X className="size-4" />
        </button>
      </div>
      <ul className="min-h-0 flex-1 space-y-2 overflow-auto veil-scroll">
        {tabs.map((t) => (
          <li key={t.id} className={cn("flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-3", t.id === activeId && "border-ring")}>
            <button type="button" className="min-w-0 flex-1 truncate text-left text-sm" onClick={() => onActivate(t.id)}>{t.title || "New tab"}</button>
            <button type="button" aria-label={`Close ${t.title}`} className="grid size-10 place-items-center rounded-md hover:bg-surface-2" onClick={() => onClose(t.id)}>
              <X className="size-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function IconBtn({ children, label, onClick, disabled }: { children: ReactNode; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" aria-label={label} title={label} disabled={disabled} onClick={onClick} className="grid size-10 shrink-0 place-items-center rounded-lg text-foreground hover:bg-surface-2 disabled:opacity-30 [&_svg]:size-4">
      {children}
    </button>
  );
}

function MobileDock({ tabCount, guest, onTabs, onNew, onSettings }: { tabCount: number; guest: boolean; onTabs: () => void; onNew: () => void; onSettings: () => void }) {
  return (
    <div className="flex h-12 items-center justify-around border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] sm:hidden">
      <button type="button" className="grid size-11 place-items-center" aria-label="Back" onClick={() => { const s = useBrowserStore.getState(); s.back(s.activeId); }}>
        <ArrowLeft className="size-5" />
      </button>
      <button type="button" className="grid size-11 place-items-center" aria-label="Tabs" onClick={onTabs}>
        <span className="grid size-6 place-items-center rounded-md border border-border text-xs tabular-nums">{tabCount}</span>
      </button>
      <button type="button" className="grid size-11 place-items-center" aria-label="New tab" onClick={onNew}><Plus className="size-5" /></button>
      {!guest ? (
        <button type="button" className="grid size-11 place-items-center" aria-label="Downloads" onClick={() => useBrowserStore.getState().newTab("veil://downloads")}>
          <Download className="size-5" />
        </button>
      ) : null}
      <button type="button" className="grid size-11 place-items-center" aria-label="Settings" onClick={onSettings}><Settings className="size-5" /></button>
    </div>
  );
}

function useHotkeys(addressRef: RefObject<HTMLInputElement | null>, tab: TabState) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = useBrowserStore.getState();
      const id = s.activeId;
      const prevent = () => { e.preventDefault(); e.stopPropagation(); };
      for (const binding of s.settings.shortcuts) {
        if (!eventMatchesCombo(e, binding.combo)) continue;
        prevent();
        switch (binding.action) {
          case "newTab": s.newTab(); break;
          case "closeTab": s.closeTab(id); break;
          case "reopenTab": s.restoreTab(); break;
          case "focusAddress": addressRef.current?.focus(); addressRef.current?.select(); break;
          case "reload": s.reload(id); break;
          case "back": s.back(id); break;
          case "forward": s.forward(id); break;
          case "devtools": s.setDevtoolsOpen(!s.devtoolsOpen); break;
          case "history": s.newTab("veil://history"); break;
          case "downloads": s.newTab("veil://downloads"); break;
          case "settings": s.newTab("veil://settings"); break;
          case "stealth":
            if (s.settings.stealth) s.patchSettings({ stealth: false });
            else s.applyStealth();
            break;
          case "incognito": s.newTab("veil://newtab", { incognito: true }); break;
          case "nextTab": s.cycleTab(1); break;
          case "prevTab": s.cycleTab(-1); break;
          case "fullscreenProxy": {
            const t = s.tabs.find((x) => x.id === id);
            if (!t?.url || isInternalUrl(t.url)) break;
            try {
              window.open(
                encodeProxyPath(
                  s.settings.engine,
                  t.incognito ? `priv-${t.id}` : t.id,
                  t.displayUrl || t.url,
                  s.settings.stealth,
                ),
                "_blank",
              );
            } catch { /* ignore */ }
            break;
          }
          default: break;
        }
        return;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [addressRef, tab.id]);
}

async function handleDownload(d: { url?: string; filename?: string; mime?: string; size?: number; href?: string }) {
  const st = useBrowserStore.getState();
  const filename = d.filename || "download";
  const id = st.addDownload({ filename, url: d.url || d.href || "", mime: d.mime || "application/octet-stream", size: d.size || 0, status: "saving" });
  const target = d.href || d.url;
  if (!target) return;
  try {
    const res = await fetch(target);
    const blob = await res.blob();
    const href = URL.createObjectURL(blob);
    st.updateDownload(id, { status: "done", href, size: blob.size });
    const fsId = st.addFile({
      parentId: "folder_downloads",
      name: filename,
      kind: "file",
      mime: blob.type,
      size: blob.size,
      href,
      sourceUrl: target,
    });
    st.updateDownload(id, { fsId });
    if (st.session.kind === "user") void uploadToBucket(st.session.userId, filename, blob);
    toast.success(`Saved ${filename} in Veil`);
  } catch {
    st.updateDownload(id, { status: "error" });
    toast.error("Download failed");
  }
}

async function uploadToBucket(userId: string, filename: string, blob: Blob) {
  const { getSupabase } = await import("@/lib/supabase");
  const sb = getSupabase();
  if (!sb) return;
  const path = `${userId}/${Date.now()}-${filename}`;
  await sb.storage.from("downloads").upload(path, blob, { upsert: true });
  await sb.from("fs_entries").insert({
    user_id: userId,
    parent_id: null,
    name: filename,
    kind: "file",
    mime: blob.type,
    size: blob.size,
    storage_path: path,
  });
}

async function persistCookieFromHook(raw: string, url: string, userId: string) {
  try {
    const host = new URL(url).hostname;
    const first = raw.split(";")[0] ?? "";
    const eq = first.indexOf("=");
    if (eq < 0) return;
    const name = first.slice(0, eq).trim();
    const value = first.slice(eq + 1).trim();
    await persistCookieRow(userId, { domain: host, name, path: "/", value });
  } catch {
    /* ignore */
  }
}
