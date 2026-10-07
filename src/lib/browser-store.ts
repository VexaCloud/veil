import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_NGINX_LAYER, ENGINES, type EngineId, type NginxLayer } from "@/lib/proxy/types";
import { internalTitle, isInternalUrl, parseInternal } from "@/lib/internal";
import { DEFAULT_SHORTCUTS, type ShortcutBinding } from "@/lib/shortcuts";
import { uid } from "@/lib/utils";

export type SearchEngine = { id: string; name: string; url: string };
export type Bookmark = { id: string; title: string; url: string; folder?: string };
export type HistoryEntry = { id: string; url: string; title: string; at: number };
export type DownloadItem = {
  id: string;
  filename: string;
  url: string;
  mime: string;
  size: number;
  at: number;
  status: "saving" | "done" | "error";
  href?: string;
  fsId?: string;
};
export type SavedPassword = { id: string; origin: string; username: string; password: string; updatedAt: number };
export type LogEntry = { id: string; at: number; kind: "nav" | "net" | "error" | "console" | "system"; message: string; url?: string };
export type NetHit = { id: string; at: number; method: string; url: string; status?: number; ms?: number; phase: string };
export type ConsoleHit = { id: string; at: number; level: string; args: string[] };
export type FsEntry = {
  id: string;
  parentId: string | null;
  name: string;
  kind: "file" | "folder";
  mime?: string;
  size: number;
  href?: string;
  sourceUrl?: string;
  createdAt: number;
};

export type ThemeId = "chrome" | "safari" | "midnight" | "graphite";
export type ThemeSettings = {
  preset: ThemeId;
  mode: "light" | "dark" | "system";
  density: "comfortable" | "compact";
};
export type LayoutSettings = {
  tabPosition: "top" | "bottom";
  bookmarkBar: boolean;
  statusBar: boolean;
  sidebar: "none" | "bookmarks" | "history" | "downloads";
};

export type TabState = {
  id: string;
  title: string;
  url: string;
  displayUrl: string;
  redirectedFrom: string | null;
  loading: boolean;
  crash: string | null;
  favicon: string | null;
  stack: string[];
  stackIndex: number;
  zoom: number;
  createdAt: number;
  frameKey: number;
  incognito: boolean;
  pointerLock: boolean;
};

export type Settings = {
  engine: EngineId;
  nginx: NginxLayer;
  searchEngineId: string;
  searchEngines: SearchEngine[];
  homeUrl: string;
  adblock: boolean;
  filterLists: string[];
  stealth: boolean;
  webrtcBlock: boolean;
  fingerprintResist: boolean;
  theme: ThemeSettings;
  layout: LayoutSettings;
  shortcuts: ShortcutBinding[];
};

export const DEFAULT_SEARCH_ENGINES: SearchEngine[] = [
  { id: "brave", name: "Brave Search", url: "https://search.brave.com/search?q=%s" },
  { id: "ddg", name: "DuckDuckGo", url: "https://duckduckgo.com/?q=%s" },
  { id: "bing", name: "Bing", url: "https://www.bing.com/search?q=%s" },
  { id: "google", name: "Google", url: "https://www.google.com/search?q=%s" },
  { id: "startpage", name: "Startpage", url: "https://www.startpage.com/sp/search?query=%s" },
];

export const DEFAULT_THEME: ThemeSettings = {
  preset: "chrome",
  mode: "light",
  density: "comfortable",
};

const DEFAULT_SETTINGS: Settings = {
  engine: "nginx",
  nginx: DEFAULT_NGINX_LAYER,
  searchEngineId: "brave",
  searchEngines: DEFAULT_SEARCH_ENGINES,
  homeUrl: "",
  adblock: true,
  filterLists: [],
  stealth: false,
  webrtcBlock: false,
  fingerprintResist: false,
  theme: DEFAULT_THEME,
  layout: {
    tabPosition: "top",
    bookmarkBar: false,
    statusBar: true,
    sidebar: "none",
  },
  shortcuts: DEFAULT_SHORTCUTS,
};

export type AuthSession =
  | { kind: "none" }
  | { kind: "guest" }
  | { kind: "user"; userId: string; email: string };

function freshTab(incognito = false, url = "veil://newtab"): TabState {
  const id = uid("tab");
  const internal = isInternalUrl(url);
  return {
    id,
    title: internal ? internalTitle(url) : "New tab",
    url,
    displayUrl: internal ? url : "",
    redirectedFrom: null,
    loading: false,
    crash: null,
    favicon: null,
    stack: url ? [url] : [],
    stackIndex: url ? 0 : -1,
    zoom: 1,
    createdAt: Date.now(),
    frameKey: 1,
    incognito,
    pointerLock: true,
  };
}

type BrowserStore = {
  hydrated: boolean;
  session: AuthSession;
  tabs: TabState[];
  activeId: string;
  bookmarks: Bookmark[];
  history: HistoryEntry[];
  downloads: DownloadItem[];
  passwords: SavedPassword[];
  files: FsEntry[];
  logs: LogEntry[];
  nets: NetHit[];
  consoles: ConsoleHit[];
  inspect: { html: string; tag: string; styles: Record<string, string> | null } | null;
  pageSource: string;
  settings: Settings;
  addressDraft: string;
  inspectOn: boolean;
  devtoolsOpen: boolean;
  closedStack: TabState[];
  setHydrated: (v: boolean) => void;
  setSession: (s: AuthSession) => void;
  signOut: () => void;
  newTab: (url?: string, opts?: { incognito?: boolean }) => string;
  closeTab: (id: string) => void;
  restoreTab: () => void;
  duplicateTab: (id: string) => void;
  activate: (id: string) => void;
  updateTab: (id: string, patch: Partial<TabState>) => void;
  navigate: (id: string, url: string, opts?: { replace?: boolean; fromUser?: boolean }) => void;
  back: (id: string) => void;
  forward: (id: string) => void;
  reload: (id: string) => void;
  stop: (id: string) => void;
  setZoom: (id: string, zoom: number) => void;
  addBookmark: (b?: Partial<Bookmark>) => void;
  removeBookmark: (id: string) => void;
  updateBookmark: (id: string, patch: Partial<Bookmark>) => void;
  pushHistory: (url: string, title: string, incognito?: boolean) => void;
  clearHistory: () => void;
  addDownload: (d: Omit<DownloadItem, "id" | "at">) => string;
  updateDownload: (id: string, patch: Partial<DownloadItem>) => void;
  clearDownloads: () => void;
  addFile: (f: Omit<FsEntry, "id" | "createdAt">) => string;
  removeFile: (id: string) => void;
  upsertPassword: (p: Omit<SavedPassword, "id" | "updatedAt">) => void;
  removePassword: (id: string) => void;
  log: (kind: LogEntry["kind"], message: string, url?: string) => void;
  pushNet: (hit: Omit<NetHit, "id" | "at">) => void;
  pushConsole: (hit: Omit<ConsoleHit, "id" | "at">) => void;
  setInspect: (v: BrowserStore["inspect"]) => void;
  setPageSource: (html: string) => void;
  patchSettings: (patch: Partial<Settings>) => void;
  setTheme: (patch: Partial<ThemeSettings>) => void;
  setLayout: (patch: Partial<LayoutSettings>) => void;
  setShortcut: (action: string, combo: string) => void;
  setAddressDraft: (v: string) => void;
  setInspectOn: (v: boolean) => void;
  setDevtoolsOpen: (v: boolean) => void;
  cycleTab: (dir: 1 | -1) => void;
  applyStealth: () => void;
  importAll: (data: unknown) => string | null;
  exportAll: () => Record<string, unknown>;
};

export const useBrowserStore = create<BrowserStore>()(
  persist(
    (set, get) => {
      const first = freshTab(false, "veil://newtab");
      return {
        hydrated: false,
        session: { kind: "none" },
        tabs: [first],
        activeId: first.id,
        bookmarks: [],
        history: [],
        downloads: [],
        passwords: [],
        files: [
          { id: "folder_downloads", parentId: null, name: "Downloads", kind: "folder", size: 0, createdAt: Date.now() },
        ],
        logs: [],
        nets: [],
        consoles: [],
        inspect: null,
        pageSource: "",
        settings: DEFAULT_SETTINGS,
        addressDraft: "veil://newtab",
        inspectOn: false,
        devtoolsOpen: false,
        closedStack: [],
        setHydrated: (v) => set({ hydrated: v }),
        setSession: (session) => set({ session }),
        signOut: () => {
          const t = freshTab(false, "veil://newtab");
          set({
            session: { kind: "none" },
            tabs: [t],
            activeId: t.id,
            bookmarks: [],
            history: [],
            downloads: [],
            passwords: [],
            files: [{ id: "folder_downloads", parentId: null, name: "Downloads", kind: "folder", size: 0, createdAt: Date.now() }],
            addressDraft: "veil://newtab",
            inspect: null,
            pageSource: "",
            nets: [],
            consoles: [],
            logs: [],
          });
        },
        newTab: (url, opts) => {
          const incognito = opts?.incognito ?? false;
          const tab = freshTab(incognito, url ?? "veil://newtab");
          set((s) => ({ tabs: [...s.tabs, tab], activeId: tab.id, addressDraft: tab.displayUrl || tab.url }));
          if (url && !isInternalUrl(url) && !url.startsWith("veil:")) {
            get().navigate(tab.id, url, { fromUser: true });
          }
          return tab.id;
        },
        closeTab: (id) => {
          const { tabs, activeId } = get();
          if (tabs.length === 1) {
            const t = freshTab(tabs[0]?.incognito);
            set({ tabs: [t], activeId: t.id, addressDraft: t.url });
            return;
          }
          const idx = tabs.findIndex((t) => t.id === id);
          const closing = tabs[idx];
          const nextTabs = tabs.filter((t) => t.id !== id);
          let nextId = activeId;
          if (activeId === id) nextId = (nextTabs[idx] ?? nextTabs[idx - 1] ?? nextTabs[0])!.id;
          const next = nextTabs.find((t) => t.id === nextId);
          set({
            tabs: nextTabs,
            activeId: nextId,
            addressDraft: next?.displayUrl || next?.url || "",
            closedStack: closing ? [closing, ...get().closedStack].slice(0, 20) : get().closedStack,
          });
        },
        restoreTab: () => {
          const [tab, ...rest] = get().closedStack;
          if (!tab) return;
          const restored = { ...tab, id: uid("tab"), loading: false };
          set((s) => ({ tabs: [...s.tabs, restored], activeId: restored.id, closedStack: rest }));
        },
        duplicateTab: (id) => {
          const tab = get().tabs.find((t) => t.id === id);
          if (!tab) return;
          get().newTab(tab.displayUrl || tab.url, { incognito: tab.incognito });
        },
        activate: (id) => {
          const tab = get().tabs.find((t) => t.id === id);
          set({ activeId: id, addressDraft: tab?.displayUrl || tab?.url || "" });
        },
        updateTab: (id, patch) =>
          set((s) => ({ tabs: s.tabs.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
        navigate: (id, url, opts) => {
          const parsed = parseInternal(url);
          set((s) => ({
            tabs: s.tabs.map((t) => {
              if (t.id !== id) return t;
              const replace = opts?.replace && t.stackIndex >= 0;
              let stack = t.stack.slice();
              let stackIndex = t.stackIndex;
              if (replace) stack[stackIndex] = url;
              else {
                stack = stack.slice(0, stackIndex + 1);
                stack.push(url);
                stackIndex = stack.length - 1;
              }
              return {
                ...t,
                url,
                displayUrl: url,
                redirectedFrom: opts?.fromUser ? null : t.redirectedFrom,
                loading: !parsed,
                crash: null,
                stack,
                stackIndex,
                title: parsed ? internalTitle(url) : hostnameFrom(url),
                favicon: parsed ? null : t.favicon,
              };
            }),
            addressDraft: url,
          }));
          const tab = get().tabs.find((t) => t.id === id);
          if (tab && !parsed && !tab.incognito && get().session.kind !== "guest") {
            get().pushHistory(url, hostnameFrom(url), false);
          }
        },
        back: (id) => {
          const tab = get().tabs.find((t) => t.id === id);
          if (!tab || tab.stackIndex <= 0) return;
          const url = tab.stack[tab.stackIndex - 1]!;
          set((s) => ({
            tabs: s.tabs.map((t) =>
              t.id === id
                ? {
                    ...t,
                    stackIndex: t.stackIndex - 1,
                    url,
                    displayUrl: url,
                    loading: !isInternalUrl(url),
                    title: isInternalUrl(url) ? internalTitle(url) : hostnameFrom(url),
                    crash: null,
                  }
                : t,
            ),
            addressDraft: url,
          }));
        },
        forward: (id) => {
          const tab = get().tabs.find((t) => t.id === id);
          if (!tab || tab.stackIndex >= tab.stack.length - 1) return;
          const url = tab.stack[tab.stackIndex + 1]!;
          set((s) => ({
            tabs: s.tabs.map((t) =>
              t.id === id
                ? {
                    ...t,
                    stackIndex: t.stackIndex + 1,
                    url,
                    displayUrl: url,
                    loading: !isInternalUrl(url),
                    title: isInternalUrl(url) ? internalTitle(url) : hostnameFrom(url),
                  }
                : t,
            ),
            addressDraft: url,
          }));
        },
        reload: (id) =>
          set((s) => ({
            tabs: s.tabs.map((t) =>
              t.id === id && t.url && !isInternalUrl(t.url)
                ? {
                    ...t,
                    url: t.displayUrl && !isInternalUrl(t.displayUrl) ? t.displayUrl : t.url,
                    loading: true,
                    crash: null,
                    frameKey: t.frameKey + 1,
                  }
                : t,
            ),
          })),
        stop: (id) => set((s) => ({ tabs: s.tabs.map((t) => (t.id === id ? { ...t, loading: false } : t)) })),
        setZoom: (id, zoom) =>
          set((s) => ({
            tabs: s.tabs.map((t) => (t.id === id ? { ...t, zoom: Math.min(2, Math.max(0.5, zoom)) } : t)),
          })),
        addBookmark: (b) => {
          const tab = get().tabs.find((t) => t.id === get().activeId);
          const bookmark: Bookmark = {
            id: uid("bm"),
            title: b?.title || tab?.title || "Bookmark",
            url: b?.url || tab?.displayUrl || tab?.url || "",
            folder: b?.folder,
          };
          if (!bookmark.url || isInternalUrl(bookmark.url)) return;
          set((s) => ({
            bookmarks: [...s.bookmarks, bookmark],
            settings: { ...s.settings, layout: { ...s.settings.layout, bookmarkBar: true } },
          }));
        },
        removeBookmark: (id) => set((s) => ({ bookmarks: s.bookmarks.filter((b) => b.id !== id) })),
        updateBookmark: (id, patch) =>
          set((s) => ({ bookmarks: s.bookmarks.map((b) => (b.id === id ? { ...b, ...patch } : b)) })),
        pushHistory: (url, title, incognito) => {
          if (incognito || get().session.kind === "guest") return;
          if (isInternalUrl(url)) return;
          set((s) => ({
            history: [{ id: uid("h"), url, title, at: Date.now() }, ...s.history.filter((h) => h.url !== url)].slice(
              0,
              500,
            ),
          }));
        },
        clearHistory: () => set({ history: [] }),
        addDownload: (d) => {
          const item: DownloadItem = { ...d, id: uid("dl"), at: Date.now() };
          set((s) => ({ downloads: [item, ...s.downloads].slice(0, 100) }));
          return item.id;
        },
        updateDownload: (id, patch) =>
          set((s) => ({ downloads: s.downloads.map((d) => (d.id === id ? { ...d, ...patch } : d)) })),
        clearDownloads: () => set({ downloads: [] }),
        addFile: (f) => {
          const id = uid("fs");
          set((s) => ({ files: [...s.files, { ...f, id, createdAt: Date.now() }] }));
          return id;
        },
        removeFile: (id) => set((s) => ({ files: s.files.filter((f) => f.id !== id && f.parentId !== id) })),
        upsertPassword: (p) =>
          set((s) => {
            if (s.session.kind === "guest") return s;
            const existing = s.passwords.find((x) => x.origin === p.origin && x.username === p.username);
            if (existing) {
              return {
                passwords: s.passwords.map((x) =>
                  x.id === existing.id ? { ...x, password: p.password, updatedAt: Date.now() } : x,
                ),
              };
            }
            return { passwords: [...s.passwords, { ...p, id: uid("pw"), updatedAt: Date.now() }] };
          }),
        removePassword: (id) => set((s) => ({ passwords: s.passwords.filter((p) => p.id !== id) })),
        log: (kind, message, url) =>
          set((s) => ({
            logs: [...s.logs, { id: uid("log"), at: Date.now(), kind, message, url }].slice(-400),
          })),
        pushNet: (hit) => set((s) => ({ nets: [...s.nets, { ...hit, id: uid("n"), at: Date.now() }].slice(-250) })),
        pushConsole: (hit) =>
          set((s) => ({ consoles: [...s.consoles, { ...hit, id: uid("c"), at: Date.now() }].slice(-250) })),
        setInspect: (v) => set({ inspect: v }),
        setPageSource: (html) => set({ pageSource: html }),
        patchSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
        setTheme: (patch) => set((s) => ({ settings: { ...s.settings, theme: { ...s.settings.theme, ...patch } } })),
        setLayout: (patch) => set((s) => ({ settings: { ...s.settings, layout: { ...s.settings.layout, ...patch } } })),
        setShortcut: (action, combo) =>
          set((s) => ({
            settings: {
              ...s.settings,
              shortcuts: s.settings.shortcuts.map((b) => (b.action === action ? { ...b, combo } : b)),
            },
          })),
        setAddressDraft: (v) => set({ addressDraft: v }),
        setInspectOn: (v) => set({ inspectOn: v }),
        setDevtoolsOpen: (v) => set({ devtoolsOpen: v }),
        cycleTab: (dir) => {
          const { tabs, activeId } = get();
          if (tabs.length < 2) return;
          const idx = tabs.findIndex((t) => t.id === activeId);
          const next = tabs[(idx + dir + tabs.length) % tabs.length];
          if (next) get().activate(next.id);
        },
        applyStealth: () =>
          set((s) => ({
            settings: {
              ...s.settings,
              stealth: true,
              webrtcBlock: true,
              fingerprintResist: true,
              engine: s.settings.engine === "nginx" ? "ultraviolet" : s.settings.engine,
              nginx: { ...s.settings.nginx, forwardFor: false, hidePoweredBy: true, hideServer: true },
            },
          })),
        importAll: (data) => {
          if (!data || typeof data !== "object") return "Invalid file";
          const d = data as Record<string, unknown>;
          try {
            const next: Partial<Pick<BrowserStore, "bookmarks" | "settings" | "passwords" | "history">> = {};
            if (Array.isArray(d.bookmarks)) next.bookmarks = d.bookmarks as Bookmark[];
            if (d.settings && typeof d.settings === "object") {
              next.settings = {
                ...DEFAULT_SETTINGS,
                ...(d.settings as Settings),
                nginx: { ...DEFAULT_NGINX_LAYER, ...((d.settings as Settings).nginx ?? {}) },
                shortcuts: (d.settings as Settings).shortcuts?.length
                  ? (d.settings as Settings).shortcuts
                  : DEFAULT_SHORTCUTS,
              };
            }
            if (Array.isArray(d.passwords)) next.passwords = d.passwords as SavedPassword[];
            if (Array.isArray(d.history)) next.history = d.history as HistoryEntry[];
            set(next);
            return null;
          } catch {
            return "Could not import that file";
          }
        },
        exportAll: () => {
          const s = get();
          return {
            veil: 2,
            exportedAt: new Date().toISOString(),
            settings: s.settings,
            bookmarks: s.bookmarks,
            history: s.history,
            passwords: s.passwords,
          };
        },
      };
    },
    {
      name: "veil-browser",
      skipHydration: true,
      partialize: (s) => {
        if (s.session.kind !== "user") {
          return {};
        }
        const persistentTabs = s.tabs.filter((t) => !t.incognito);
        const tabs = (persistentTabs.length ? persistentTabs : [freshTab()]).map((t) => ({
          ...t,
          loading: false,
          crash: null,
        }));
        const activeId = tabs.some((t) => t.id === s.activeId) ? s.activeId : tabs[0]!.id;
        return {
          session: s.session,
          tabs,
          activeId,
          bookmarks: s.bookmarks,
          history: s.history,
          downloads: s.downloads.map(({ href: _h, ...rest }) => rest),
          passwords: s.passwords,
          files: s.files.map(({ href: _h, ...rest }) => rest),
          settings: s.settings,
        };
      },
    },
  ),
);

function hostnameFrom(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^veil:\/\//, "") || "Veil";
  }
}

export function activeTab(s: { tabs: TabState[]; activeId: string }): TabState | undefined {
  return s.tabs.find((t) => t.id === s.activeId) ?? s.tabs[0];
}

export function currentSearchEngine(s: Settings): SearchEngine {
  return s.searchEngines.find((e) => e.id === s.searchEngineId) ?? s.searchEngines[0] ?? DEFAULT_SEARCH_ENGINES[0]!;
}

export function engineName(id: EngineId): string {
  return ENGINES[id].name;
}

export { DEFAULT_SETTINGS };
