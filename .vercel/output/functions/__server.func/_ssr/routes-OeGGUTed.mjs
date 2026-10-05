import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { C as Gauge, D as ArrowRight, E as Clock, O as ArrowLeft, S as Globe, T as Download, _ as Paintbrush, a as Trash2, b as House, c as SlidersHorizontal, d as Settings, f as Settings2, g as Plus, h as RotateCw, l as Shield, m as ScrollText, n as Wifi, o as Star, p as Search, r as Upload, s as Square, t as X, u as ShieldOff, v as Lock, w as Ellipsis, x as History, y as Keyboard } from "../_libs/lucide-react.mjs";
import { i as ENGINES, n as encodeProxyPath, r as DEFAULT_NGINX_LAYER } from "./router-Fv5TB1wU.mjs";
import { n as Slot } from "../_libs/@radix-ui/react-primitive+[...].mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { n as SwitchThumb, t as Switch$1 } from "../_libs/@radix-ui/react-switch+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-OeGGUTed.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function uid(prefix = "") {
	const id = Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
	return prefix ? `${prefix}_${id}` : id;
}
function looksLikeUrl(input) {
	const v = input.trim();
	if (!v) return false;
	if (/^[a-z][a-z0-9+.-]*:\/\//i.test(v)) return true;
	if (v.startsWith("localhost") || v.startsWith("127.0.0.1")) return true;
	if (/\s/.test(v)) return false;
	return /^(?:[\w-]+\.)+[a-z]{2,}(?:[/:?#].*)?$/i.test(v);
}
function normalizeNavigableUrl(input, searchUrl) {
	const raw = input.trim();
	if (!raw) return "";
	if (looksLikeUrl(raw)) {
		if (/^[a-z][a-z0-9+.-]*:\/\//i.test(raw)) return raw;
		return `https://${raw}`;
	}
	return searchUrl.replace("%s", encodeURIComponent(raw));
}
function hostnameOf(url) {
	try {
		return new URL(url).hostname;
	} catch {
		return url;
	}
}
function prettyUrl(url) {
	try {
		const u = new URL(url);
		return `${u.host}${u.pathname}${u.search}${u.hash}`.replace(/\/$/, "") || u.host;
	} catch {
		return url;
	}
}
function formatBytes(n) {
	if (n < 1024) return `${n} B`;
	if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`;
	return `${(n / 1048576).toFixed(1)} MB`;
}
function formatRelative(ts) {
	const d = Date.now() - ts;
	const sec = Math.round(d / 1e3);
	if (sec < 60) return "just now";
	const min = Math.round(sec / 60);
	if (min < 60) return `${min}m ago`;
	const hr = Math.round(min / 60);
	if (hr < 24) return `${hr}h ago`;
	const day = Math.round(hr / 24);
	if (day < 7) return `${day}d ago`;
	return new Date(ts).toLocaleDateString();
}
async function sha256(text) {
	const data = new TextEncoder().encode(text);
	const buf = await crypto.subtle.digest("SHA-256", data);
	return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function downloadJson(filename, data) {
	const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}
function letterMark(title) {
	const parts = title.replace(/^https?:\/\//, "").replace(/^www\./, "").split(/[./\s-]+/).filter(Boolean);
	return ((parts[0]?.[0] ?? "V") + (parts[1]?.[0] ?? parts[0]?.[1] ?? "")).toUpperCase();
}
var DEFAULT_SEARCH_ENGINES = [
	{
		id: "brave",
		name: "Brave Search",
		url: "https://search.brave.com/search?q=%s"
	},
	{
		id: "ddg",
		name: "DuckDuckGo",
		url: "https://duckduckgo.com/?q=%s"
	},
	{
		id: "bing",
		name: "Bing",
		url: "https://www.bing.com/search?q=%s"
	},
	{
		id: "google",
		name: "Google",
		url: "https://www.google.com/search?q=%s"
	},
	{
		id: "startpage",
		name: "Startpage",
		url: "https://www.startpage.com/sp/search?query=%s"
	}
];
var DEFAULT_BOOKMARKS = [
	{
		id: "b1",
		title: "Brave Search",
		url: "https://search.brave.com/"
	},
	{
		id: "b2",
		title: "Wikipedia",
		url: "https://wikipedia.org/"
	},
	{
		id: "b3",
		title: "GitHub",
		url: "https://github.com/"
	},
	{
		id: "b4",
		title: "MDN",
		url: "https://developer.mozilla.org/"
	},
	{
		id: "b5",
		title: "Archive",
		url: "https://web.archive.org/"
	},
	{
		id: "b6",
		title: "YouTube",
		url: "https://www.youtube.com/"
	},
	{
		id: "b7",
		title: "Reddit",
		url: "https://www.reddit.com/"
	},
	{
		id: "b8",
		title: "BBC",
		url: "https://www.bbc.com/"
	}
];
var DEFAULT_SETTINGS = {
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
	theme: {
		mode: "dark",
		accent: "#c9cfd8",
		bg: "#0b0c0e",
		fg: "#eceef2",
		font: "Outfit",
		mono: "JetBrains Mono",
		radius: 10,
		density: "compact",
		customCss: ""
	},
	layout: {
		tabPosition: "top",
		bookmarkBar: true,
		statusBar: true,
		sidebar: "none"
	},
	logging: {
		nav: true,
		net: false,
		error: true,
		console: false,
		retentionHours: 24,
		maxEntries: 400
	},
	lockEnabled: false,
	lockHash: "",
	showShortcutsOnNewTab: true
};
function freshTab() {
	return {
		id: uid("tab"),
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
		frameKey: 1
	};
}
function pruneLogs(logs, s) {
	const cutoff = Date.now() - s.retentionHours * 3600 * 1e3;
	return logs.filter((l) => l.at >= cutoff).slice(-s.maxEntries);
}
var useBrowserStore = create()(persist((set, get) => {
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
			set((s) => ({
				tabs: [...s.tabs, tab],
				activeId: tab.id,
				addressDraft: url ?? ""
			}));
			if (url) get().navigate(tab.id, url, { fromUser: true });
			return tab.id;
		},
		closeTab: (id) => {
			const { tabs, activeId } = get();
			if (tabs.length === 1) {
				const t = freshTab();
				set({
					tabs: [t],
					activeId: t.id,
					addressDraft: ""
				});
				return;
			}
			const idx = tabs.findIndex((t) => t.id === id);
			const closing = tabs[idx];
			const nextTabs = tabs.filter((t) => t.id !== id);
			let nextId = activeId;
			if (activeId === id) nextId = (nextTabs[idx] ?? nextTabs[idx - 1] ?? nextTabs[0]).id;
			set({
				tabs: nextTabs,
				activeId: nextId,
				closedStack: closing ? [closing, ...get().closedStack].slice(0, 20) : get().closedStack
			});
		},
		restoreTab: () => {
			const [tab, ...rest] = get().closedStack;
			if (!tab) return;
			const restored = {
				...tab,
				id: uid("tab"),
				loading: false
			};
			set((s) => ({
				tabs: [...s.tabs, restored],
				activeId: restored.id,
				closedStack: rest
			}));
		},
		activate: (id) => {
			const tab = get().tabs.find((t) => t.id === id);
			set({
				activeId: id,
				addressDraft: tab?.displayUrl || tab?.url || ""
			});
		},
		updateTab: (id, patch) => set((s) => ({ tabs: s.tabs.map((t) => t.id === id ? {
			...t,
			...patch
		} : t) })),
		navigate: (id, url, opts) => {
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
						loading: true,
						crash: null,
						stack,
						stackIndex,
						title: t.title === "New tab" ? hostnameFrom(url) : t.title,
						frameKey: t.frameKey + 1
					};
				}),
				addressDraft: url
			}));
			if (get().settings.logging.nav) get().log("nav", `Open ${url}`, url);
		},
		back: (id) => {
			const tab = get().tabs.find((t) => t.id === id);
			if (!tab || tab.stackIndex <= 0) return;
			const url = tab.stack[tab.stackIndex - 1];
			set((s) => ({
				tabs: s.tabs.map((t) => t.id === id ? {
					...t,
					stackIndex: t.stackIndex - 1,
					url,
					displayUrl: url,
					loading: true,
					frameKey: t.frameKey + 1
				} : t),
				addressDraft: url
			}));
		},
		forward: (id) => {
			const tab = get().tabs.find((t) => t.id === id);
			if (!tab || tab.stackIndex >= tab.stack.length - 1) return;
			const url = tab.stack[tab.stackIndex + 1];
			set((s) => ({
				tabs: s.tabs.map((t) => t.id === id ? {
					...t,
					stackIndex: t.stackIndex + 1,
					url,
					displayUrl: url,
					loading: true,
					frameKey: t.frameKey + 1
				} : t),
				addressDraft: url
			}));
		},
		reload: (id) => set((s) => ({ tabs: s.tabs.map((t) => t.id === id && t.url ? {
			...t,
			loading: true,
			crash: null,
			frameKey: t.frameKey + 1
		} : t) })),
		stop: (id) => set((s) => ({ tabs: s.tabs.map((t) => t.id === id ? {
			...t,
			loading: false
		} : t) })),
		setZoom: (id, zoom) => set((s) => ({ tabs: s.tabs.map((t) => t.id === id ? {
			...t,
			zoom: Math.min(2, Math.max(.5, zoom))
		} : t) })),
		addBookmark: (b) => {
			const tab = get().tabs.find((t) => t.id === get().activeId);
			const bookmark = {
				id: uid("bm"),
				title: b?.title || tab?.title || "Bookmark",
				url: b?.url || tab?.url || "",
				folder: b?.folder
			};
			if (!bookmark.url) return;
			set((s) => ({ bookmarks: [...s.bookmarks, bookmark] }));
		},
		removeBookmark: (id) => set((s) => ({ bookmarks: s.bookmarks.filter((b) => b.id !== id) })),
		updateBookmark: (id, patch) => set((s) => ({ bookmarks: s.bookmarks.map((b) => b.id === id ? {
			...b,
			...patch
		} : b) })),
		pushHistory: (url, title) => set((s) => ({ history: [{
			id: uid("h"),
			url,
			title,
			at: Date.now()
		}, ...s.history.filter((h) => h.url !== url)].slice(0, 500) })),
		clearHistory: () => set({ history: [] }),
		addDownload: (d) => {
			const item = {
				...d,
				id: uid("dl"),
				at: Date.now()
			};
			set((s) => ({ downloads: [item, ...s.downloads].slice(0, 100) }));
		},
		updateDownload: (id, patch) => set((s) => ({ downloads: s.downloads.map((d) => d.id === id ? {
			...d,
			...patch
		} : d) })),
		clearDownloads: () => set({ downloads: [] }),
		upsertPassword: (p) => set((s) => {
			const existing = s.passwords.find((x) => x.origin === p.origin && x.username === p.username);
			if (existing) return { passwords: s.passwords.map((x) => x.id === existing.id ? {
				...x,
				password: p.password,
				updatedAt: Date.now()
			} : x) };
			return { passwords: [...s.passwords, {
				...p,
				id: uid("pw"),
				updatedAt: Date.now()
			}] };
		}),
		removePassword: (id) => set((s) => ({ passwords: s.passwords.filter((p) => p.id !== id) })),
		log: (kind, message, url) => set((s) => ({ logs: pruneLogs([...s.logs, {
			id: uid("log"),
			at: Date.now(),
			kind,
			message,
			url
		}], s.settings.logging) })),
		clearLogs: () => set({ logs: [] }),
		pushNet: (hit) => set((s) => ({ nets: [...s.nets, {
			...hit,
			id: uid("n"),
			at: Date.now()
		}].slice(-200) })),
		pushConsole: (hit) => set((s) => ({ consoles: [...s.consoles, {
			...hit,
			id: uid("c"),
			at: Date.now()
		}].slice(-200) })),
		setInspect: (v) => set({ inspect: v }),
		patchSettings: (patch) => set((s) => ({ settings: {
			...s.settings,
			...patch
		} })),
		setTheme: (patch) => set((s) => ({ settings: {
			...s.settings,
			theme: {
				...s.settings.theme,
				...patch
			}
		} })),
		setLayout: (patch) => set((s) => ({ settings: {
			...s.settings,
			layout: {
				...s.settings.layout,
				...patch
			}
		} })),
		setOverlay: (o) => set({ overlay: o }),
		setAddressDraft: (v) => set({ addressDraft: v }),
		setInspectOn: (v) => set({ inspectOn: v }),
		applyStealth: () => set((s) => ({ settings: {
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
				userAgentOverride: ""
			}
		} })),
		importAll: (data) => {
			if (!data || typeof data !== "object") return "Invalid file";
			const d = data;
			try {
				const next = {};
				if (Array.isArray(d.bookmarks)) next.bookmarks = d.bookmarks;
				if (d.settings && typeof d.settings === "object") next.settings = {
					...DEFAULT_SETTINGS,
					...d.settings,
					nginx: {
						...DEFAULT_NGINX_LAYER,
						...d.settings.nginx ?? {}
					}
				};
				if (Array.isArray(d.passwords)) next.passwords = d.passwords;
				if (Array.isArray(d.history)) next.history = d.history;
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
				exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
				settings: s.settings,
				bookmarks: s.bookmarks,
				history: s.history,
				passwords: s.passwords
			};
		},
		resetChrome: () => {
			const t = freshTab();
			set({
				tabs: [t],
				activeId: t.id,
				bookmarks: DEFAULT_BOOKMARKS,
				settings: DEFAULT_SETTINGS,
				addressDraft: ""
			});
		}
	};
}, {
	name: "veil-browser",
	skipHydration: true,
	partialize: (s) => ({
		tabs: s.tabs.map((t) => ({
			...t,
			loading: false,
			crash: null
		})),
		activeId: s.activeId,
		bookmarks: s.bookmarks,
		history: s.history,
		downloads: s.downloads.map(({ href: _h, ...rest }) => rest),
		passwords: s.passwords,
		logs: s.logs,
		settings: s.settings,
		locked: s.settings.lockEnabled
	})
}));
function hostnameFrom(url) {
	try {
		return new URL(url).hostname.replace(/^www\./, "");
	} catch {
		return url;
	}
}
function currentSearchEngine(s) {
	return s.searchEngines.find((e) => e.id === s.searchEngineId) ?? s.searchEngines[0] ?? DEFAULT_SEARCH_ENGINES[0];
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[opacity,transform,background-color,color] duration-[var(--motion-quick)] ease-[var(--ease-smooth-out)] disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]", {
	variants: {
		variant: {
			default: "bg-accent text-accent-foreground hover:opacity-90",
			secondary: "bg-surface-2 text-foreground hover:bg-surface",
			ghost: "text-foreground hover:bg-surface-2",
			outline: "border border-border bg-transparent hover:bg-surface-2",
			danger: "bg-danger/15 text-danger hover:bg-danger/25"
		},
		size: {
			default: "h-10 px-3.5",
			sm: "h-8 px-2.5 text-xs",
			lg: "h-11 px-4",
			icon: "size-10",
			"icon-sm": "size-8"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		...props
	});
}
function Input({ className, type, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		className: cn("flex h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted outline-none transition-[box-shadow,border-color] duration-[var(--motion-quick)] focus-visible:border-ring/60 focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-50", className),
		...props
	});
}
function VeilMark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 32 32",
		className,
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "3",
				y: "3",
				width: "26",
				height: "26",
				rx: "7",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.6"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "7.5",
				y: "7.5",
				width: "17",
				height: "17",
				rx: "4.5",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.4",
				opacity: "0.7"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "12",
				y: "12",
				width: "8",
				height: "8",
				rx: "2",
				fill: "currentColor",
				opacity: "0.9"
			})
		]
	});
}
function LockScreen() {
	const lockHash = useBrowserStore((s) => s.settings.lockHash);
	const setLocked = useBrowserStore((s) => s.setLocked);
	const [value, setValue] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-dvh flex-col items-center justify-center bg-background px-6 text-foreground",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-sm rounded-xl border border-border bg-surface p-6 shadow-[var(--shadow-panel)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 flex flex-col items-center gap-3 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VeilMark, { className: "size-10" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-lg font-semibold tracking-tight",
					children: "Veil is locked"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Enter the proxy password to continue."
				})] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "flex flex-col gap-3",
				onSubmit: async (e) => {
					e.preventDefault();
					if (await sha256(value) === lockHash) {
						setLocked(false);
						setError("");
					} else setError("That password doesn’t match.");
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "password",
						autoFocus: true,
						value,
						onChange: (e) => setValue(e.target.value),
						placeholder: "Password",
						autoComplete: "current-password"
					}),
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-danger",
						children: error
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						className: "h-11",
						children: "Unlock"
					})
				]
			})]
		})
	});
}
function NewTab({ onGo }) {
	const bookmarks = useBrowserStore((s) => s.bookmarks);
	const history = useBrowserStore((s) => s.history);
	const settings = useBrowserStore((s) => s.settings);
	const engine = currentSearchEngine(settings);
	const recent = history.slice(0, 6);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex h-full flex-col overflow-auto veil-scroll",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "pointer-events-none absolute inset-0 opacity-60",
			style: { background: "radial-gradient(1200px 400px at 50% -10%, color-mix(in oklab, var(--veil-ring) 18%, transparent), transparent 70%)" }
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative mx-auto flex w-full max-w-3xl flex-col gap-10 px-5 pb-16 pt-16 sm:pt-24",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "flex flex-col items-center gap-4 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VeilMark, { className: "size-11 text-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-sans text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl",
						children: "Veil"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "A private window on the open web."
					})] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "flex items-center gap-2 rounded-xl border border-border bg-surface p-1.5 shadow-[var(--shadow-panel)]",
					onSubmit: (e) => {
						e.preventDefault();
						const fd = new FormData(e.currentTarget);
						const url = normalizeNavigableUrl(String(fd.get("q") ?? ""), engine.url);
						if (url) onGo(url);
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "ml-3 size-4 shrink-0 text-muted" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							name: "q",
							autoFocus: true,
							placeholder: `Search ${engine.name} or enter an address`,
							className: "h-11 min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							className: "h-11 rounded-[calc(var(--veil-radius)+2px)] bg-accent px-4 text-sm font-medium text-accent-foreground",
							children: "Go"
						})
					]
				}),
				settings.showShortcutsOnNewTab ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-3 flex items-center justify-between",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-xs font-medium uppercase tracking-[0.14em] text-muted",
						children: "Shortcuts"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 gap-2 sm:grid-cols-4",
					children: bookmarks.slice(0, 8).map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShortcutTile, {
						bookmark: b,
						onGo
					}, b.id))
				})] }) : null,
				recent.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex items-center gap-2 text-muted",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-xs font-medium uppercase tracking-[0.14em]",
						children: "Recent"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface",
					children: recent.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => onGo(h.url),
						className: "flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-surface-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block truncate text-sm text-foreground",
								children: h.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block truncate text-xs text-muted",
								children: h.url
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "shrink-0 text-xs tabular-nums text-muted",
							children: formatRelative(h.at)
						})]
					}) }, h.id))
				})] }) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-center text-xs text-muted",
					children: "Alt+L address · Alt+T tab · Alt+Shift+N stealth · Alt+, settings"
				})
			]
		})]
	});
}
function ShortcutTile({ bookmark, onGo }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: () => onGo(bookmark.url),
		className: "group flex items-center gap-3 rounded-xl border border-border bg-surface p-3 text-left transition-[background-color,transform] duration-[var(--motion-quick)] hover:bg-surface-2 active:scale-[0.99]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "grid size-9 place-items-center rounded-lg bg-surface-2 text-xs font-semibold tracking-wide text-foreground",
			children: letterMark(bookmark.title)
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block truncate text-sm font-medium",
				children: bookmark.title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block truncate text-xs text-muted",
				children: bookmark.url.replace(/^https?:\/\//, "")
			})]
		})]
	});
}
function Label({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
		className: cn("text-sm font-medium text-foreground", className),
		...props
	});
}
function Switch({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch$1, {
		className: cn("peer inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full border border-border bg-surface-2 transition-colors data-[state=checked]:bg-accent", className),
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchThumb, { className: "pointer-events-none block size-4 translate-x-1 rounded-full bg-foreground shadow transition-transform data-[state=checked]:translate-x-5 data-[state=checked]:bg-accent-foreground" })
	});
}
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("flex min-h-28 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted outline-none focus-visible:ring-2 focus-visible:ring-ring/40", className),
		...props
	});
}
function Separator({ className, orientation = "horizontal" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "separator",
		className: cn("shrink-0 bg-border", orientation === "horizontal" ? "h-px w-full" : "h-full w-px", className)
	});
}
var NAV = [
	{
		id: "general",
		label: "General",
		icon: Settings2
	},
	{
		id: "appearance",
		label: "Appearance",
		icon: Paintbrush
	},
	{
		id: "proxy",
		label: "Proxy",
		icon: Globe
	},
	{
		id: "privacy",
		label: "Privacy",
		icon: Shield
	},
	{
		id: "autofill",
		label: "Autofill",
		icon: Lock
	},
	{
		id: "logging",
		label: "Logging",
		icon: ScrollText
	},
	{
		id: "lock",
		label: "Lock",
		icon: Lock
	},
	{
		id: "data",
		label: "Import / Export",
		icon: SlidersHorizontal
	},
	{
		id: "about",
		label: "About",
		icon: Keyboard
	}
];
var FONTS = [
	"Outfit",
	"Figtree",
	"Newsreader",
	"system-ui",
	"serif",
	"JetBrains Mono"
];
function SettingsPanel({ onJump }) {
	const [section, setSection] = (0, import_react.useState)("general");
	const settings = useBrowserStore((s) => s.settings);
	const passwords = useBrowserStore((s) => s.passwords);
	const patchSettings = useBrowserStore((s) => s.patchSettings);
	const setTheme = useBrowserStore((s) => s.setTheme);
	const setLayout = useBrowserStore((s) => s.setLayout);
	const applyStealth = useBrowserStore((s) => s.applyStealth);
	const importAll = useBrowserStore((s) => s.importAll);
	const exportAll = useBrowserStore((s) => s.exportAll);
	const upsertPassword = useBrowserStore((s) => s.upsertPassword);
	const removePassword = useBrowserStore((s) => s.removePassword);
	const fileRef = (0, import_react.useRef)(null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0 flex-col bg-background sm:flex-row",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
			className: "flex shrink-0 gap-1 overflow-x-auto border-b border-border p-2 sm:w-52 sm:flex-col sm:overflow-y-auto sm:border-b-0 sm:border-r",
			children: NAV.map((n) => {
				const Icon = n.icon;
				const on = section === n.id;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setSection(n.id),
					className: `flex h-10 items-center gap-2 rounded-md px-3 text-sm ${on ? "bg-surface-2 text-foreground" : "text-muted hover:bg-surface-2 hover:text-foreground"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), n.label]
				}, n.id);
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-h-0 flex-1 overflow-auto p-5 veil-scroll",
			children: [
				section === "general" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Block, {
					title: "General",
					desc: "Home, search, and new-tab behaviour.",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
							label: "Search engine",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								className: "h-10 w-full rounded-md border border-border bg-surface px-3 text-sm",
								value: settings.searchEngineId,
								onChange: (e) => patchSettings({ searchEngineId: e.target.value }),
								children: settings.searchEngines.map((se) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: se.id,
									children: se.name
								}, se.id))
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-xs text-muted",
								children: ["Current: ", currentSearchEngine(settings).url]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddSearchEngine, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Home page (leave blank for New Tab)",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: settings.homeUrl,
								placeholder: "https://…",
								onChange: (e) => patchSettings({ homeUrl: e.target.value })
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Shortcuts on new tab",
							checked: settings.showShortcutsOnNewTab,
							onChange: (v) => patchSettings({ showShortcutsOnNewTab: v })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-2 pt-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "secondary",
									onClick: () => onJump("history"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "size-4" }), " History"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "secondary",
									onClick: () => onJump("downloads"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), " Downloads"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "secondary",
									onClick: () => onJump("speed"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gauge, { className: "size-4" }), " Speed test"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "secondary",
									onClick: () => onJump("shortcuts"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Keyboard, { className: "size-4" }), " Shortcuts"]
								})
							]
						})
					]
				}) : null,
				section === "appearance" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Block, {
					title: "Appearance",
					desc: "Colors, type, density, and custom CSS. Changes persist.",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Mode",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex gap-2",
								children: [
									"dark",
									"light",
									"system"
								].map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: settings.theme.mode === m ? "default" : "outline",
									size: "sm",
									onClick: () => setTheme({ mode: m }),
									children: m
								}, m))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 gap-4 sm:grid-cols-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Swatch, {
									label: "Accent",
									value: settings.theme.accent,
									onChange: (v) => setTheme({ accent: v })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Swatch, {
									label: "Background",
									value: settings.theme.bg,
									onChange: (v) => setTheme({ bg: v })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Swatch, {
									label: "Text",
									value: settings.theme.fg,
									onChange: (v) => setTheme({ fg: v })
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Interface font",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								className: "h-10 w-full rounded-md border border-border bg-surface px-3 text-sm",
								value: settings.theme.font,
								onChange: (e) => setTheme({ font: e.target.value }),
								children: FONTS.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: f }, f))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: `Corner radius · ${settings.theme.radius}px`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "range",
								min: 4,
								max: 20,
								value: settings.theme.radius,
								onChange: (e) => setTheme({ radius: Number(e.target.value) }),
								className: "w-full accent-ring"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Density",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex gap-2",
								children: ["compact", "comfortable"].map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: settings.theme.density === d ? "default" : "outline",
									size: "sm",
									onClick: () => setTheme({ density: d }),
									children: d
								}, d))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Bookmark bar",
							checked: settings.layout.bookmarkBar,
							onChange: (v) => setLayout({ bookmarkBar: v })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Status bar",
							checked: settings.layout.statusBar,
							onChange: (v) => setLayout({ statusBar: v })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Tab strip",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex gap-2",
								children: ["top", "bottom"].map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: settings.layout.tabPosition === p ? "default" : "outline",
									size: "sm",
									onClick: () => setLayout({ tabPosition: p }),
									children: p
								}, p))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Sidebar",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-2",
								children: [
									"none",
									"bookmarks",
									"history",
									"downloads"
								].map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: settings.layout.sidebar === p ? "default" : "outline",
									size: "sm",
									onClick: () => setLayout({ sidebar: p }),
									children: p
								}, p))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Custom CSS",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								className: "font-mono text-xs",
								value: settings.theme.customCss,
								onChange: (e) => setTheme({ customCss: e.target.value }),
								placeholder: ".veil-chrome { /* your rules */ }"
							})
						})
					]
				}) : null,
				section === "proxy" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Block, {
					title: "Proxy engine",
					desc: "All traffic — pages, assets, forms, sockets — is rewritten through Veil. No escape paths.",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid gap-2",
							children: Object.keys(ENGINES).map((id) => {
								const e = ENGINES[id];
								const on = settings.engine === id;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => patchSettings({ engine: id }),
									className: `rounded-xl border p-3 text-left ${on ? "border-ring bg-surface-2" : "border-border bg-surface hover:bg-surface-2"}`,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-sm font-medium",
											children: e.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-muted",
											children: e.tagline
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs text-muted",
										children: e.description
									})]
								}, id);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, { className: "my-4" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mb-2 text-sm font-medium",
							children: "NGINX layer"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-3 text-xs text-muted",
							children: "Applies to every engine. Maps to reverse-proxy header behaviour."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "proxy_ssl_server_name",
							checked: settings.nginx.sslServerName,
							onChange: (v) => patchSettings({ nginx: {
								...settings.nginx,
								sslServerName: v
							} })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Forward client IP (X-Forwarded-For)",
							checked: settings.nginx.forwardFor,
							onChange: (v) => patchSettings({ nginx: {
								...settings.nginx,
								forwardFor: v
							} })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Hide X-Powered-By / Server",
							checked: settings.nginx.hideServer,
							onChange: (v) => patchSettings({ nginx: {
								...settings.nginx,
								hideServer: v,
								hidePoweredBy: v
							} })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "User-Agent override (blank = Chrome 129)",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: settings.nginx.userAgentOverride,
								onChange: (e) => patchSettings({ nginx: {
									...settings.nginx,
									userAgentOverride: e.target.value
								} }),
								placeholder: "Mozilla/5.0 …"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExtraHeaders, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "mt-2",
							onClick: () => {
								applyStealth();
								toast.success("Stealth mode on — strongest anti-detection profile applied.");
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wifi, { className: "size-4" }), " One-click stealth mode"]
						})
					]
				}) : null,
				section === "privacy" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Block, {
					title: "Privacy",
					desc: "Ad blocking is off until you enable it. Filter lists are local.",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Ad blocker",
							checked: settings.adblock,
							onChange: (v) => patchSettings({ adblock: v })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Stealth mode",
							checked: settings.stealth,
							onChange: (v) => patchSettings({ stealth: v })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Block WebRTC leaks",
							checked: settings.webrtcBlock,
							onChange: (v) => patchSettings({ webrtcBlock: v })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Fingerprinting resistance",
							checked: settings.fingerprintResist,
							onChange: (v) => patchSettings({ fingerprintResist: v })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Custom filter lists (one EasyList-style rule per line)",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								className: "font-mono text-xs",
								value: settings.filterLists.join("\n"),
								onChange: (e) => patchSettings({ filterLists: e.target.value.split("\n").map((l) => l.trim()).filter(Boolean) }),
								placeholder: "||ads.example.com^\n/ads/"
							})
						})
					]
				}) : null,
				section === "autofill" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Block, {
					title: "Password autofill",
					desc: "Stored only in this browser. Never sent through the proxy as a payload of its own.",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordForm, { onSave: upsertPassword }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border",
						children: passwords.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "px-4 py-6 text-sm text-muted",
							children: "No saved logins yet."
						}) : passwords.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center justify-between gap-3 px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-sm",
									children: p.origin
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-xs text-muted",
									children: p.username
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								onClick: () => removePassword(p.id),
								children: "Remove"
							})]
						}, p.id))
					})]
				}) : null,
				section === "logging" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Block, {
					title: "Logging",
					desc: "Control what Veil records and how long it stays.",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Navigations",
							checked: settings.logging.nav,
							onChange: (v) => patchSettings({ logging: {
								...settings.logging,
								nav: v
							} })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Network",
							checked: settings.logging.net,
							onChange: (v) => patchSettings({ logging: {
								...settings.logging,
								net: v
							} })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Errors",
							checked: settings.logging.error,
							onChange: (v) => patchSettings({ logging: {
								...settings.logging,
								error: v
							} })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Page console",
							checked: settings.logging.console,
							onChange: (v) => patchSettings({ logging: {
								...settings.logging,
								console: v
							} })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: `Retention · ${settings.logging.retentionHours} hours`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "range",
								min: 1,
								max: 168,
								value: settings.logging.retentionHours,
								onChange: (e) => patchSettings({ logging: {
									...settings.logging,
									retentionHours: Number(e.target.value)
								} }),
								className: "w-full"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogsViewer, {})
					]
				}) : null,
				section === "lock" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockSection, {}) : null,
				section === "data" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
					title: "Import / export",
					desc: "Themes, engines, bookmarks, history, and local passwords.",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: () => downloadJson(`veil-export-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`, exportAll()),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), " Export"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "secondary",
								onClick: () => fileRef.current?.click(),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-4" }), " Import"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								ref: fileRef,
								type: "file",
								accept: "application/json",
								className: "hidden",
								onChange: async (e) => {
									const file = e.target.files?.[0];
									if (!file) return;
									try {
										const json = JSON.parse(await file.text());
										const err = importAll(json);
										if (err) toast.error(err);
										else toast.success("Imported settings.");
									} catch {
										toast.error("That file isn’t valid JSON.");
									}
									e.target.value = "";
								}
							})
						]
					})
				}) : null,
				section === "about" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
					title: "Veil",
					desc: "A browser inside a browser. Traffic is rewritten through a Node proxy with selectable engines.",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "space-y-2 text-sm text-muted",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Default engine: NGINX-style reverse proxy" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Also: Ultraviolet, Mercury, Scramjet, Rammerhead" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Per-tab cookie isolation · stealth headers · optional adblock" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Install as a PWA from your browser’s share / install menu" })
						]
					})
				}) : null
			]
		})]
	});
}
function Block({ title, desc, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mx-auto max-w-2xl space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-lg font-semibold tracking-tight",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted",
			children: desc
		})] }), children]
	});
}
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: label }), children]
	});
}
function Row({ label, checked, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
			checked,
			onCheckedChange: onChange
		})]
	});
}
function Swatch({ label, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
		label,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "color",
				value,
				onChange: (e) => onChange(e.target.value),
				className: "size-10 cursor-pointer rounded-md border border-border bg-surface"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value,
				onChange: (e) => onChange(e.target.value),
				className: "font-mono"
			})]
		})
	});
}
function AddSearchEngine() {
	const settings = useBrowserStore((s) => s.settings);
	const patchSettings = useBrowserStore((s) => s.patchSettings);
	const [name, setName] = (0, import_react.useState)("");
	const [url, setUrl] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-2 rounded-xl border border-border bg-surface p-3 sm:grid-cols-[1fr_1fr_auto]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				placeholder: "Name",
				value: name,
				onChange: (e) => setName(e.target.value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				placeholder: "https://example/search?q=%s",
				value: url,
				onChange: (e) => setUrl(e.target.value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				onClick: () => {
					if (!name.trim() || !url.includes("%s")) {
						toast.error("Need a name and a URL containing %s.");
						return;
					}
					patchSettings({ searchEngines: [...settings.searchEngines, {
						id: uid("se"),
						name: name.trim(),
						url: url.trim()
					}] });
					setName("");
					setUrl("");
					toast.success("Search engine added.");
				},
				children: "Add"
			})
		]
	});
}
function ExtraHeaders() {
	const nginx = useBrowserStore((s) => s.settings.nginx);
	const patchSettings = useBrowserStore((s) => s.patchSettings);
	const [k, setK] = (0, import_react.useState)("");
	const [v, setV] = (0, import_react.useState)("");
	const entries = Object.entries(nginx.extraRequestHeaders);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
		label: "Extra request headers",
		children: [entries.map(([key, val]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-1 flex items-center justify-between rounded-md bg-surface-2 px-3 py-2 text-xs",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "font-mono",
				children: [
					key,
					": ",
					val
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "text-muted hover:text-foreground",
				onClick: () => {
					const next = { ...nginx.extraRequestHeaders };
					delete next[key];
					patchSettings({ nginx: {
						...nginx,
						extraRequestHeaders: next
					} });
				},
				children: "Remove"
			})]
		}, key)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-2 grid gap-2 sm:grid-cols-[1fr_1fr_auto]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "Header",
					value: k,
					onChange: (e) => setK(e.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "Value",
					value: v,
					onChange: (e) => setV(e.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					onClick: () => {
						if (!k.trim()) return;
						patchSettings({ nginx: {
							...nginx,
							extraRequestHeaders: {
								...nginx.extraRequestHeaders,
								[k.trim()]: v
							}
						} });
						setK("");
						setV("");
					},
					children: "Add"
				})
			]
		})]
	});
}
function PasswordForm({ onSave }) {
	const [origin, setOrigin] = (0, import_react.useState)("");
	const [username, setUsername] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-2 sm:grid-cols-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				placeholder: "https://site.example",
				value: origin,
				onChange: (e) => setOrigin(e.target.value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				placeholder: "Username",
				value: username,
				onChange: (e) => setUsername(e.target.value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "Password",
					type: "password",
					value: password,
					onChange: (e) => setPassword(e.target.value)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					onClick: () => {
						if (!origin || !username) return;
						onSave({
							origin,
							username,
							password
						});
						setOrigin("");
						setUsername("");
						setPassword("");
						toast.success("Saved locally.");
					},
					children: "Save"
				})]
			})
		]
	});
}
function LogsViewer() {
	const logs = useBrowserStore((s) => s.logs);
	const clearLogs = useBrowserStore((s) => s.clearLogs);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mb-2 flex justify-end",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "sm",
			onClick: clearLogs,
			children: "Clear logs"
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "max-h-64 overflow-auto rounded-xl border border-border bg-surface font-mono text-xs veil-scroll",
		children: logs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
			className: "px-3 py-6 text-center text-muted",
			children: "Nothing recorded."
		}) : logs.slice().reverse().map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "border-b border-border px-3 py-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "text-muted",
				children: [
					new Date(l.at).toLocaleTimeString(),
					" · ",
					l.kind
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: l.message })]
		}, l.id))
	})] });
}
function LockSection() {
	const settings = useBrowserStore((s) => s.settings);
	const patchSettings = useBrowserStore((s) => s.patchSettings);
	const setLocked = useBrowserStore((s) => s.setLocked);
	const [pw, setPw] = (0, import_react.useState)("");
	const [pw2, setPw2] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Block, {
		title: "Password protection",
		desc: "Lock the entire proxy UI. Hash is stored locally — there is no recovery.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
				label: "Require password",
				checked: settings.lockEnabled,
				onChange: (v) => {
					if (!v) {
						patchSettings({
							lockEnabled: false,
							lockHash: ""
						});
						setLocked(false);
					} else if (!settings.lockHash) toast.error("Set a password first.");
					else patchSettings({ lockEnabled: true });
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "New password",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "password",
					value: pw,
					onChange: (e) => setPw(e.target.value)
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Confirm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "password",
					value: pw2,
					onChange: (e) => setPw2(e.target.value)
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: async () => {
					if (pw.length < 4) {
						toast.error("Use at least 4 characters.");
						return;
					}
					if (pw !== pw2) {
						toast.error("Passwords don’t match.");
						return;
					}
					const hash = await sha256(pw);
					patchSettings({
						lockEnabled: true,
						lockHash: hash
					});
					setPw("");
					setPw2("");
					toast.success("Password saved. Veil will ask for it next visit.");
				},
				children: "Set password"
			}),
			settings.lockEnabled ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				onClick: () => setLocked(true),
				children: "Lock now"
			}) : null
		]
	});
}
function OverlayHost({ overlay, onClose, onGo }) {
	if (overlay === "none") return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-30 flex flex-col bg-background/80 p-0 sm:p-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex h-full min-h-0 w-full max-w-5xl flex-col overflow-hidden border-border bg-surface shadow-[var(--shadow-panel)] sm:rounded-xl sm:border",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex h-12 shrink-0 items-center justify-between border-b border-border px-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium",
					children: overlay === "settings" ? "Settings" : overlay === "history" ? "History" : overlay === "downloads" ? "Downloads" : overlay === "devtools" ? "Developer tools" : overlay === "shortcuts" ? "Keyboard shortcuts" : overlay === "speed" ? "Speed / latency" : overlay === "theme" ? "Theme" : ""
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "grid size-9 place-items-center rounded-md hover:bg-surface-2",
					onClick: onClose,
					"aria-label": "Close",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-h-0 flex-1",
				children: [
					overlay === "settings" || overlay === "theme" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsPanel, { onJump: (o) => useBrowserStore.getState().setOverlay(o) }) : null,
					overlay === "history" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HistoryPanel, { onGo }) : null,
					overlay === "downloads" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DownloadsPanel, {}) : null,
					overlay === "devtools" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DevtoolsPanel, {}) : null,
					overlay === "shortcuts" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShortcutsPanel, {}) : null,
					overlay === "speed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpeedPanel, {}) : null
				]
			})]
		})
	});
}
function HistoryPanel({ onGo }) {
	const history = useBrowserStore((s) => s.history);
	const clearHistory = useBrowserStore((s) => s.clearHistory);
	const [q, setQ] = (0, import_react.useState)("");
	const filtered = history.filter((h) => h.title.toLowerCase().includes(q.toLowerCase()) || h.url.toLowerCase().includes(q.toLowerCase()));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 border-b border-border p-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4 text-muted" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: q,
					onChange: (e) => setQ(e.target.value),
					placeholder: "Search history",
					className: "h-9"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "ghost",
					size: "sm",
					onClick: clearHistory,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" }), " Clear"]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "flex-1 overflow-auto veil-scroll",
			children: filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: "px-4 py-10 text-center text-sm text-muted",
				children: "No history yet."
			}) : filtered.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => onGo(h.url),
				className: "flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-surface-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block truncate text-sm",
						children: h.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block truncate text-xs text-muted",
						children: h.url
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "shrink-0 text-xs tabular-nums text-muted",
					children: formatRelative(h.at)
				})]
			}) }, h.id))
		})]
	});
}
function DownloadsPanel() {
	const downloads = useBrowserStore((s) => s.downloads);
	const clearDownloads = useBrowserStore((s) => s.clearDownloads);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex justify-end border-b border-border p-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "sm",
				onClick: clearDownloads,
				children: "Clear"
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "flex-1 overflow-auto veil-scroll",
			children: downloads.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: "px-4 py-10 text-center text-sm text-muted",
				children: "No downloads yet."
			}) : downloads.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex items-center justify-between gap-3 border-b border-border px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-sm",
						children: d.filename
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted",
						children: [
							formatBytes(d.size),
							" · ",
							d.status,
							" · ",
							formatRelative(d.at)
						]
					})]
				}), d.href ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: d.href,
					download: d.filename,
					className: "text-sm text-ring underline-offset-2 hover:underline",
					children: "Save"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4 text-muted" })]
			}, d.id))
		})]
	});
}
function DevtoolsDock() {
	const nets = useBrowserStore((s) => s.nets);
	const consoles = useBrowserStore((s) => s.consoles);
	const inspect = useBrowserStore((s) => s.inspect);
	const inspectOn = useBrowserStore((s) => s.inspectOn);
	const setInspectOn = useBrowserStore((s) => s.setInspectOn);
	const [tab, setTab] = (0, import_react.useState)("network");
	const [code, setCode] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-56 flex-col border-t border-border bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex h-9 items-center gap-1 border-b border-border px-2",
				children: [[
					"elements",
					"console",
					"network"
				].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setTab(t),
					className: `h-7 rounded-md px-2 text-xs capitalize ${tab === t ? "bg-surface-2" : "text-muted"}`,
					children: t
				}, t)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setInspectOn(!inspectOn),
					className: `ml-auto h-7 rounded-md px-2 text-xs ${inspectOn ? "bg-accent text-accent-foreground" : "text-muted"}`,
					children: "Inspect"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-h-0 flex-1 overflow-auto font-mono text-xs veil-scroll",
				children: [
					tab === "network" ? nets.slice().reverse().map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-[52px_1fr_48px_56px] gap-2 border-b border-border px-3 py-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted",
								children: n.method
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate",
								children: n.url
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "tabular-nums",
								children: n.status ?? n.phase
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "tabular-nums text-muted",
								children: n.ms ? `${n.ms}ms` : ""
							})
						]
					}, n.id)) : null,
					tab === "console" ? consoles.slice().reverse().map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border-b border-border px-3 py-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mr-2 uppercase text-muted",
							children: c.level
						}), c.args.join(" ")]
					}, c.id)) : null,
					tab === "elements" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-2 text-muted",
							children: inspectOn ? "Click an element in the page." : "Turn on Inspect, then click in the page."
						}), inspect ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mb-2 text-ring",
								children: inspect.tag
							}),
							inspect.styles ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
								className: "mb-2 whitespace-pre-wrap text-muted",
								children: Object.entries(inspect.styles).map(([k, v]) => `${k}: ${v}`).join("\n")
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
								className: "whitespace-pre-wrap break-all",
								children: inspect.html
							})
						] }) : null]
					}) : null
				]
			}),
			tab === "console" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "flex border-t border-border",
				onSubmit: (e) => {
					e.preventDefault();
					window.dispatchEvent(new CustomEvent("veil:eval", { detail: code }));
					setCode("");
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid size-9 place-items-center text-muted",
					children: "›"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: code,
					onChange: (e) => setCode(e.target.value),
					className: "h-9 flex-1 bg-transparent font-mono text-xs outline-none",
					placeholder: "Evaluate in page"
				})]
			}) : null
		]
	});
}
function DevtoolsPanel() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DevtoolsDock, {});
}
function ShortcutsPanel() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "overflow-auto p-5 veil-scroll",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mb-4 flex items-center gap-2 text-sm text-muted",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Keyboard, { className: "size-4" }), "Shortcuts use Alt / Option instead of Control so they work inside this tab."]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mx-auto max-w-lg divide-y divide-border overflow-hidden rounded-xl border border-border",
			children: [
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
				["Alt + N", "New tab with home"]
			].map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex items-center justify-between px-4 py-2.5 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: v }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
					className: "rounded-md bg-surface-2 px-2 py-1 font-mono text-xs text-muted",
					children: k
				})]
			}, k))
		})]
	});
}
function SpeedPanel() {
	const [data, setData] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [err, setErr] = (0, import_react.useState)("");
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
	(0, import_react.useEffect)(() => {
		run();
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-auto p-5 veil-scroll",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-lg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 flex items-end justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.14em] text-muted",
						children: "Average TTFB"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-sans text-4xl font-semibold tabular-nums tracking-tight",
						children: data?.avg != null ? `${data.avg}ms` : busy ? "…" : "—"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: () => void run(),
						disabled: busy,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gauge, { className: "size-4" }),
							" ",
							busy ? "Testing" : "Run again"
						]
					})]
				}),
				err ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-sm text-danger",
					children: err
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "divide-y divide-border overflow-hidden rounded-xl border border-border",
					children: (data?.results ?? []).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center justify-between px-4 py-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [r.name, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-2 text-xs text-muted",
							children: r.ok ? r.status : r.error
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "tabular-nums",
							children: [r.ms, "ms"]
						})]
					}, r.id))
				})
			]
		})
	});
}
function BrowserShell() {
	const hydrated = useBrowserStore((s) => s.hydrated);
	const locked = useBrowserStore((s) => s.locked);
	const setHydrated = useBrowserStore((s) => s.setHydrated);
	const setLocked = useBrowserStore((s) => s.setLocked);
	const settings = useBrowserStore((s) => s.settings);
	(0, import_react.useEffect)(() => {
		Promise.resolve(useBrowserStore.persist.rehydrate()).then(() => {
			const s = useBrowserStore.getState();
			applyTheme(s.settings);
			writeCfgCookie(s.settings);
			setHydrated(true);
			if (s.settings.lockEnabled && s.settings.lockHash) setLocked(true);
		});
	}, [setHydrated, setLocked]);
	(0, import_react.useEffect)(() => {
		if (!hydrated) return;
		applyTheme(settings);
		writeCfgCookie(settings);
	}, [hydrated, settings]);
	if (!hydrated) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-dvh place-items-center bg-background text-foreground",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VeilMark, { className: "size-8" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Restoring session"
			})]
		})
	});
	if (locked) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockScreen, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chrome, {});
}
function applyTheme(settings) {
	const root = document.documentElement;
	const theme = settings.theme;
	let light = theme.mode === "light";
	if (theme.mode === "system") light = window.matchMedia("(prefers-color-scheme: light)").matches;
	if (light) root.dataset.theme = "light";
	else delete root.dataset.theme;
	root.style.setProperty("--veil-bg", theme.bg);
	root.style.setProperty("--veil-fg", theme.fg);
	root.style.setProperty("--veil-accent", theme.accent);
	root.style.setProperty("--veil-font", theme.font);
	root.style.setProperty("--veil-mono", theme.mono);
	root.style.setProperty("--veil-radius", `${theme.radius}px`);
	if (light) root.style.setProperty("--veil-accent-fg", theme.bg);
	else root.style.setProperty("--veil-accent-fg", theme.bg);
}
function writeCfgCookie(settings) {
	const cfg = {
		adblock: settings.adblock,
		stealth: settings.stealth || settings.fingerprintResist,
		webrtcBlock: settings.webrtcBlock || settings.stealth,
		fingerprintResist: settings.fingerprintResist || settings.stealth,
		engine: settings.engine,
		nginx: settings.nginx
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
	const tab = tabs.find((t) => t.id === activeId) ?? tabs[0];
	const addressRef = (0, import_react.useRef)(null);
	const frames = (0, import_react.useRef)({});
	const [menuOpen, setMenuOpen] = (0, import_react.useState)(false);
	const devtools = overlay === "devtools";
	const go = (raw, opts) => {
		const url = normalizeNavigableUrl(raw, currentSearchEngine(store.getState().settings).url);
		if (!url) return;
		store.getState().navigate(tab.id, url, {
			fromUser: true,
			replace: opts?.replace
		});
		store.getState().setOverlay("none");
	};
	useHotkeys(addressRef, tab);
	(0, import_react.useEffect)(() => {
		const onMsg = (ev) => {
			const d = ev.data;
			if (!d || d.ns !== "veil") return;
			const st = store.getState();
			const id = d.tabId || st.activeId;
			if (d.type === "meta" || d.type === "ready" || d.type === "navigate" || d.type === "history") {
				const url = d.url;
				const title = d.title;
				const redirectedFrom = d.redirectedFrom ?? null;
				st.updateTab(id, {
					loading: false,
					...url ? {
						displayUrl: url,
						url,
						redirectedFrom
					} : {},
					...title ? { title } : {},
					...d.favicon ? { favicon: String(d.favicon) } : {}
				});
				if (url) {
					st.setAddressDraft(url);
					st.pushHistory(url, title || hostnameOf(url));
					const origin = hostnameOf(url);
					const logins = st.passwords.filter((p) => {
						try {
							return hostnameOf(p.origin) === origin || p.origin.includes(origin);
						} catch {
							return false;
						}
					}).map((p) => ({
						username: p.username,
						password: p.password
					}));
					if (logins.length) frames.current[id]?.contentWindow?.postMessage({
						ns: "veil",
						type: "autofill",
						logins
					}, "*");
				}
			}
			if (d.type === "error") {
				st.updateTab(id, {
					loading: false,
					crash: String(d.message || d.title || "Error")
				});
				if (st.settings.logging.error) st.log("error", String(d.message || d.title), tab.url);
			}
			if (d.type === "console") {
				st.pushConsole({
					level: d.level,
					args: d.args ?? []
				});
				if (st.settings.logging.console) st.log("console", (d.args ?? []).join(" "));
			}
			if (d.type === "net") {
				st.pushNet({
					method: d.method || "GET",
					url: d.url,
					status: d.status,
					ms: d.ms,
					phase: d.phase
				});
				if (st.settings.logging.net && d.phase === "end") st.log("net", `${d.status ?? ""} ${d.url}`, d.url);
			}
			if (d.type === "inspect") st.setInspect(d);
			if (d.type === "open" && d.url) st.newTab(d.url);
			if (d.type === "download") handleDownload(d);
		};
		window.addEventListener("message", onMsg);
		const onEval = (e) => {
			const code = e.detail;
			frames.current[tab.id]?.contentWindow?.postMessage({
				ns: "veil",
				type: "eval",
				code
			}, "*");
		};
		window.addEventListener("veil:eval", onEval);
		return () => {
			window.removeEventListener("message", onMsg);
			window.removeEventListener("veil:eval", onEval);
		};
	}, [
		store,
		tab.id,
		tab.url
	]);
	(0, import_react.useEffect)(() => {
		frames.current[tab.id]?.contentWindow?.postMessage({
			ns: "veil",
			type: "inspect",
			on: inspectOn
		}, "*");
	}, [
		inspectOn,
		tab.id,
		tab.frameKey
	]);
	const bookmarked = bookmarks.some((b) => b.url === tab.url);
	const src = (() => {
		if (!tab.url) return null;
		try {
			return encodeProxyPath(settings.engine, tab.id, tab.url);
		} catch {
			return null;
		}
	})();
	const tabBar = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabBar, {
		tabs,
		activeId: tab.id,
		onNew: () => store.getState().newTab(),
		onClose: (id) => store.getState().closeTab(id),
		onActivate: (id) => store.getState().activate(id)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "veil-chrome flex h-dvh min-h-0 flex-col bg-background text-foreground",
		"data-density": settings.theme.density,
		children: [
			settings.theme.customCss ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", {
				id: "veil-custom-css",
				children: settings.theme.customCss
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
				theme: settings.theme.mode === "light" ? "light" : "dark",
				position: "bottom-right"
			}),
			settings.layout.tabPosition === "top" ? tabBar : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-1 border-b border-border bg-surface px-1.5",
				style: { height: "var(--nav-h)" },
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
						label: "Back",
						disabled: tab.stackIndex <= 0,
						onClick: () => store.getState().back(tab.id),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
						label: "Forward",
						disabled: tab.stackIndex >= tab.stack.length - 1,
						onClick: () => store.getState().forward(tab.id),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {})
					}),
					tab.loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
						label: "Stop",
						onClick: () => store.getState().stop(tab.id),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, { className: "size-3.5 fill-current" })
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
						label: "Reload",
						onClick: () => store.getState().reload(tab.id),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCw, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
						label: "Home",
						onClick: () => {
							if (settings.homeUrl) go(settings.homeUrl);
							else {
								store.getState().updateTab(tab.id, {
									url: "",
									displayUrl: "",
									title: "New tab",
									redirectedFrom: null,
									loading: false
								});
								store.getState().setAddressDraft("");
							}
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mx-1 flex min-w-0 flex-1 items-center gap-2 rounded-full border border-border bg-background px-3",
						style: { height: "calc(var(--nav-h) - 10px)" },
						onSubmit: (e) => {
							e.preventDefault();
							go(addressDraft);
						},
						children: [
							settings.stealth ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-3.5 shrink-0 text-ok" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldOff, { className: "size-3.5 shrink-0 text-muted" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								ref: addressRef,
								value: addressDraft,
								onChange: (e) => store.getState().setAddressDraft(e.target.value),
								onFocus: (e) => e.currentTarget.select(),
								spellCheck: false,
								placeholder: "Search or enter address",
								className: "min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted",
								"aria-label": "Address"
							}),
							tab.redirectedFrom ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "hidden max-w-[40%] truncate rounded-full bg-surface-2 px-2 py-0.5 text-[11px] text-muted sm:inline",
								children: ["redirected from ", tab.redirectedFrom]
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: cn("grid size-8 place-items-center rounded-full", bookmarked ? "text-warn" : "text-muted"),
								"aria-label": "Bookmark",
								onClick: () => {
									if (!tab.url) return;
									if (bookmarked) {
										const b = bookmarks.find((x) => x.url === tab.url);
										if (b) store.getState().removeBookmark(b.id);
									} else {
										store.getState().addBookmark({
											title: tab.title,
											url: tab.url
										});
										toast.success("Saved to shortcuts");
									}
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: cn("size-3.5", bookmarked && "fill-current") })
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
						label: "Stealth mode",
						onClick: () => {
							if (settings.stealth) {
								store.getState().patchSettings({ stealth: false });
								toast("Stealth off");
							} else {
								store.getState().applyStealth();
								toast.success("Stealth mode on");
							}
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: settings.stealth ? "text-ok" : "" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
							label: "Menu",
							onClick: () => setMenuOpen((v) => !v),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, {})
						}), menuOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute right-0 top-[calc(100%+6px)] z-40 w-56 overflow-hidden rounded-lg border border-border bg-surface py-1 shadow-[var(--shadow-panel)]",
							children: [
								["Settings", () => store.getState().setOverlay("settings")],
								["History", () => store.getState().setOverlay("history")],
								["Downloads", () => store.getState().setOverlay("downloads")],
								["Developer tools", () => store.getState().setOverlay("devtools")],
								["Speed test", () => store.getState().setOverlay("speed")],
								["Keyboard shortcuts", () => store.getState().setOverlay("shortcuts")]
							].map(([label, fn]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "flex h-9 w-full items-center px-3 text-left text-sm hover:bg-surface-2",
								onClick: () => {
									fn();
									setMenuOpen(false);
								},
								children: label
							}, String(label)))
						}) : null]
					})
				]
			}),
			settings.layout.bookmarkBar && bookmarks.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex h-9 items-center gap-1 overflow-x-auto border-b border-border bg-background px-2 veil-scroll",
				children: bookmarks.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => go(b.url),
					className: "h-7 shrink-0 rounded-md px-2 text-xs text-muted hover:bg-surface-2 hover:text-foreground",
					children: b.title
				}, b.id))
			}) : null,
			tab.loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "veil-loading-bar" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-px bg-border" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-0 flex-1",
				children: [settings.layout.sidebar !== "none" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
					className: "hidden w-56 shrink-0 overflow-auto border-r border-border bg-surface sm:block veil-scroll",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChromeSidebar, {
						kind: settings.layout.sidebar,
						onGo: (url) => go(url)
					})
				}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative min-h-0 flex-1 bg-background",
					children: [
						tabs.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: cn("absolute inset-0", t.id === tab.id ? "z-10" : "pointer-events-none invisible"),
							"aria-hidden": t.id !== tab.id,
							children: t.id !== tab.id ? null : t.url && src ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
								ref: (el) => {
									frames.current[t.id] = el;
								},
								title: t.title,
								src,
								referrerPolicy: "no-referrer",
								allow: "fullscreen; clipboard-read; clipboard-write",
								className: "h-full w-full border-0 bg-background",
								style: {
									transform: t.zoom === 1 ? void 0 : `scale(${t.zoom})`,
									transformOrigin: "0 0"
								},
								onLoad: () => store.getState().updateTab(t.id, { loading: false })
							}, `${t.id}-${t.frameKey}-${settings.engine}`) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NewTab, { onGo: (url) => store.getState().navigate(t.id, url, { fromUser: true }) })
						}, t.id)),
						tab.crash ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "pointer-events-none absolute inset-x-0 top-3 z-20 flex justify-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "pointer-events-auto rounded-lg border border-border bg-surface px-3 py-2 text-sm text-danger shadow-[var(--shadow-panel)]",
								children: tab.crash
							})
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OverlayHost, {
							overlay: overlay === "devtools" ? "none" : overlay,
							onClose: () => store.getState().setOverlay("none"),
							onGo: (url) => {
								go(url);
							}
						})
					]
				})]
			}),
			devtools ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DevtoolsDock, {}) : null,
			settings.layout.tabPosition === "bottom" ? tabBar : null,
			settings.layout.statusBar ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
				className: "flex h-7 items-center justify-between gap-3 border-t border-border bg-surface px-3 text-[11px] text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "truncate",
					children: tab.url ? `${settings.engine} · ${prettyUrl(tab.url)}${tab.redirectedFrom ? ` · from ${tab.redirectedFrom}` : ""}` : "New tab"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "hidden items-center gap-3 sm:flex",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [Math.round(tab.zoom * 100), "%"] }),
						settings.adblock ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "blocker on" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "blocker off" }),
						settings.stealth ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-ok",
							children: "stealth"
						}) : null
					]
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MobileDock, {
				tabCount: tabs.length,
				onTabs: () => {
					const s = useBrowserStore.getState();
					const idx = s.tabs.findIndex((t) => t.id === s.activeId);
					const next = s.tabs[(idx + 1) % s.tabs.length];
					if (next) s.activate(next.id);
				},
				onNew: () => store.getState().newTab(),
				onSettings: () => store.getState().setOverlay("settings")
			})
		]
	});
}
function TabBar({ tabs, activeId, onNew, onClose, onActivate }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-end gap-1 overflow-x-auto border-b border-border bg-background px-2 pt-2 veil-scroll",
		children: [tabs.map((t) => {
			const on = t.id === activeId;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("group flex h-[var(--tab-h)] max-w-56 min-w-32 shrink-0 items-center gap-1 rounded-t-lg px-2 text-xs", on ? "bg-surface text-foreground" : "text-muted hover:bg-surface/70"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "min-w-0 flex-1 truncate text-left",
					onClick: () => onActivate(t.id),
					children: t.title || "New tab"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": `Close ${t.title}`,
					className: "grid size-6 place-items-center rounded-md opacity-70 hover:bg-surface-2 hover:opacity-100",
					onClick: () => onClose(t.id),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3" })
				})]
			}, t.id);
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			"aria-label": "New tab",
			onClick: onNew,
			className: "mb-1 grid size-8 shrink-0 place-items-center rounded-md text-muted hover:bg-surface-2 hover:text-foreground",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" })
		})]
	});
}
function ChromeSidebar({ kind, onGo }) {
	const bookmarks = useBrowserStore((s) => s.bookmarks);
	const history = useBrowserStore((s) => s.history);
	const downloads = useBrowserStore((s) => s.downloads);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "px-3 py-2 text-xs font-medium uppercase tracking-[0.14em] text-muted",
			children: kind === "bookmarks" ? "Shortcuts" : kind === "history" ? "History" : "Downloads"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "min-h-0 flex-1 overflow-auto",
			children: kind === "bookmarks" ? bookmarks.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "w-full truncate px-3 py-2 text-left text-sm hover:bg-surface-2",
				onClick: () => onGo(b.url),
				children: b.title
			}) }, b.id)) : kind === "history" ? history.slice(0, 40).map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "w-full truncate px-3 py-2 text-left text-sm hover:bg-surface-2",
				onClick: () => onGo(h.url),
				children: h.title
			}) }, h.id)) : downloads.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: "truncate px-3 py-2 text-sm text-muted",
				children: d.filename
			}, d.id))
		})]
	});
}
function IconBtn({ children, label, onClick, disabled }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": label,
		title: label,
		disabled,
		onClick,
		className: "grid size-9 shrink-0 place-items-center rounded-md text-foreground hover:bg-surface-2 disabled:opacity-30 [&_svg]:size-4",
		children
	});
}
function MobileDock({ tabCount, onTabs, onNew, onSettings }) {
	const back = () => {
		const s = useBrowserStore.getState();
		s.back(s.activeId);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-12 items-center justify-around border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] sm:hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "grid size-11 place-items-center",
				"aria-label": "Back",
				onClick: back,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "grid size-11 place-items-center",
				"aria-label": "Tabs",
				onClick: onTabs,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid size-6 place-items-center rounded-md border border-border text-[11px] tabular-nums",
					children: tabCount
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "grid size-11 place-items-center",
				"aria-label": "New tab",
				onClick: onNew,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "grid size-11 place-items-center",
				"aria-label": "Downloads",
				onClick: () => useBrowserStore.getState().setOverlay("downloads"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "grid size-11 place-items-center",
				"aria-label": "Settings",
				onClick: onSettings,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "size-5" })
			})
		]
	});
}
function useHotkeys(addressRef, tab) {
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
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
			} else if (key === "n" && e.shiftKey) {
				prevent();
				s.applyStealth();
				toast.success("Stealth mode on");
			} else if (key === "i" && e.shiftKey) {
				prevent();
				s.setOverlay(s.overlay === "devtools" ? "none" : "devtools");
			} else if (e.key === "=" || e.key === "+") {
				prevent();
				s.setZoom(id, tab.zoom + .1);
			} else if (e.key === "-" || e.key === "_") {
				prevent();
				s.setZoom(id, tab.zoom - .1);
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
async function handleDownload(d) {
	const st = useBrowserStore.getState();
	const filename = d.filename || "download";
	st.addDownload({
		filename,
		url: d.url || d.href || "",
		mime: d.mime || "application/octet-stream",
		size: d.size || 0,
		status: "saving"
	});
	const target = d.href || d.url;
	if (!target) return;
	try {
		const blob = await (await fetch(target.startsWith("http") ? target : target)).blob();
		const href = URL.createObjectURL(blob);
		const latest = useBrowserStore.getState().downloads[0];
		if (latest) st.updateDownload(latest.id, {
			status: "done",
			href,
			size: blob.size
		});
		toast.success(`Saved ${filename}`);
	} catch {
		const latest = useBrowserStore.getState().downloads[0];
		if (latest) st.updateDownload(latest.id, { status: "error" });
		toast.error("Download failed");
	}
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrowserShell, {});
}
//#endregion
export { Home as component };
