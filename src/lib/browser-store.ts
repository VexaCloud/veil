import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_NGINX_LAYER, ENGINES, type EngineId, type NginxLayer } from "@/lib/proxy/types";
import { uid } from "@/lib/utils";

export type SearchEngine = {
  id: string;
  name: string;
  url: string;
};

export type Bookmark = {
  id: string;
  title: string;
  url: string;
  folder?: string;
};

export type HistoryEntry = {
  id: string;
  url: string;
  title: string;
  at: number;
};

export type DownloadItem = {
  id: string;
  filename: string;
  url: string;
  mime: string;
  size: number;
  at: number;
  status: "saving" | "done" | "error";
  href?: string;
};

export type SavedPassword = {
  id: string;
  origin: string;
  username: string;
  password: string;
  updatedAt: number;
};

export type LogEntry = {
  id: string;
  at: number;
  kind: "nav" | "net" | "error" | "console" | "system";
  message: string;
  url?: string;
};

export type NetHit = {
  id: string;
  at: number;
  method: string;
  url: string;
  status?: number;
  ms?: number;
  phase: string;
};

export type ConsoleHit = {
  id: string;
  at: number;
  level: string;
  args: string[];
};

export type ThemeSettings = {
  mode: "dark" | "light" | "system";
  accent: string;
  bg: string;
  fg: string;
  font: string;
  mono: string;
  radius: number;
  density: "compact" | "comfortable";
  customCss: string;
};

export type LayoutSettings = {
  tabPosition: "top" | "bottom";
  bookmarkBar: boolean;
  statusBar: boolean;
  sidebar: "none" | "bookmarks" | "history" | "downloads";
};

export type LogSettings = {
  nav: boolean;
  net: boolean;
  error: boolean;
  console: boolean;
  retentionHours: number;
  maxEntries: number;
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
  logging: LogSettings;
  lockEnabled: boolean;
  lockHash: string;
  showShortcutsOnNewTab: boolean;
};

export const DEFAULT_SEARCH_ENGINES: SearchEngine[] = [
  { id: "brave", name: "Brave Search", url: "https://search.brave.com/search?q=%s" },
  { id: "ddg", name: "DuckDuckGo", url: "https://duckduckgo.com/?q=%s" },
  { id: "bing", name: "Bing", url: "https://www.bing.com/search?q=%s" },
  { id: "google", name: "Google", url: "https://www.google.com/search?q=%s" },
  { id: "startpage", name: "Startpage", url: "https://www.startpage.com/sp/search?query=%s" },
];

export const DEFAULT_BOOKMARKS: Bookmark[] = [
  { id: "b1", title: "Brave Search", url: "https://search.brave.com/" },
  { id: "b2", title: "Wikipedia", url: "https://wikipedia.org/" },
  { id: "b3", title: "GitHub", url: "https://github.com/" },
  { id: "b4", title: "MDN", url: "https://developer.mozilla.org/" },
  { id: "b5", title: "Archive", url: "https://web.archive.org/" },
  { id: "b6", title: "YouTube", url: "https://www.youtube.com/" },
  { id: "b7", title: "Reddit", url: "https://www.reddit.com/" },
  { id: "b8", title: "BBC", url: "https://www.bbc.com/" },
];

export const DEFAULT_THEME: ThemeSettings = {
  mode: "dark",
  accent: "#c9cfd8",
  bg: "#0b0c0e",
  fg: "#eceef2",
  font: "Outfit",
  mono: "JetBrains Mono",
  radius: 10,
  density: "compact",
  customCss: "",
};

const DEFAULT_SETTINGS: Settings = {
  engine: "nginx",
  nginx: DEFAULT_NGINX_LAYER,
  searchEngineId: "brave",
  searchEngines: DEFAULT_SEARCH_ENGINES,
  homeUrl: "",
  adblock: false,
  filterLists: [],
  stealth: false,
  webrtcBlock: false,
  fingerprintResist: false,
  theme: DEFAULT_THEME,
  layout: {
    tabPosition: "top",
    bookmarkBar: true,
    statusBar: true,
    sidebar: "none",
  },
  logging: {
    nav: true,
    net: false,
    error: true,
    console: false,
    retentionHours: 24,
    maxEntries: 400,
  },
  lockEnabled: false,
  lockHash: "",
  showShortcutsOnNewTab: true,
};

function freshTab(): TabState {
  const id = uid("tab");
  return {
    id,
    title: "New tab",
    url: "",
    displayUrl: "",
    redirectedFrom: null,
    loading: false,
    crash: null,
    favicon: null,
    stack: [],
    stackIndex: -1,
    zoom: 1,
    createdAt: Date.now(),
    frameKey: 1,
  };
}

export type Overlay =
  | "none"
  | "settings"
  | "history"
  | "downloads"
  | "devtools"
  | "shortcuts"
  | "speed"
  | "theme";

type BrowserStore = {
  hydrated: boolean;
  locked: boolean;
  tabs: TabState[];
  activeId: string;
  bookmarks: Bookmark[];
  history: HistoryEntry[];
  downloads: DownloadItem[];
  passwords: SavedPassword[];
  logs: LogEntry[];
  nets: NetHit[];
  consoles: ConsoleHit[];
  inspect: { html: string; tag: string; styles: Record<string, string> | null } | null;
  settings: Settings;
  overlay: Overlay;
  addressDraft: string;
  inspectOn: boolean;
  closedStack: TabState[];
  setHydrated: (v: boolean) => void;
  setLocked: (v: boolean) => void;
  newTab: (url?: string) => string;
  closeTab: (id: string) => void;
  restoreTab: () => void;
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
  pushHistory: (url: string, title: string) => void;
  clearHistory: () => void;
  addDownload: (d: Omit<DownloadItem, "id" | "at">) => void;
  updateDownload: (id: string, patch: Partial<DownloadItem>) => void;
  clearDownloads: () => void;
  upsertPassword: (p: Omit<SavedPassword, "id" | "updatedAt">) => void;
  removePassword: (id: string) => void;
  log: (kind: LogEntry["kind"], message: string, url?: string) => void;
  clearLogs: () => void;
  pushNet: (hit: Omit<NetHit, "id" | "at">) => void;
  pushConsole: (hit: Omit<ConsoleHit, "id" | "at">) => void;
  setInspect: (v: BrowserStore["inspect"]) => void;
  patchSettings: (patch: Partial<Settings>) => void;
  setTheme: (patch: Partial<ThemeSettings>) => void;
  setLayout: (patch: Partial<LayoutSettings>) => void;
  setOverlay: (o: Overlay) => void;
  setAddressDraft: (v: string) => void;
  setInspectOn: (v: boolean) => void;
  applyStealth: () => void;
  importAll: (data: unknown) => string | null;
  exportAll: () => Record<string, unknown>;
  resetChrome: () => void;
};

function pruneLogs(logs: LogEntry[], s: LogSettings): LogEntry[] {
  const cutoff = Date.now() - s.retentionHours * 3600 * 1000;
  return logs.filter((l) => l.at >= cutoff).slice(-s.maxEntries);
}

export const useBrowserStore = create<BrowserStore>()(
  persist(
    (set, get) => {
      const first = freshTab();
      return {
        hydrated: false,
        locked: false,
        tabs: [first],
        activeId: first.id,
        bookmarks: DEFAULT_BOOKMARKS,
        history: [],
        downloads: [],
        passwords: [],
        logs: [],
        nets: [],
        consoles: [],
        inspect: null,
        settings: DEFAULT_SETTINGS,
        overlay: "none",
        addressDraft: "",
        inspectOn: false,
        closedStack: [],
        setHydrated: (v) => set({ hydrated: v }),
        setLocked: (v) => set({ locked: v }),
        newTab: (url) => {
          const tab = freshTab();
          set((s) => ({ tabs: [...s.tabs, tab], activeId: tab.id, addressDraft: url ?? "" }));
          if (url) get().navigate(tab.id, url, { fromUser: true });
          return tab.id;
        },
        closeTab: (id) => {
          const { tabs, activeId } = get();
          if (tabs.length === 1) {
            const t = freshTab();
            set({ tabs: [t], activeId: t.id, addressDraft: "" });
            return;
          }
          const idx = tabs.findIndex((t) => t.id === id);
          const closing = tabs[idx];
          const nextTabs = tabs.filter((t) => t.id !== id);
          let nextId = activeId;
          if (activeId === id) {
            nextId = (nextTabs[idx] ?? nextTabs[idx - 1] ?? nextTabs[0])!.id;
          }
          set({
            tabs: nextTabs,
            activeId: nextId,
            closedStack: closing ? [closing, ...get().closedStack].slice(0, 20) : get().closedStack,
          });
        },
        restoreTab: () => {
          const [tab, ...rest] = get().closedStack;
          if (!tab) return;
          const restored = { ...tab, id: uid("tab"), loading: false };
          set((s) => ({
            tabs: [...s.tabs, restored],
            activeId: restored.id,
            closedStack: rest,
          }));
        },
        activate: (id) => {
          const tab = get().tabs.find((t) => t.id === id);
          set({ activeId: id, addressDraft: tab?.displayUrl || tab?.url || "" });
        },
        updateTab: (id, patch) =>
          set((s) => ({
            tabs: s.tabs.map((t) => (t.id === id ? { ...t, ...patch } : t)),
          })),
        navigate: (id, url, opts) => {
          set((s) => ({
            tabs: s.tabs.map((t) => {
              if (t.id !== id) return t;
              const replace = opts?.replace && t.stackIndex >= 0;
              let stack = t.stack.slice();
              let stackIndex = t.stackIndex;
              if (replace) {
                stack[stackIndex] = url;
              } else {
                stack = stack.slice(0, stackIndex + 1);
                stack.push(url);
                stackIndex = stack.length - 1;
              }
              return {
                ...t,
                url,
                displayUrl: url,
                redirectedFrom: opts?.fromUser ? null : t.redirectedFrom,
                loading: true,
                crash: null,
                stack,
                stackIndex,
                title: t.title === "New tab" ? hostnameFrom(url) : t.title,
                frameKey: t.frameKey + 1,
              };
            }),
            addressDraft: url,
          }));
          if (get().settings.logging.nav) get().log("nav", `Open ${url}`, url);
        },
        back: (id) => {
          const tab = get().tabs.find((t) => t.id === id);
          if (!tab || tab.stackIndex <= 0) return;
          const url = tab.stack[tab.stackIndex - 1]!;
          set((s) => ({
            tabs: s.tabs.map((t) =>
              t.id === id
                ? { ...t, stackIndex: t.stackIndex - 1, url, displayUrl: url, loading: true, frameKey: t.frameKey + 1 }
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
                ? { ...t, stackIndex: t.stackIndex + 1, url, displayUrl: url, loading: true, frameKey: t.frameKey + 1 }
                : t,
            ),
            addressDraft: url,
          }));
        },
        reload: (id) =>
          set((s) => ({
            tabs: s.tabs.map((t) => {
              if (t.id !== id) return t;
              const url = t.displayUrl || t.url;
              if (!url) return t;
              return { ...t, url, loading: true, crash: null, frameKey: t.frameKey + 1 };
            }),
          })),
        stop: (id) =>
          set((s) => ({
            tabs: s.tabs.map((t) => (t.id === id ? { ...t, loading: false } : t)),
          })),
        setZoom: (id, zoom) =>
          set((s) => ({
            tabs: s.tabs.map((t) => (t.id === id ? { ...t, zoom: Math.min(2, Math.max(0.5, zoom)) } : t)),
          })),
        addBookmark: (b) => {
          const tab = get().tabs.find((t) => t.id === get().activeId);
          const bookmark: Bookmark = {
            id: uid("bm"),
            title: b?.title || tab?.title || "Bookmark",
            url: b?.url || tab?.url || "",
            folder: b?.folder,
          };
          if (!bookmark.url) return;
          set((s) => ({ bookmarks: [...s.bookmarks, bookmark] }));
        },
        removeBookmark: (id) => set((s) => ({ bookmarks: s.bookmarks.filter((b) => b.id !== id) })),
        updateBookmark: (id, patch) =>
          set((s) => ({
            bookmarks: s.bookmarks.map((b) => (b.id === id ? { ...b, ...patch } : b)),
          })),
        pushHistory: (url, title) =>
          set((s) => ({
            history: [{ id: uid("h"), url, title, at: Date.now() }, ...s.history.filter((h) => h.url !== url)].slice(
              0,
              500,
            ),
          })),
        clearHistory: () => set({ history: [] }),
        addDownload: (d) => {
          const item: DownloadItem = { ...d, id: uid("dl"), at: Date.now() };
          set((s) => ({ downloads: [item, ...s.downloads].slice(0, 100) }));
        },
        updateDownload: (id, patch) =>
          set((s) => ({
            downloads: s.downloads.map((d) => (d.id === id ? { ...d, ...patch } : d)),
          })),
        clearDownloads: () => set({ downloads: [] }),
        upsertPassword: (p) =>
          set((s) => {
            const existing = s.passwords.find((x) => x.origin === p.origin && x.username === p.username);
            if (existing) {
              return {
                passwords: s.passwords.map((x) =>
                  x.id === existing.id ? { ...x, password: p.password, updatedAt: Date.now() } : x,
                ),
              };
            }
            return {
              passwords: [
                ...s.passwords,
                { ...p, id: uid("pw"), updatedAt: Date.now() },
              ],
            };
          }),
        removePassword: (id) => set((s) => ({ passwords: s.passwords.filter((p) => p.id !== id) })),
        log: (kind, message, url) =>
          set((s) => ({
            logs: pruneLogs(
              [...s.logs, { id: uid("log"), at: Date.now(), kind, message, url }],
              s.settings.logging,
            ),
          })),
        clearLogs: () => set({ logs: [] }),
        pushNet: (hit) =>
          set((s) => ({
            nets: [...s.nets, { ...hit, id: uid("n"), at: Date.now() }].slice(-200),
          })),
        pushConsole: (hit) =>
          set((s) => ({
            consoles: [...s.consoles, { ...hit, id: uid("c"), at: Date.now() }].slice(-200),
          })),
        setInspect: (v) => set({ inspect: v }),
        patchSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
        setTheme: (patch) =>
          set((s) => ({ settings: { ...s.settings, theme: { ...s.settings.theme, ...patch } } })),
        setLayout: (patch) =>
          set((s) => ({ settings: { ...s.settings, layout: { ...s.settings.layout, ...patch } } })),
        setOverlay: (o) => set({ overlay: o }),
        setAddressDraft: (v) => set({ addressDraft: v }),
        setInspectOn: (v) => set({ inspectOn: v }),
        applyStealth: () =>
          set((s) => ({
            settings: {
              ...s.settings,
              stealth: true,
              webrtcBlock: true,
              fingerprintResist: true,
              engine: s.settings.engine === "nginx" ? "ultraviolet" : s.settings.engine,
              nginx: {
                ...s.settings.nginx,
                forwardFor: false,
                hidePoweredBy: true,
                hideServer: true,
                userAgentOverride: "",
              },
            },
          })),
        importAll: (data) => {
          if (!data || typeof data !== "object") return "Invalid file";
          const d = data as Record<string, unknown>;
          try {
            const next: Partial<Pick<BrowserStore, "bookmarks" | "settings" | "passwords" | "history">> = {};
            if (Array.isArray(d.bookmarks)) next.bookmarks = d.bookmarks as Bookmark[];
            if (d.settings && typeof d.settings === "object") {
              next.settings = { ...DEFAULT_SETTINGS, ...(d.settings as Settings), nginx: { ...DEFAULT_NGINX_LAYER, ...((d.settings as Settings).nginx ?? {}) } };
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
            veil: 1,
            exportedAt: new Date().toISOString(),
            settings: s.settings,
            bookmarks: s.bookmarks,
            history: s.history,
            passwords: s.passwords,
          };
        },
        resetChrome: () => {
          const t = freshTab();
          set({
            tabs: [t],
            activeId: t.id,
            bookmarks: DEFAULT_BOOKMARKS,
            settings: DEFAULT_SETTINGS,
            addressDraft: "",
          });
        },
      };
    },
    {
      name: "veil-browser",
      skipHydration: true,
      partialize: (s) => ({
        tabs: s.tabs.map((t) => ({ ...t, loading: false, crash: null })),
        activeId: s.activeId,
        bookmarks: s.bookmarks,
        history: s.history,
        downloads: s.downloads.map(({ href: _h, ...rest }) => rest),
        passwords: s.passwords,
        logs: s.logs,
        settings: s.settings,
        locked: s.settings.lockEnabled,
      }),
    },
  ),
);

function hostnameFrom(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
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
