import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.js";
import { n as ENGINES, t as DEFAULT_NGINX_LAYER } from "./types-ClFXg-cf.js";
import { n as encodeProxyPath } from "./router-AbSCCIEm.js";
import { useEffect, useRef, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { createClient } from "@supabase/supabase-js";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ArrowLeft, ArrowRight, Bookmark, Clock, Download, Ellipsis, Expand, Folder, Globe, History, Home as Home$1, Paintbrush, Plus, RotateCw, Search, Settings, Shield, ShieldOff, SlidersHorizontal, Square, Star, Trash2, Upload, X } from "lucide-react";
import { Toaster, toast } from "sonner";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import JSZip from "jszip";
//#region src/lib/crypto-box.ts
var encoder = new TextEncoder();
var decoder = new TextDecoder();
function bytesToB64(bytes) {
	let bin = "";
	for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
	return btoa(bin);
}
function b64ToBytes(s) {
	const bin = atob(s);
	const out = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
	return out;
}
async function importKey(secret) {
	const hash = await crypto.subtle.digest("SHA-256", encoder.encode(secret || "veil-default-key"));
	return crypto.subtle.importKey("raw", hash, "AES-GCM", false, ["encrypt", "decrypt"]);
}
async function encryptString(plain, secret) {
	const key = await importKey(secret);
	const iv = crypto.getRandomValues(/* @__PURE__ */ new Uint8Array(12));
	const cipher = await crypto.subtle.encrypt({
		name: "AES-GCM",
		iv
	}, key, encoder.encode(plain));
	const packed = new Uint8Array(iv.length + cipher.byteLength);
	packed.set(iv, 0);
	packed.set(new Uint8Array(cipher), iv.length);
	return bytesToB64(packed);
}
async function decryptString(packed, secret) {
	const raw = b64ToBytes(packed);
	const iv = raw.slice(0, 12);
	const data = raw.slice(12);
	const key = await importKey(secret);
	const plain = await crypto.subtle.decrypt({
		name: "AES-GCM",
		iv
	}, key, data);
	return decoder.decode(plain);
}
var config_default = {
	url: "https://oksrgyxrfbjkbspkqukx.supabase.co",
	publishableKey: "sb_publishable_UXd1PO9kWHEWUeGcRoKanA_lAe8Dttr",
	encryptionKey: "0d822ca22c0c7cdf08eb88ad5a75723e1b66ae7ebc5318ae7e6b2b14adc171b7"
};
//#endregion
//#region src/lib/supabase.ts
function getSupabaseConfig() {
	return {
		url: config_default.url?.trim() ?? "",
		publishableKey: config_default.publishableKey?.trim() ?? "",
		encryptionKey: config_default.encryptionKey?.trim() ?? ""
	};
}
function isSupabaseConfigured() {
	const c = getSupabaseConfig();
	return Boolean(c.url && c.publishableKey);
}
function encryptionSecret(userId) {
	return `${getSupabaseConfig().encryptionKey || "veil-local-enc"}:${userId || "guest"}`;
}
var client = null;
function getSupabase() {
	if (!isSupabaseConfigured()) return null;
	if (client) return client;
	const c = getSupabaseConfig();
	client = createClient(c.url, c.publishableKey, { auth: {
		persistSession: true,
		autoRefreshToken: true,
		detectSessionInUrl: true
	} });
	return client;
}
//#endregion
//#region src/lib/internal.ts
var INTERNAL_PAGES = [
	{
		host: "newtab",
		title: "New tab",
		path: "veil://newtab"
	},
	{
		host: "settings",
		title: "Settings",
		path: "veil://settings"
	},
	{
		host: "history",
		title: "History",
		path: "veil://history"
	},
	{
		host: "downloads",
		title: "Downloads",
		path: "veil://downloads"
	},
	{
		host: "bookmarks",
		title: "Bookmarks",
		path: "veil://bookmarks"
	},
	{
		host: "files",
		title: "Files",
		path: "veil://files"
	},
	{
		host: "shortcuts",
		title: "Keyboard shortcuts",
		path: "veil://shortcuts"
	},
	{
		host: "passwords",
		title: "Passwords",
		path: "veil://passwords"
	},
	{
		host: "about",
		title: "About",
		path: "veil://about"
	}
];
function parseInternal(url) {
	const raw = url.trim();
	if (!raw.toLowerCase().startsWith("veil://")) return null;
	const body = raw.slice(7);
	const cut = body.search(/[/?#]/);
	const host = (cut < 0 ? body : body.slice(0, cut)).toLowerCase().replace(/\/+$/, "");
	const rest = cut < 0 ? "" : body.slice(cut);
	const known = INTERNAL_PAGES.find((p) => p.host === host);
	if (!known) return null;
	return {
		host: known.host,
		rest
	};
}
function isInternalUrl(url) {
	return parseInternal(url) != null;
}
function internalTitle(url) {
	const parsed = parseInternal(url);
	if (!parsed) return "Veil";
	return INTERNAL_PAGES.find((p) => p.host === parsed.host)?.title ?? "Veil";
}
//#endregion
//#region src/lib/shortcuts.ts
var DEFAULT_SHORTCUTS = [
	{
		action: "newTab",
		combo: "Alt+T",
		label: "New tab"
	},
	{
		action: "closeTab",
		combo: "Alt+W",
		label: "Close tab"
	},
	{
		action: "reopenTab",
		combo: "Alt+Shift+T",
		label: "Reopen closed tab"
	},
	{
		action: "focusAddress",
		combo: "Alt+L",
		label: "Focus address bar"
	},
	{
		action: "reload",
		combo: "Alt+R",
		label: "Reload"
	},
	{
		action: "back",
		combo: "Alt+[",
		label: "Back"
	},
	{
		action: "forward",
		combo: "Alt+]",
		label: "Forward"
	},
	{
		action: "devtools",
		combo: "Alt+Shift+I",
		label: "Developer tools"
	},
	{
		action: "history",
		combo: "Alt+H",
		label: "History"
	},
	{
		action: "downloads",
		combo: "Alt+J",
		label: "Downloads"
	},
	{
		action: "settings",
		combo: "Alt+,",
		label: "Settings"
	},
	{
		action: "stealth",
		combo: "Alt+Shift+N",
		label: "Toggle stealth"
	},
	{
		action: "incognito",
		combo: "Alt+Shift+P",
		label: "New incognito tab"
	},
	{
		action: "nextTab",
		combo: "Alt+Tab",
		label: "Next tab"
	},
	{
		action: "prevTab",
		combo: "Alt+Shift+Tab",
		label: "Previous tab"
	},
	{
		action: "fullscreenProxy",
		combo: "Alt+Shift+F",
		label: "Open proxy fullscreen"
	}
];
function eventMatchesCombo(e, combo) {
	const parts = combo.split("+").map((p) => p.trim().toLowerCase());
	const needAlt = parts.includes("alt");
	const needShift = parts.includes("shift");
	const needMeta = parts.includes("meta") || parts.includes("cmd");
	const needCtrl = parts.includes("ctrl") || parts.includes("control");
	const key = parts[parts.length - 1] ?? "";
	if (!!e.altKey !== needAlt) return false;
	if (!!e.shiftKey !== needShift) return false;
	if (!!e.metaKey !== needMeta) return false;
	if (!!e.ctrlKey !== needCtrl) return false;
	const pressed = e.key.length === 1 ? e.key.toLowerCase() : e.key.toLowerCase();
	if (key === "tab") return e.key === "Tab";
	if (key === ",") return e.key === "," || e.code === "Comma";
	if (key === "[") return e.key === "[" || e.key === "ArrowLeft";
	if (key === "]") return e.key === "]" || e.key === "ArrowRight";
	return pressed === key;
}
function comboFromEvent(e) {
	const bits = [];
	if (e.altKey) bits.push("Alt");
	if (e.ctrlKey) bits.push("Ctrl");
	if (e.metaKey) bits.push("Meta");
	if (e.shiftKey) bits.push("Shift");
	const k = e.key === " " ? "Space" : e.key.length === 1 ? e.key.toUpperCase() : e.key;
	if (![
		"Alt",
		"Control",
		"Shift",
		"Meta"
	].includes(e.key)) bits.push(k);
	return bits.join("+");
}
//#endregion
//#region src/lib/utils.ts
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
//#endregion
//#region src/lib/browser-store.ts
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
var DEFAULT_SETTINGS = {
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
	theme: {
		preset: "chrome",
		mode: "light",
		density: "comfortable"
	},
	layout: {
		tabPosition: "top",
		bookmarkBar: false,
		statusBar: true,
		sidebar: "none"
	},
	shortcuts: DEFAULT_SHORTCUTS
};
function freshTab(incognito = false, url = "veil://newtab") {
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
		pointerLock: true
	};
}
var useBrowserStore = create()(persist((set, get) => {
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
		files: [{
			id: "folder_downloads",
			parentId: null,
			name: "Downloads",
			kind: "folder",
			size: 0,
			createdAt: Date.now()
		}],
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
				files: [{
					id: "folder_downloads",
					parentId: null,
					name: "Downloads",
					kind: "folder",
					size: 0,
					createdAt: Date.now()
				}],
				addressDraft: "veil://newtab",
				inspect: null,
				pageSource: "",
				nets: [],
				consoles: [],
				logs: []
			});
		},
		newTab: (url, opts) => {
			const tab = freshTab(opts?.incognito ?? false, url ?? "veil://newtab");
			set((s) => ({
				tabs: [...s.tabs, tab],
				activeId: tab.id,
				addressDraft: tab.displayUrl || tab.url
			}));
			if (url && !isInternalUrl(url) && !url.startsWith("veil:")) get().navigate(tab.id, url, { fromUser: true });
			return tab.id;
		},
		closeTab: (id) => {
			const { tabs, activeId } = get();
			if (tabs.length === 1) {
				const t = freshTab(tabs[0]?.incognito);
				set({
					tabs: [t],
					activeId: t.id,
					addressDraft: t.url
				});
				return;
			}
			const idx = tabs.findIndex((t) => t.id === id);
			const closing = tabs[idx];
			const nextTabs = tabs.filter((t) => t.id !== id);
			let nextId = activeId;
			if (activeId === id) nextId = (nextTabs[idx] ?? nextTabs[idx - 1] ?? nextTabs[0]).id;
			const next = nextTabs.find((t) => t.id === nextId);
			set({
				tabs: nextTabs,
				activeId: nextId,
				addressDraft: next?.displayUrl || next?.url || "",
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
		duplicateTab: (id) => {
			const tab = get().tabs.find((t) => t.id === id);
			if (!tab) return;
			get().newTab(tab.displayUrl || tab.url, { incognito: tab.incognito });
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
						favicon: parsed ? null : t.favicon
					};
				}),
				addressDraft: url
			}));
			const tab = get().tabs.find((t) => t.id === id);
			if (tab && !parsed && !tab.incognito && get().session.kind !== "guest") get().pushHistory(url, hostnameFrom(url), false);
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
					loading: !isInternalUrl(url),
					title: isInternalUrl(url) ? internalTitle(url) : hostnameFrom(url),
					crash: null
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
					loading: !isInternalUrl(url),
					title: isInternalUrl(url) ? internalTitle(url) : hostnameFrom(url)
				} : t),
				addressDraft: url
			}));
		},
		reload: (id) => set((s) => ({ tabs: s.tabs.map((t) => t.id === id && t.url && !isInternalUrl(t.url) ? {
			...t,
			url: t.displayUrl && !isInternalUrl(t.displayUrl) ? t.displayUrl : t.url,
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
				url: b?.url || tab?.displayUrl || tab?.url || "",
				folder: b?.folder
			};
			if (!bookmark.url || isInternalUrl(bookmark.url)) return;
			set((s) => ({
				bookmarks: [...s.bookmarks, bookmark],
				settings: {
					...s.settings,
					layout: {
						...s.settings.layout,
						bookmarkBar: true
					}
				}
			}));
		},
		removeBookmark: (id) => set((s) => ({ bookmarks: s.bookmarks.filter((b) => b.id !== id) })),
		updateBookmark: (id, patch) => set((s) => ({ bookmarks: s.bookmarks.map((b) => b.id === id ? {
			...b,
			...patch
		} : b) })),
		pushHistory: (url, title, incognito) => {
			if (incognito || get().session.kind === "guest") return;
			if (isInternalUrl(url)) return;
			set((s) => ({ history: [{
				id: uid("h"),
				url,
				title,
				at: Date.now()
			}, ...s.history.filter((h) => h.url !== url)].slice(0, 500) }));
		},
		clearHistory: () => set({ history: [] }),
		addDownload: (d) => {
			const item = {
				...d,
				id: uid("dl"),
				at: Date.now()
			};
			set((s) => ({ downloads: [item, ...s.downloads].slice(0, 100) }));
			return item.id;
		},
		updateDownload: (id, patch) => set((s) => ({ downloads: s.downloads.map((d) => d.id === id ? {
			...d,
			...patch
		} : d) })),
		clearDownloads: () => set({ downloads: [] }),
		addFile: (f) => {
			const id = uid("fs");
			set((s) => ({ files: [...s.files, {
				...f,
				id,
				createdAt: Date.now()
			}] }));
			return id;
		},
		removeFile: (id) => set((s) => ({ files: s.files.filter((f) => f.id !== id && f.parentId !== id) })),
		upsertPassword: (p) => set((s) => {
			if (s.session.kind === "guest") return s;
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
		log: (kind, message, url) => set((s) => ({ logs: [...s.logs, {
			id: uid("log"),
			at: Date.now(),
			kind,
			message,
			url
		}].slice(-400) })),
		pushNet: (hit) => set((s) => ({ nets: [...s.nets, {
			...hit,
			id: uid("n"),
			at: Date.now()
		}].slice(-250) })),
		pushConsole: (hit) => set((s) => ({ consoles: [...s.consoles, {
			...hit,
			id: uid("c"),
			at: Date.now()
		}].slice(-250) })),
		setInspect: (v) => set({ inspect: v }),
		setPageSource: (html) => set({ pageSource: html }),
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
		setShortcut: (action, combo) => set((s) => ({ settings: {
			...s.settings,
			shortcuts: s.settings.shortcuts.map((b) => b.action === action ? {
				...b,
				combo
			} : b)
		} })),
		setAddressDraft: (v) => set({ addressDraft: v }),
		setInspectOn: (v) => set({ inspectOn: v }),
		setDevtoolsOpen: (v) => set({ devtoolsOpen: v }),
		cycleTab: (dir) => {
			const { tabs, activeId } = get();
			if (tabs.length < 2) return;
			const next = tabs[(tabs.findIndex((t) => t.id === activeId) + dir + tabs.length) % tabs.length];
			if (next) get().activate(next.id);
		},
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
				hideServer: true
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
					},
					shortcuts: d.settings.shortcuts?.length ? d.settings.shortcuts : DEFAULT_SHORTCUTS
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
				veil: 2,
				exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
				settings: s.settings,
				bookmarks: s.bookmarks,
				history: s.history,
				passwords: s.passwords
			};
		}
	};
}, {
	name: "veil-browser",
	skipHydration: true,
	partialize: (s) => {
		if (s.session.kind !== "user") return {};
		const persistentTabs = s.tabs.filter((t) => !t.incognito);
		const tabs = (persistentTabs.length ? persistentTabs : [freshTab()]).map((t) => ({
			...t,
			loading: false,
			crash: null
		}));
		const activeId = tabs.some((t) => t.id === s.activeId) ? s.activeId : tabs[0].id;
		return {
			session: s.session,
			tabs,
			activeId,
			bookmarks: s.bookmarks,
			history: s.history,
			downloads: s.downloads.map(({ href: _h, ...rest }) => rest),
			passwords: s.passwords,
			files: s.files.map(({ href: _h, ...rest }) => rest),
			settings: s.settings
		};
	}
}));
function hostnameFrom(url) {
	try {
		return new URL(url).hostname.replace(/^www\./, "");
	} catch {
		return url.replace(/^veil:\/\//, "") || "Veil";
	}
}
function currentSearchEngine(s) {
	return s.searchEngines.find((e) => e.id === s.searchEngineId) ?? s.searchEngines[0] ?? DEFAULT_SEARCH_ENGINES[0];
}
//#endregion
//#region src/lib/account-sync.ts
async function hydrateCookieJar(userId) {
	const sb = getSupabase();
	if (!sb) return;
	const { data, error } = await sb.from("proxy_cookies").select("domain,name,path,value_enc,expires,secure,http_only");
	if (error || !data) return;
	const secret = encryptionSecret(userId);
	const cookies = [];
	for (const row of data) try {
		cookies.push({
			name: row.name,
			value: await decryptString(row.value_enc, secret),
			domain: row.domain,
			path: row.path || "/",
			expires: row.expires ? Date.parse(row.expires) : void 0,
			secure: !!row.secure,
			httpOnly: !!row.http_only
		});
	} catch {}
	await fetch("/api/jar", {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({
			cookies,
			userId
		})
	});
}
async function persistCookieRow(userId, cookie) {
	const sb = getSupabase();
	if (!sb) return;
	const value_enc = await encryptString(cookie.value, encryptionSecret(userId));
	await sb.from("proxy_cookies").upsert({
		user_id: userId,
		domain: cookie.domain,
		name: cookie.name,
		path: cookie.path || "/",
		value_enc
	}, { onConflict: "user_id,domain,name,path" });
}
async function pullCloud(userId) {
	const sb = getSupabase();
	if (!sb) return;
	const secret = encryptionSecret(userId);
	const [settingsRes, bookmarksRes, historyRes, passwordsRes] = await Promise.all([
		sb.from("user_settings").select("payload_enc").eq("user_id", userId).maybeSingle(),
		sb.from("bookmarks").select("id,title,url_enc,folder").eq("user_id", userId),
		sb.from("history_entries").select("id,title,url_enc,visited_at").eq("user_id", userId).order("visited_at", { ascending: false }).limit(400),
		sb.from("saved_passwords").select("id,origin_enc,username_enc,password_enc,updated_at").eq("user_id", userId)
	]);
	const patch = {};
	if (settingsRes.data?.payload_enc) try {
		const parsed = JSON.parse(await decryptString(settingsRes.data.payload_enc, secret));
		if (parsed && typeof parsed === "object") patch.settings = {
			...useBrowserStore.getState().settings,
			...parsed
		};
	} catch {}
	if (bookmarksRes.data) {
		const bookmarks = [];
		for (const row of bookmarksRes.data) try {
			bookmarks.push({
				id: row.id,
				title: row.title,
				url: await decryptString(row.url_enc, secret),
				folder: row.folder ?? void 0
			});
		} catch {}
		if (bookmarks.length) patch.bookmarks = bookmarks;
	}
	if (historyRes.data) {
		const history = [];
		for (const row of historyRes.data) try {
			history.push({
				id: row.id,
				title: row.title,
				url: await decryptString(row.url_enc, secret),
				at: Date.parse(row.visited_at) || Date.now()
			});
		} catch {}
		if (history.length) patch.history = history;
	}
	if (passwordsRes.data) {
		const passwords = [];
		for (const row of passwordsRes.data) try {
			passwords.push({
				id: row.id,
				origin: await decryptString(row.origin_enc, secret),
				username: await decryptString(row.username_enc, secret),
				password: await decryptString(row.password_enc, secret),
				updatedAt: Date.parse(row.updated_at) || Date.now()
			});
		} catch {}
		if (passwords.length) patch.passwords = passwords;
	}
	if (Object.keys(patch).length) useBrowserStore.setState(patch);
}
async function pushCloud(userId) {
	const sb = getSupabase();
	if (!sb) return;
	const secret = encryptionSecret(userId);
	const s = useBrowserStore.getState();
	const payload_enc = await encryptString(JSON.stringify(s.settings), secret);
	await sb.from("user_settings").upsert({
		user_id: userId,
		payload_enc,
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	});
	await sb.from("bookmarks").delete().eq("user_id", userId);
	const bookmarkRows = await Promise.all(s.bookmarks.map(async (b) => ({
		user_id: userId,
		title: b.title,
		url_enc: await encryptString(b.url, secret),
		folder: b.folder ?? null
	})));
	if (bookmarkRows.length) await sb.from("bookmarks").insert(bookmarkRows);
	await sb.from("history_entries").delete().eq("user_id", userId);
	const historyRows = await Promise.all(s.history.slice(0, 200).map(async (h) => ({
		user_id: userId,
		title: h.title,
		url_enc: await encryptString(h.url, secret),
		visited_at: new Date(h.at).toISOString()
	})));
	if (historyRows.length) await sb.from("history_entries").insert(historyRows);
	await sb.from("saved_passwords").delete().eq("user_id", userId);
	const passwordRows = await Promise.all(s.passwords.map(async (p) => ({
		user_id: userId,
		origin_enc: await encryptString(p.origin, secret),
		username_enc: await encryptString(p.username, secret),
		password_enc: await encryptString(p.password, secret),
		updated_at: new Date(p.updatedAt).toISOString()
	})));
	if (passwordRows.length) await sb.from("saved_passwords").insert(passwordRows);
}
var unsub = null;
var timer = null;
async function startAccountSync(userId) {
	stopAccountSync();
	await Promise.all([hydrateCookieJar(userId), pullCloud(userId)]);
	unsub = useBrowserStore.subscribe((state, prev) => {
		if (state.session.kind !== "user") return;
		if (state.settings === prev.settings && state.bookmarks === prev.bookmarks && state.history === prev.history && state.passwords === prev.passwords) return;
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			pushCloud(userId);
		}, 1400);
	});
}
function stopAccountSync() {
	unsub?.();
	unsub = null;
	if (timer) clearTimeout(timer);
	timer = null;
}
//#endregion
//#region src/components/ui/button.tsx
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
	return /* @__PURE__ */ jsx(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		...props
	});
}
//#endregion
//#region src/components/ui/input.tsx
function Input({ className, type, ...props }) {
	return /* @__PURE__ */ jsx("input", {
		type,
		className: cn("flex h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted outline-none transition-[box-shadow,border-color] duration-[var(--motion-quick)] focus-visible:border-ring/60 focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-50", className),
		...props
	});
}
//#endregion
//#region src/components/browser/login.tsx
function LoginScreen() {
	const setSession = useBrowserStore((s) => s.setSession);
	const [mode, setMode] = useState("signin");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState("");
	const configured = isSupabaseConfigured();
	async function submit(e) {
		e.preventDefault();
		setError("");
		if (!configured) {
			setError("Add your Supabase URL and publishable key in supabase/config.json.");
			return;
		}
		const sb = getSupabase();
		if (!sb) return;
		setBusy(true);
		try {
			if (mode === "signup") {
				const { data, error: err } = await sb.auth.signUp({
					email,
					password
				});
				if (err) throw err;
				if (data.user) {
					setSession({
						kind: "user",
						userId: data.user.id,
						email: data.user.email || email
					});
					startAccountSync(data.user.id);
				} else toast.success("Check your email to confirm the account.");
			} else {
				const { data, error: err } = await sb.auth.signInWithPassword({
					email,
					password
				});
				if (err) throw err;
				if (data.user) {
					setSession({
						kind: "user",
						userId: data.user.id,
						email: data.user.email || email
					});
					startAccountSync(data.user.id);
				}
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not sign in.");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ jsx("div", {
		className: "flex min-h-dvh items-center justify-center bg-background px-5",
		children: /* @__PURE__ */ jsxs("div", {
			className: "w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-[var(--shadow-panel)]",
			children: [
				/* @__PURE__ */ jsxs("header", {
					className: "mb-8 flex flex-col items-center text-center",
					children: [/* @__PURE__ */ jsxs("h1", {
						className: "flex items-center gap-3 text-2xl font-semibold tracking-tight",
						children: [/* @__PURE__ */ jsx("img", {
							src: "/hacker114.png",
							alt: "",
							width: 40,
							height: 40,
							className: "size-10 rounded-lg"
						}), "Hacker114"]
					}), /* @__PURE__ */ jsx("p", {
						className: "mt-2 text-sm text-muted",
						children: "Sign in to sync Veil across devices, or continue as a guest."
					})]
				}),
				/* @__PURE__ */ jsxs("form", {
					className: "flex flex-col gap-3",
					onSubmit: submit,
					children: [
						/* @__PURE__ */ jsx(Input, {
							type: "email",
							autoComplete: "email",
							required: true,
							placeholder: "Email",
							value: email,
							onChange: (e) => setEmail(e.target.value)
						}),
						/* @__PURE__ */ jsx(Input, {
							type: "password",
							autoComplete: mode === "signup" ? "new-password" : "current-password",
							required: true,
							minLength: 6,
							placeholder: "Password",
							value: password,
							onChange: (e) => setPassword(e.target.value)
						}),
						error ? /* @__PURE__ */ jsx("p", {
							className: "text-sm text-danger",
							children: error
						}) : null,
						/* @__PURE__ */ jsx(Button, {
							type: "submit",
							className: "h-11",
							disabled: busy,
							children: busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"
						})
					]
				}),
				/* @__PURE__ */ jsx("button", {
					type: "button",
					className: "mt-3 w-full text-center text-sm text-muted hover:text-foreground",
					onClick: () => setMode(mode === "signin" ? "signup" : "signin"),
					children: mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "my-6 flex items-center gap-3 text-xs uppercase tracking-[0.14em] text-muted",
					children: [
						/* @__PURE__ */ jsx("span", { className: "h-px flex-1 bg-border" }),
						"or",
						/* @__PURE__ */ jsx("span", { className: "h-px flex-1 bg-border" })
					]
				}),
				/* @__PURE__ */ jsx(Button, {
					type: "button",
					variant: "secondary",
					className: "h-11 w-full",
					onClick: () => setSession({ kind: "guest" }),
					children: "Use as guest"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-3 text-center text-xs text-muted",
					children: "Guest mode is the proxy only — history, passwords, and files are not saved to an account."
				})
			]
		})
	});
}
//#endregion
//#region src/components/ui/label.tsx
function Label({ className, ...props }) {
	return /* @__PURE__ */ jsx("label", {
		className: cn("text-sm font-medium text-foreground leading-none", className),
		...props
	});
}
//#endregion
//#region src/components/ui/switch.tsx
function Switch({ className, ...props }) {
	return /* @__PURE__ */ jsx(SwitchPrimitive.Root, {
		className: cn("peer inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full border border-border bg-surface-2 transition-colors data-[state=checked]:bg-accent", className),
		...props,
		children: /* @__PURE__ */ jsx(SwitchPrimitive.Thumb, { className: "pointer-events-none block size-4 translate-x-1 rounded-full bg-foreground shadow transition-transform data-[state=checked]:translate-x-5 data-[state=checked]:bg-accent-foreground" })
	});
}
//#endregion
//#region src/components/ui/separator.tsx
function Separator({ className, orientation = "horizontal" }) {
	return /* @__PURE__ */ jsx("div", {
		role: "separator",
		className: cn("shrink-0 bg-border", orientation === "horizontal" ? "h-px w-full" : "h-full w-px", className)
	});
}
//#endregion
//#region src/components/browser/icons.tsx
function VeilMark({ className }) {
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 32 32",
		className,
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ jsx("rect", {
				x: "3",
				y: "3",
				width: "26",
				height: "26",
				rx: "7",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.6"
			}),
			/* @__PURE__ */ jsx("rect", {
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
			/* @__PURE__ */ jsx("rect", {
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
//#endregion
//#region src/components/browser/new-tab.tsx
function NewTab({ onGo }) {
	const bookmarks = useBrowserStore((s) => s.bookmarks);
	const history = useBrowserStore((s) => s.history);
	const settings = useBrowserStore((s) => s.settings);
	const session = useBrowserStore((s) => s.session);
	const engine = currentSearchEngine(settings);
	const recent = session.kind === "guest" ? [] : history.slice(0, 6);
	return /* @__PURE__ */ jsx("div", {
		className: "relative flex h-full flex-col overflow-auto bg-surface veil-scroll",
		children: /* @__PURE__ */ jsxs("div", {
			className: "relative mx-auto flex w-full max-w-3xl flex-col gap-10 px-5 pb-16 pt-16 sm:pt-24",
			children: [
				/* @__PURE__ */ jsxs("header", {
					className: "flex flex-col items-center gap-3 text-center",
					children: [
						/* @__PURE__ */ jsx(VeilMark, { className: "size-12 text-foreground" }),
						/* @__PURE__ */ jsx("h1", {
							className: "text-4xl font-semibold tracking-[-0.04em] sm:text-5xl",
							children: "Veil"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-sm text-muted",
							children: "Search or enter an address"
						})
					]
				}),
				/* @__PURE__ */ jsxs("form", {
					className: "flex items-center gap-2 rounded-xl border border-border bg-background p-1.5 shadow-[var(--shadow-panel)]",
					onSubmit: (e) => {
						e.preventDefault();
						const fd = new FormData(e.currentTarget);
						const url = normalizeNavigableUrl(String(fd.get("q") ?? ""), engine.url);
						if (url) onGo(url);
					},
					children: [
						/* @__PURE__ */ jsx(Search, { className: "ml-3 size-4 shrink-0 text-muted" }),
						/* @__PURE__ */ jsx("input", {
							name: "q",
							autoFocus: true,
							placeholder: `Search ${engine.name} or enter an address`,
							className: "h-12 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted"
						}),
						/* @__PURE__ */ jsx("button", {
							type: "submit",
							className: "h-12 rounded-lg bg-accent px-5 text-sm font-medium text-accent-foreground",
							children: "Go"
						})
					]
				}),
				bookmarks.length ? /* @__PURE__ */ jsxs("section", { children: [/* @__PURE__ */ jsx("h2", {
					className: "mb-3 text-xs font-medium uppercase tracking-[0.14em] text-muted",
					children: "Shortcuts"
				}), /* @__PURE__ */ jsx("div", {
					className: "grid grid-cols-2 gap-2 sm:grid-cols-4",
					children: bookmarks.slice(0, 8).map((b) => /* @__PURE__ */ jsx(ShortcutTile, {
						bookmark: b,
						onGo
					}, b.id))
				})] }) : /* @__PURE__ */ jsxs("p", {
					className: "flex items-center justify-center gap-2 text-sm text-muted",
					children: [/* @__PURE__ */ jsx(Plus, { className: "size-4" }), "Star a site in the address bar to pin it here."]
				}),
				recent.length ? /* @__PURE__ */ jsxs("section", { children: [/* @__PURE__ */ jsxs("div", {
					className: "mb-3 flex items-center gap-2 text-muted",
					children: [/* @__PURE__ */ jsx(Clock, { className: "size-3.5" }), /* @__PURE__ */ jsx("h2", {
						className: "text-xs font-medium uppercase tracking-[0.14em]",
						children: "Recent"
					})]
				}), /* @__PURE__ */ jsx("ul", {
					className: "divide-y divide-border overflow-hidden rounded-xl border border-border bg-background",
					children: recent.map((h) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: () => onGo(h.url),
						className: "flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-surface-2",
						children: [/* @__PURE__ */ jsxs("span", {
							className: "min-w-0",
							children: [/* @__PURE__ */ jsx("span", {
								className: "block truncate text-sm",
								children: h.title
							}), /* @__PURE__ */ jsx("span", {
								className: "block truncate text-xs text-muted",
								children: h.url
							})]
						}), /* @__PURE__ */ jsx("span", {
							className: "shrink-0 text-xs tabular-nums text-muted",
							children: formatRelative(h.at)
						})]
					}) }, h.id))
				})] }) : null
			]
		})
	});
}
function ShortcutTile({ bookmark, onGo }) {
	return /* @__PURE__ */ jsxs("button", {
		type: "button",
		onClick: () => onGo(bookmark.url),
		className: "flex items-center gap-3 rounded-xl border border-border bg-background p-3 text-left hover:bg-surface-2",
		children: [/* @__PURE__ */ jsx("span", {
			className: "grid size-10 place-items-center rounded-lg bg-surface-2 text-xs font-semibold",
			children: letterMark(bookmark.title)
		}), /* @__PURE__ */ jsxs("span", {
			className: "min-w-0",
			children: [/* @__PURE__ */ jsx("span", {
				className: "block truncate text-sm font-medium",
				children: bookmark.title
			}), /* @__PURE__ */ jsx("span", {
				className: "block truncate text-xs text-muted",
				children: bookmark.url.replace(/^https?:\/\//, "")
			})]
		})]
	});
}
//#endregion
//#region src/components/browser/internal-page.tsx
function InternalPage({ url, onGo }) {
	const host = parseInternal(url)?.host ?? "newtab";
	if (host === "newtab") return /* @__PURE__ */ jsx(NewTab, { onGo });
	if (host === "settings") return /* @__PURE__ */ jsx(SettingsPage, {});
	if (host === "history") return /* @__PURE__ */ jsx(HistoryPage, { onGo });
	if (host === "downloads") return /* @__PURE__ */ jsx(DownloadsPage, {});
	if (host === "bookmarks") return /* @__PURE__ */ jsx(BookmarksPage, { onGo });
	if (host === "files") return /* @__PURE__ */ jsx(FilesPage, {});
	if (host === "shortcuts") return /* @__PURE__ */ jsx(ShortcutsPage, {});
	if (host === "passwords") return /* @__PURE__ */ jsx(PasswordsPage, {});
	if (host === "about") return /* @__PURE__ */ jsx(AboutPage, {});
	return /* @__PURE__ */ jsx(NewTab, { onGo });
}
function SettingsPage() {
	const [section, setSection] = useState("general");
	const settings = useBrowserStore((s) => s.settings);
	const session = useBrowserStore((s) => s.session);
	const patchSettings = useBrowserStore((s) => s.patchSettings);
	const setTheme = useBrowserStore((s) => s.setTheme);
	const applyStealth = useBrowserStore((s) => s.applyStealth);
	const guest = session.kind === "guest";
	return /* @__PURE__ */ jsxs("div", {
		className: "flex h-full min-h-0 bg-surface",
		children: [/* @__PURE__ */ jsx("nav", {
			className: "hidden w-56 shrink-0 flex-col gap-1 overflow-auto border-r border-border p-3 sm:flex",
			children: [
				{
					id: "general",
					label: "General",
					icon: SlidersHorizontal
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
					id: "about",
					label: "About",
					icon: Bookmark
				}
			].map((n) => {
				const Icon = n.icon;
				const on = section === n.id;
				return /* @__PURE__ */ jsxs("button", {
					type: "button",
					onClick: () => setSection(n.id),
					className: `flex h-11 items-center gap-2 rounded-lg px-3 text-sm ${on ? "bg-surface-2 font-medium" : "text-muted hover:bg-surface-2 hover:text-foreground"}`,
					children: [/* @__PURE__ */ jsx(Icon, { className: "size-4" }), n.label]
				}, n.id);
			})
		}), /* @__PURE__ */ jsxs("div", {
			className: "min-h-0 flex-1 overflow-auto p-6 veil-scroll",
			children: [
				section === "general" ? /* @__PURE__ */ jsxs(Block, {
					title: "General",
					desc: "Search engine and home page.",
					children: [
						guest ? /* @__PURE__ */ jsx("p", {
							className: "rounded-lg bg-surface-2 px-3 py-2 text-sm text-muted",
							children: "Guest session — these choices stay on this device until you leave."
						}) : null,
						/* @__PURE__ */ jsxs(Field, {
							label: "Search engine",
							children: [/* @__PURE__ */ jsx("select", {
								className: "h-11 w-full rounded-lg border border-border bg-background px-3 text-sm",
								value: settings.searchEngineId,
								onChange: (e) => patchSettings({ searchEngineId: e.target.value }),
								children: settings.searchEngines.map((se) => /* @__PURE__ */ jsx("option", {
									value: se.id,
									children: se.name
								}, se.id))
							}), /* @__PURE__ */ jsx("p", {
								className: "mt-1 text-xs text-muted",
								children: currentSearchEngine(settings).url
							})]
						}),
						/* @__PURE__ */ jsx(AddSearchEngine, {}),
						/* @__PURE__ */ jsx(Field, {
							label: "Home page (blank = New Tab)",
							children: /* @__PURE__ */ jsx(Input, {
								value: settings.homeUrl,
								placeholder: "https://…",
								onChange: (e) => patchSettings({ homeUrl: e.target.value })
							})
						})
					]
				}) : null,
				section === "appearance" ? /* @__PURE__ */ jsxs(Block, {
					title: "Appearance",
					desc: "Pick a look. Right-click the tab strip or toolbar to rearrange chrome — no CSS required.",
					children: [
						/* @__PURE__ */ jsx(Field, {
							label: "Theme",
							children: /* @__PURE__ */ jsx("div", {
								className: "grid grid-cols-2 gap-2 sm:grid-cols-4",
								children: [
									"chrome",
									"safari",
									"midnight",
									"graphite"
								].map((p) => /* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => setTheme({
										preset: p,
										mode: p === "midnight" || p === "graphite" ? "dark" : "light"
									}),
									className: `h-20 rounded-xl border capitalize ${settings.theme.preset === p ? "border-ring bg-surface-2" : "border-border bg-background"}`,
									children: p
								}, p))
							})
						}),
						/* @__PURE__ */ jsx(Field, {
							label: "Density",
							children: /* @__PURE__ */ jsx("div", {
								className: "flex gap-2",
								children: ["comfortable", "compact"].map((d) => /* @__PURE__ */ jsx(Button, {
									variant: settings.theme.density === d ? "default" : "outline",
									size: "sm",
									onClick: () => setTheme({ density: d }),
									children: d
								}, d))
							})
						}),
						/* @__PURE__ */ jsx(Field, {
							label: "Tab strip",
							children: /* @__PURE__ */ jsxs("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ jsx(Button, {
									variant: settings.layout.tabPosition === "top" ? "default" : "outline",
									size: "sm",
									onClick: () => useBrowserStore.getState().setLayout({ tabPosition: "top" }),
									children: "Top"
								}), /* @__PURE__ */ jsx(Button, {
									variant: settings.layout.tabPosition === "bottom" ? "default" : "outline",
									size: "sm",
									onClick: () => useBrowserStore.getState().setLayout({ tabPosition: "bottom" }),
									children: "Bottom"
								})]
							})
						}),
						/* @__PURE__ */ jsx(Row, {
							label: "Bookmarks bar",
							checked: settings.layout.bookmarkBar,
							onChange: (v) => useBrowserStore.getState().setLayout({ bookmarkBar: v })
						}),
						/* @__PURE__ */ jsx(Row, {
							label: "Status bar",
							checked: settings.layout.statusBar,
							onChange: (v) => useBrowserStore.getState().setLayout({ statusBar: v })
						})
					]
				}) : null,
				section === "proxy" ? /* @__PURE__ */ jsxs(Block, {
					title: "Proxy engine",
					desc: "Switching engines reloads the current tab through that codec and header profile.",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "grid gap-2",
							children: Object.keys(ENGINES).map((id) => {
								const e = ENGINES[id];
								const on = settings.engine === id;
								return /* @__PURE__ */ jsxs("button", {
									type: "button",
									onClick: () => {
										patchSettings({ engine: id });
										const st = useBrowserStore.getState();
										st.reload(st.activeId);
									},
									className: `rounded-xl border p-4 text-left ${on ? "border-ring bg-surface-2" : "border-border bg-background hover:bg-surface-2"}`,
									children: [/* @__PURE__ */ jsxs("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ jsx("span", {
											className: "text-sm font-medium",
											children: e.name
										}), /* @__PURE__ */ jsx("span", {
											className: "text-xs text-muted",
											children: e.tagline
										})]
									}), /* @__PURE__ */ jsx("p", {
										className: "mt-1 text-xs text-muted",
										children: e.description
									})]
								}, id);
							})
						}),
						/* @__PURE__ */ jsx(Separator, { className: "my-4" }),
						/* @__PURE__ */ jsx(Row, {
							label: "Hide Server / X-Powered-By",
							checked: settings.nginx.hideServer,
							onChange: (v) => patchSettings({ nginx: {
								...settings.nginx,
								hideServer: v,
								hidePoweredBy: v
							} })
						}),
						/* @__PURE__ */ jsx(Row, {
							label: "Forward client IP",
							checked: settings.nginx.forwardFor,
							onChange: (v) => patchSettings({ nginx: {
								...settings.nginx,
								forwardFor: v
							} })
						}),
						/* @__PURE__ */ jsx(Field, {
							label: "User-Agent override",
							children: /* @__PURE__ */ jsx(Input, {
								value: settings.nginx.userAgentOverride,
								placeholder: "Leave blank for Chrome 131",
								onChange: (e) => patchSettings({ nginx: {
									...settings.nginx,
									userAgentOverride: e.target.value
								} })
							})
						}),
						/* @__PURE__ */ jsx(Button, {
							onClick: () => {
								applyStealth();
								toast.success("Stealth on — URLs are encoded on the wire.");
							},
							children: "Enable stealth profile"
						})
					]
				}) : null,
				section === "privacy" ? /* @__PURE__ */ jsxs(Block, {
					title: "Privacy",
					desc: "Ghostery EasyList blocker, stealth encoding, and fingerprint resistance.",
					children: [
						/* @__PURE__ */ jsx(Row, {
							label: "Ad blocker (EasyList)",
							checked: settings.adblock,
							onChange: (v) => patchSettings({ adblock: v })
						}),
						/* @__PURE__ */ jsx(Row, {
							label: "Stealth (encode proxy URLs)",
							checked: settings.stealth,
							onChange: (v) => patchSettings({ stealth: v })
						}),
						/* @__PURE__ */ jsx(Row, {
							label: "Block WebRTC leaks",
							checked: settings.webrtcBlock,
							onChange: (v) => patchSettings({ webrtcBlock: v })
						}),
						/* @__PURE__ */ jsx(Row, {
							label: "Resist fingerprinting",
							checked: settings.fingerprintResist,
							onChange: (v) => patchSettings({ fingerprintResist: v })
						})
					]
				}) : null,
				section === "about" ? /* @__PURE__ */ jsx(AboutPage, {}) : null
			]
		})]
	});
}
function HistoryPage({ onGo }) {
	const history = useBrowserStore((s) => s.history);
	const session = useBrowserStore((s) => s.session);
	const clearHistory = useBrowserStore((s) => s.clearHistory);
	const [q, setQ] = useState("");
	if (session.kind === "guest") return /* @__PURE__ */ jsx(Empty, {
		title: "History is off for guests",
		body: "Sign in to keep a private, encrypted history on your account."
	});
	const filtered = history.filter((h) => h.title.toLowerCase().includes(q.toLowerCase()) || h.url.toLowerCase().includes(q.toLowerCase()));
	return /* @__PURE__ */ jsxs("div", {
		className: "flex h-full flex-col bg-surface",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex items-center gap-2 border-b border-border p-4",
			children: [
				/* @__PURE__ */ jsx(History, { className: "size-4 text-muted" }),
				/* @__PURE__ */ jsx(Input, {
					value: q,
					onChange: (e) => setQ(e.target.value),
					placeholder: "Search history",
					className: "h-10"
				}),
				/* @__PURE__ */ jsxs(Button, {
					variant: "ghost",
					onClick: clearHistory,
					children: [/* @__PURE__ */ jsx(Trash2, { className: "size-4" }), " Clear"]
				})
			]
		}), /* @__PURE__ */ jsx("ul", {
			className: "flex-1 overflow-auto veil-scroll",
			children: filtered.length === 0 ? /* @__PURE__ */ jsx("li", {
				className: "px-4 py-16 text-center text-sm text-muted",
				children: "No history yet."
			}) : filtered.map((h) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("button", {
				type: "button",
				onClick: () => onGo(h.url),
				className: "flex w-full items-center justify-between gap-3 px-5 py-3 text-left hover:bg-surface-2",
				children: [/* @__PURE__ */ jsxs("span", {
					className: "min-w-0",
					children: [/* @__PURE__ */ jsx("span", {
						className: "block truncate text-sm",
						children: h.title
					}), /* @__PURE__ */ jsx("span", {
						className: "block truncate text-xs text-muted",
						children: h.url
					})]
				}), /* @__PURE__ */ jsx("span", {
					className: "text-xs tabular-nums text-muted",
					children: formatRelative(h.at)
				})]
			}) }, h.id))
		})]
	});
}
function DownloadsPage() {
	const downloads = useBrowserStore((s) => s.downloads);
	return /* @__PURE__ */ jsxs("div", {
		className: "flex h-full flex-col bg-surface",
		children: [/* @__PURE__ */ jsxs("header", {
			className: "flex items-center justify-between border-b border-border px-5 py-4",
			children: [/* @__PURE__ */ jsx("h1", {
				className: "text-lg font-semibold",
				children: "Downloads"
			}), /* @__PURE__ */ jsx(Button, {
				variant: "ghost",
				onClick: () => useBrowserStore.getState().newTab("veil://files"),
				children: "Open Files"
			})]
		}), /* @__PURE__ */ jsx("ul", {
			className: "flex-1 overflow-auto veil-scroll",
			children: downloads.length === 0 ? /* @__PURE__ */ jsx("li", {
				className: "px-4 py-16 text-center text-sm text-muted",
				children: "Files you save from sites land here, not in the host browser."
			}) : downloads.map((d) => /* @__PURE__ */ jsxs("li", {
				className: "flex items-center justify-between gap-3 border-b border-border px-5 py-3",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ jsx("p", {
						className: "truncate text-sm",
						children: d.filename
					}), /* @__PURE__ */ jsxs("p", {
						className: "text-xs text-muted",
						children: [
							formatBytes(d.size),
							" · ",
							d.status,
							" · ",
							formatRelative(d.at)
						]
					})]
				}), d.href ? /* @__PURE__ */ jsx("a", {
					href: d.href,
					download: d.filename,
					className: "text-sm text-ring",
					children: "Export"
				}) : /* @__PURE__ */ jsx(Download, { className: "size-4 text-muted" })]
			}, d.id))
		})]
	});
}
function BookmarksPage({ onGo }) {
	const bookmarks = useBrowserStore((s) => s.bookmarks);
	const removeBookmark = useBrowserStore((s) => s.removeBookmark);
	return /* @__PURE__ */ jsxs("div", {
		className: "flex h-full flex-col bg-surface",
		children: [/* @__PURE__ */ jsxs("header", {
			className: "border-b border-border px-5 py-4",
			children: [/* @__PURE__ */ jsx("h1", {
				className: "text-lg font-semibold",
				children: "Bookmarks"
			}), /* @__PURE__ */ jsx("p", {
				className: "text-sm text-muted",
				children: "Empty until you star a site."
			})]
		}), /* @__PURE__ */ jsx("ul", {
			className: "flex-1 overflow-auto veil-scroll",
			children: bookmarks.length === 0 ? /* @__PURE__ */ jsx("li", {
				className: "px-4 py-16 text-center text-sm text-muted",
				children: "No bookmarks yet."
			}) : bookmarks.map((b) => /* @__PURE__ */ jsxs("li", {
				className: "flex items-center justify-between gap-3 border-b border-border px-5 py-3",
				children: [/* @__PURE__ */ jsxs("button", {
					type: "button",
					className: "min-w-0 flex-1 text-left",
					onClick: () => onGo(b.url),
					children: [/* @__PURE__ */ jsx("span", {
						className: "block truncate text-sm",
						children: b.title
					}), /* @__PURE__ */ jsx("span", {
						className: "block truncate text-xs text-muted",
						children: b.url
					})]
				}), /* @__PURE__ */ jsx(Button, {
					variant: "ghost",
					size: "sm",
					onClick: () => removeBookmark(b.id),
					children: "Remove"
				})]
			}, b.id))
		})]
	});
}
function FilesPage() {
	const files = useBrowserStore((s) => s.files);
	const addFile = useBrowserStore((s) => s.addFile);
	const [folder, setFolder] = useState("folder_downloads");
	const [newName, setNewName] = useState("");
	const current = files.filter((f) => f.parentId === folder);
	const here = files.find((f) => f.id === folder);
	async function exportAll() {
		const zip = new JSZip();
		for (const f of files.filter((x) => x.kind === "file")) {
			if (!f.href) continue;
			try {
				const res = await fetch(f.href);
				zip.file(f.name, await res.blob());
			} catch {}
		}
		const blob = await zip.generateAsync({ type: "blob" });
		const a = document.createElement("a");
		a.href = URL.createObjectURL(blob);
		a.download = "veil-files.zip";
		a.click();
	}
	return /* @__PURE__ */ jsxs("div", {
		className: "flex h-full flex-col bg-surface",
		children: [/* @__PURE__ */ jsxs("header", {
			className: "flex items-center justify-between border-b border-border px-5 py-4",
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
				className: "text-lg font-semibold",
				children: here?.name ?? "Files"
			}), /* @__PURE__ */ jsx("p", {
				className: "text-sm text-muted",
				children: "Veil’s library — export a zip to your computer."
			})] }), /* @__PURE__ */ jsxs("div", {
				className: "flex gap-2",
				children: [
					/* @__PURE__ */ jsx(Input, {
						value: newName,
						placeholder: "New folder",
						className: "h-9 w-36",
						onChange: (e) => setNewName(e.target.value)
					}),
					/* @__PURE__ */ jsxs(Button, {
						variant: "secondary",
						onClick: () => {
							if (!newName.trim()) return;
							addFile({
								parentId: null,
								name: newName.trim(),
								kind: "folder",
								size: 0
							});
							setNewName("");
						},
						children: [/* @__PURE__ */ jsx(Folder, { className: "size-4" }), " New"]
					}),
					/* @__PURE__ */ jsxs(Button, {
						onClick: () => void exportAll(),
						children: [/* @__PURE__ */ jsx(Upload, { className: "size-4" }), " Export zip"]
					})
				]
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "flex min-h-0 flex-1",
			children: [/* @__PURE__ */ jsx("aside", {
				className: "w-48 shrink-0 border-r border-border p-3",
				children: files.filter((f) => f.kind === "folder").map((f) => /* @__PURE__ */ jsxs("button", {
					type: "button",
					onClick: () => setFolder(f.id),
					className: `flex h-10 w-full items-center gap-2 rounded-lg px-2 text-sm ${folder === f.id ? "bg-surface-2" : "hover:bg-surface-2"}`,
					children: [
						/* @__PURE__ */ jsx(Folder, { className: "size-4" }),
						" ",
						f.name
					]
				}, f.id))
			}), /* @__PURE__ */ jsx("ul", {
				className: "flex-1 overflow-auto p-3 veil-scroll",
				children: current.filter((f) => f.kind === "file").length === 0 ? /* @__PURE__ */ jsx("li", {
					className: "px-3 py-16 text-center text-sm text-muted",
					children: "This folder is empty."
				}) : current.filter((f) => f.kind === "file").map((f) => /* @__PURE__ */ jsxs("li", {
					className: "flex items-center justify-between rounded-lg px-3 py-3 hover:bg-surface-2",
					children: [/* @__PURE__ */ jsx("span", {
						className: "truncate text-sm",
						children: f.name
					}), f.href ? /* @__PURE__ */ jsx("a", {
						href: f.href,
						download: f.name,
						className: "text-sm text-ring",
						children: "Export"
					}) : /* @__PURE__ */ jsx("span", {
						className: "text-xs text-muted",
						children: formatBytes(f.size)
					})]
				}, f.id))
			})]
		})]
	});
}
function ShortcutsPage() {
	const shortcuts = useBrowserStore((s) => s.settings.shortcuts);
	const setShortcut = useBrowserStore((s) => s.setShortcut);
	const [listening, setListening] = useState(null);
	return /* @__PURE__ */ jsx("div", {
		className: "overflow-auto bg-surface p-6 veil-scroll",
		children: /* @__PURE__ */ jsxs("div", {
			className: "mx-auto max-w-lg",
			children: [
				/* @__PURE__ */ jsx("h1", {
					className: "text-lg font-semibold",
					children: "Keyboard shortcuts"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-1 mb-5 text-sm text-muted",
					children: "Click a binding, then press the new keys. Alt is used so shortcuts still work inside this tab."
				}),
				/* @__PURE__ */ jsx("ul", {
					className: "divide-y divide-border overflow-hidden rounded-xl border border-border",
					children: (shortcuts.length ? shortcuts : DEFAULT_SHORTCUTS).map((row) => /* @__PURE__ */ jsxs("li", {
						className: "flex items-center justify-between px-4 py-3 text-sm",
						children: [/* @__PURE__ */ jsx("span", { children: row.label }), /* @__PURE__ */ jsx("button", {
							type: "button",
							className: "rounded-md bg-surface-2 px-2 py-1 font-mono text-xs",
							onClick: () => setListening(row.action),
							onKeyDown: (e) => {
								if (listening !== row.action) return;
								e.preventDefault();
								if ([
									"Alt",
									"Control",
									"Shift",
									"Meta"
								].includes(e.key)) return;
								setShortcut(row.action, comboFromEvent(e.nativeEvent));
								setListening(null);
							},
							children: listening === row.action ? "Press keys…" : row.combo
						})]
					}, row.action))
				})
			]
		})
	});
}
function PasswordsPage() {
	const passwords = useBrowserStore((s) => s.passwords);
	const session = useBrowserStore((s) => s.session);
	const upsertPassword = useBrowserStore((s) => s.upsertPassword);
	const removePassword = useBrowserStore((s) => s.removePassword);
	const [origin, setOrigin] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	if (session.kind === "guest") return /* @__PURE__ */ jsx(Empty, {
		title: "Passwords need an account",
		body: "Guest mode does not store logins."
	});
	return /* @__PURE__ */ jsx("div", {
		className: "overflow-auto bg-surface p-6 veil-scroll",
		children: /* @__PURE__ */ jsxs("div", {
			className: "mx-auto max-w-2xl space-y-4",
			children: [
				/* @__PURE__ */ jsx("h1", {
					className: "text-lg font-semibold",
					children: "Passwords"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "text-sm text-muted",
					children: "Stored encrypted in your Supabase project when configured."
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "grid gap-2 sm:grid-cols-3",
					children: [
						/* @__PURE__ */ jsx(Input, {
							placeholder: "https://site.example",
							value: origin,
							onChange: (e) => setOrigin(e.target.value)
						}),
						/* @__PURE__ */ jsx(Input, {
							placeholder: "Username",
							value: username,
							onChange: (e) => setUsername(e.target.value)
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ jsx(Input, {
								type: "password",
								placeholder: "Password",
								value: password,
								onChange: (e) => setPassword(e.target.value)
							}), /* @__PURE__ */ jsx(Button, {
								variant: "secondary",
								onClick: () => {
									if (!origin || !username) return;
									upsertPassword({
										origin,
										username,
										password
									});
									setOrigin("");
									setUsername("");
									setPassword("");
								},
								children: "Save"
							})]
						})
					]
				}),
				/* @__PURE__ */ jsx("ul", {
					className: "divide-y divide-border overflow-hidden rounded-xl border border-border",
					children: passwords.length === 0 ? /* @__PURE__ */ jsx("li", {
						className: "px-4 py-8 text-sm text-muted",
						children: "No saved logins."
					}) : passwords.map((p) => /* @__PURE__ */ jsxs("li", {
						className: "flex items-center justify-between px-4 py-3",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
							className: "text-sm",
							children: p.origin
						}), /* @__PURE__ */ jsx("p", {
							className: "text-xs text-muted",
							children: p.username
						})] }), /* @__PURE__ */ jsx(Button, {
							variant: "ghost",
							size: "sm",
							onClick: () => removePassword(p.id),
							children: "Remove"
						})]
					}, p.id))
				})
			]
		})
	});
}
function AboutPage() {
	const fileRef = useRef(null);
	const exportAll = useBrowserStore((s) => s.exportAll);
	const importAll = useBrowserStore((s) => s.importAll);
	const signOut = useBrowserStore((s) => s.signOut);
	const session = useBrowserStore((s) => s.session);
	async function leave() {
		try {
			const { getSupabase } = await import("./supabase-DviS4g_V.js");
			const { stopAccountSync } = await import("./account-sync-Bws_B3pG.js");
			stopAccountSync();
			await getSupabase()?.auth.signOut();
		} catch {}
		signOut();
	}
	return /* @__PURE__ */ jsxs(Block, {
		title: "Hacker114 · Veil",
		desc: "A private window on the open web. Traffic is rewritten through Veil — pages, assets, sockets, and downloads.",
		children: [/* @__PURE__ */ jsxs("ul", {
			className: "space-y-2 text-sm text-muted",
			children: [
				/* @__PURE__ */ jsx("li", { children: "Engines: NGINX, Ultraviolet, Mercury, Scramjet, Rammerhead" }),
				/* @__PURE__ */ jsx("li", { children: "Per-account encrypted cookies in Supabase · guest jars never leave this session" }),
				/* @__PURE__ */ jsx("li", { children: "Ghostery EasyList ad blocker · stealth URL encoding" }),
				/* @__PURE__ */ jsx("li", { children: "Open veil://settings, veil://history, veil://files, veil://shortcuts from the address bar" })
			]
		}), /* @__PURE__ */ jsxs("div", {
			className: "flex flex-wrap gap-2 pt-2",
			children: [
				/* @__PURE__ */ jsx(Button, {
					onClick: () => downloadJson(`veil-export-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`, exportAll()),
					children: "Export data"
				}),
				/* @__PURE__ */ jsx(Button, {
					variant: "secondary",
					onClick: () => fileRef.current?.click(),
					children: "Import"
				}),
				/* @__PURE__ */ jsx(Button, {
					variant: "outline",
					onClick: () => void leave(),
					children: session.kind === "guest" ? "Leave guest session" : "Sign out"
				}),
				/* @__PURE__ */ jsx("input", {
					ref: fileRef,
					type: "file",
					accept: "application/json",
					className: "hidden",
					onChange: async (e) => {
						const file = e.target.files?.[0];
						if (!file) return;
						try {
							const err = importAll(JSON.parse(await file.text()));
							if (err) toast.error(err);
							else toast.success("Imported.");
						} catch {
							toast.error("Invalid file");
						}
						e.target.value = "";
					}
				})
			]
		})]
	});
}
function Empty({ title, body }) {
	return /* @__PURE__ */ jsx("div", {
		className: "grid h-full place-items-center bg-surface px-6 text-center",
		children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
			className: "text-lg font-semibold",
			children: title
		}), /* @__PURE__ */ jsx("p", {
			className: "mt-2 max-w-sm text-sm text-muted",
			children: body
		})] })
	});
}
function Block({ title, desc, children }) {
	return /* @__PURE__ */ jsxs("section", {
		className: "mx-auto max-w-2xl space-y-4",
		children: [/* @__PURE__ */ jsxs("header", { children: [/* @__PURE__ */ jsx("h2", {
			className: "text-lg font-semibold tracking-tight",
			children: title
		}), /* @__PURE__ */ jsx("p", {
			className: "mt-1 text-sm text-muted",
			children: desc
		})] }), children]
	});
}
function Field({ label, children }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-1.5",
		children: [/* @__PURE__ */ jsx(Label, { children: label }), children]
	});
}
function Row({ label, checked, onChange }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-3",
		children: [/* @__PURE__ */ jsx(Label, { children: label }), /* @__PURE__ */ jsx(Switch, {
			checked,
			onCheckedChange: onChange
		})]
	});
}
function AddSearchEngine() {
	const settings = useBrowserStore((s) => s.settings);
	const patchSettings = useBrowserStore((s) => s.patchSettings);
	const [name, setName] = useState("");
	const [url, setUrl] = useState("");
	return /* @__PURE__ */ jsxs("div", {
		className: "grid gap-2 rounded-xl border border-border bg-background p-3 sm:grid-cols-[1fr_1fr_auto]",
		children: [
			/* @__PURE__ */ jsx(Input, {
				placeholder: "Name",
				value: name,
				onChange: (e) => setName(e.target.value)
			}),
			/* @__PURE__ */ jsx(Input, {
				placeholder: "https://example/search?q=%s",
				value: url,
				onChange: (e) => setUrl(e.target.value)
			}),
			/* @__PURE__ */ jsx(Button, {
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
				},
				children: "Add"
			})
		]
	});
}
//#endregion
//#region src/components/browser/devtools.tsx
function DevtoolsDock() {
	const nets = useBrowserStore((s) => s.nets);
	const consoles = useBrowserStore((s) => s.consoles);
	const inspect = useBrowserStore((s) => s.inspect);
	const inspectOn = useBrowserStore((s) => s.inspectOn);
	const pageSource = useBrowserStore((s) => s.pageSource);
	const setInspectOn = useBrowserStore((s) => s.setInspectOn);
	const setDevtoolsOpen = useBrowserStore((s) => s.setDevtoolsOpen);
	const [tab, setTab] = useState("elements");
	const [code, setCode] = useState("");
	const [source, setSource] = useState(pageSource);
	useEffect(() => {
		if (tab === "sources") {
			window.dispatchEvent(new Event("veil:source"));
			const t = window.setTimeout(() => setSource(useBrowserStore.getState().pageSource), 80);
			return () => window.clearTimeout(t);
		}
	}, [tab, pageSource]);
	return /* @__PURE__ */ jsxs("div", {
		className: "flex h-80 flex-col border-t border-border bg-[#202124] text-[#e8eaed]",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex h-10 items-center gap-1 border-b border-white/10 px-2",
				children: [
					[
						"elements",
						"console",
						"network",
						"sources",
						"application"
					].map((t) => /* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => setTab(t),
						className: `h-8 rounded-md px-2.5 text-xs capitalize ${tab === t ? "bg-white/10 font-medium" : "text-[#9aa0a6] hover:bg-white/5"}`,
						children: t
					}, t)),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => setInspectOn(!inspectOn),
						className: `ml-auto h-8 rounded-md px-2.5 text-xs ${inspectOn ? "bg-[#8ab4f8] text-[#202124]" : "text-[#9aa0a6]"}`,
						children: "Inspect"
					}),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						"aria-label": "Close developer tools",
						className: "grid size-8 place-items-center rounded-md hover:bg-white/10",
						onClick: () => {
							setDevtoolsOpen(false);
							setInspectOn(false);
						},
						children: /* @__PURE__ */ jsx(X, { className: "size-4" })
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "min-h-0 flex-1 overflow-auto font-mono text-xs veil-scroll",
				children: [
					tab === "network" ? nets.length ? nets.slice().reverse().map((n) => /* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-[56px_1fr_52px_64px] gap-2 border-b border-white/5 px-3 py-1.5",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "text-[#9aa0a6]",
								children: n.method
							}),
							/* @__PURE__ */ jsx("span", {
								className: "truncate",
								children: n.url
							}),
							/* @__PURE__ */ jsx("span", {
								className: "tabular-nums",
								children: n.status ?? n.phase
							}),
							/* @__PURE__ */ jsx("span", {
								className: "tabular-nums text-[#9aa0a6]",
								children: n.ms ? `${n.ms}ms` : ""
							})
						]
					}, n.id)) : /* @__PURE__ */ jsx("p", {
						className: "p-4 text-[#9aa0a6]",
						children: "No requests yet."
					}) : null,
					tab === "console" ? consoles.length ? consoles.slice().reverse().map((c) => /* @__PURE__ */ jsxs("div", {
						className: "border-b border-white/5 px-3 py-1.5",
						children: [/* @__PURE__ */ jsx("span", {
							className: `mr-2 uppercase ${c.level === "error" ? "text-[#f28b82]" : "text-[#9aa0a6]"}`,
							children: c.level
						}), c.args.join(" ")]
					}, c.id)) : /* @__PURE__ */ jsx("p", {
						className: "p-4 text-[#9aa0a6]",
						children: "Console is empty."
					}) : null,
					tab === "elements" ? /* @__PURE__ */ jsxs("div", {
						className: "p-3",
						children: [/* @__PURE__ */ jsx("p", {
							className: "mb-2 font-sans text-[#9aa0a6]",
							children: inspectOn ? "Click an element in the page." : "Turn on Inspect, or right-click the page and choose Inspect."
						}), inspect ? /* @__PURE__ */ jsxs(Fragment, { children: [
							/* @__PURE__ */ jsx("p", {
								className: "mb-2 text-[#8ab4f8]",
								children: inspect.tag
							}),
							inspect.styles ? /* @__PURE__ */ jsx("pre", {
								className: "mb-2 whitespace-pre-wrap text-[#9aa0a6]",
								children: Object.entries(inspect.styles).map(([k, v]) => `${k}: ${v}`).join("\n")
							}) : null,
							/* @__PURE__ */ jsx("textarea", {
								className: "h-32 w-full rounded-lg border border-white/10 bg-[#2d2e31] p-2",
								defaultValue: inspect.html,
								onBlur: (e) => {
									window.dispatchEvent(new CustomEvent("veil:edit-html", { detail: e.target.value }));
								}
							})
						] }) : null]
					}) : null,
					tab === "sources" ? /* @__PURE__ */ jsxs("div", {
						className: "flex h-full flex-col",
						children: [/* @__PURE__ */ jsx("textarea", {
							className: "min-h-0 flex-1 bg-[#2d2e31] p-3 outline-none",
							value: source || pageSource,
							onChange: (e) => setSource(e.target.value)
						}), /* @__PURE__ */ jsx("div", {
							className: "border-t border-white/10 p-2",
							children: /* @__PURE__ */ jsx("button", {
								type: "button",
								className: "h-8 rounded-md bg-[#8ab4f8] px-3 text-xs text-[#202124]",
								onClick: () => window.dispatchEvent(new CustomEvent("veil:apply-html", { detail: source || pageSource })),
								children: "Apply to page"
							})
						})]
					}) : null,
					tab === "application" ? /* @__PURE__ */ jsxs("div", {
						className: "p-4 font-sans text-sm text-[#9aa0a6]",
						children: [
							/* @__PURE__ */ jsx("p", {
								className: "mb-2",
								children: "Cookies are isolated per Veil account and encrypted at rest in Supabase."
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mb-2",
								children: "Incognito tabs use a private jar and never write history."
							}),
							/* @__PURE__ */ jsx("p", { children: "Open veil://files for the download library. Downloads save inside Veil, not the host browser." })
						]
					}) : null
				]
			}),
			tab === "console" ? /* @__PURE__ */ jsxs("form", {
				className: "flex border-t border-white/10",
				onSubmit: (e) => {
					e.preventDefault();
					window.dispatchEvent(new CustomEvent("veil:eval", { detail: code }));
					setCode("");
				},
				children: [/* @__PURE__ */ jsx("span", {
					className: "grid size-9 place-items-center text-[#9aa0a6]",
					children: "›"
				}), /* @__PURE__ */ jsx("input", {
					value: code,
					onChange: (e) => setCode(e.target.value),
					className: "h-9 flex-1 bg-transparent font-mono text-xs outline-none",
					placeholder: "Evaluate in page"
				})]
			}) : null
		]
	});
}
//#endregion
//#region src/components/browser/context-menu.tsx
function ContextMenu({ x, y, items, onClose }) {
	useEffect(() => {
		const close = () => onClose();
		const onKey = (e) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("mousedown", close);
		window.addEventListener("keydown", onKey);
		return () => {
			window.removeEventListener("mousedown", close);
			window.removeEventListener("keydown", onKey);
		};
	}, [onClose]);
	const left = Math.min(x, (typeof window !== "undefined" ? window.innerWidth : 400) - 240);
	const top = Math.min(y, (typeof window !== "undefined" ? window.innerHeight : 400) - 320);
	return /* @__PURE__ */ jsx("div", {
		className: "fixed z-[80] min-w-52 overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-[var(--shadow-panel)]",
		style: {
			left,
			top
		},
		onMouseDown: (e) => e.stopPropagation(),
		children: items.map((item, i) => item.kind === "sep" ? /* @__PURE__ */ jsx("div", { className: "my-1 h-px bg-border" }, i) : /* @__PURE__ */ jsxs("button", {
			type: "button",
			disabled: item.disabled,
			className: `flex h-9 w-full items-center justify-between gap-6 px-3 text-left text-sm disabled:opacity-40 ${item.danger ? "text-danger" : "hover:bg-surface-2"}`,
			onClick: () => {
				item.onSelect();
				onClose();
			},
			children: [/* @__PURE__ */ jsx("span", { children: item.label }), item.shortcut ? /* @__PURE__ */ jsx("span", {
				className: "text-xs text-muted",
				children: item.shortcut
			}) : null]
		}, i))
	});
}
//#endregion
//#region src/components/browser/shell.tsx
var IFRAME_ALLOW = "accelerometer; autoplay; camera; clipboard-read; clipboard-write; encrypted-media; fullscreen; gamepad; geolocation; gyroscope; microphone; midi; pointer-lock; display-capture; usb; xr-spatial-tracking";
function BrowserShell() {
	const hydrated = useBrowserStore((s) => s.hydrated);
	const session = useBrowserStore((s) => s.session);
	const setHydrated = useBrowserStore((s) => s.setHydrated);
	const setSession = useBrowserStore((s) => s.setSession);
	const settings = useBrowserStore((s) => s.settings);
	useEffect(() => {
		Promise.resolve(useBrowserStore.persist.rehydrate()).then(async () => {
			setHydrated(true);
			const { getSupabase } = await import("./supabase-DviS4g_V.js");
			const sb = getSupabase();
			if (sb) {
				const { data } = await sb.auth.getSession();
				if (data.session?.user) {
					setSession({
						kind: "user",
						userId: data.session.user.id,
						email: data.session.user.email || ""
					});
					startAccountSync(data.session.user.id);
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
		if ("serviceWorker" in navigator) navigator.serviceWorker.register("/veil-sw.js").catch(() => {});
	}, []);
	if (!hydrated) return /* @__PURE__ */ jsx("div", {
		className: "grid min-h-dvh place-items-center bg-background text-sm text-muted",
		children: "Loading Veil…"
	});
	if (session.kind === "none") return /* @__PURE__ */ jsx(LoginScreen, {});
	return /* @__PURE__ */ jsx(Chrome, {});
}
function applyTheme(settings) {
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
function writeCfgCookie(settings) {
	const cfg = {
		adblock: settings.adblock,
		stealth: settings.stealth || settings.fingerprintResist,
		webrtcBlock: settings.webrtcBlock || settings.stealth,
		fingerprintResist: settings.fingerprintResist || settings.stealth,
		engine: settings.engine,
		nginx: settings.nginx
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
	const tab = tabs.find((t) => t.id === activeId) ?? tabs[0];
	const addressRef = useRef(null);
	const frames = useRef({});
	const [menuOpen, setMenuOpen] = useState(false);
	const [tabsOpen, setTabsOpen] = useState(false);
	const [ctx, setCtx] = useState(null);
	const menuRef = useRef(null);
	const guest = session.kind === "guest";
	const go = (raw, opts) => {
		const se = currentSearchEngine(store.getState().settings);
		const url = raw.startsWith("veil:") ? raw : normalizeNavigableUrl(raw, se.url);
		if (!url) return;
		store.getState().navigate(tab.id, url, {
			fromUser: true,
			replace: opts?.replace
		});
	};
	useHotkeys(addressRef, tab);
	useEffect(() => {
		const title = tab.title || "New tab";
		document.title = `${title} · Veil`;
		let link = document.querySelector("link[data-veil-favicon]");
		if (!link) {
			link = document.createElement("link");
			link.rel = "icon";
			link.setAttribute("data-veil-favicon", "1");
			document.head.appendChild(link);
		}
		link.href = tab.favicon || "/favicon.png";
	}, [
		tab.title,
		tab.favicon,
		tab.url
	]);
	useEffect(() => {
		const onMsg = (ev) => {
			const d = ev.data;
			if (!d || d.ns !== "veil") return;
			const st = store.getState();
			const id = d.tabId || st.activeId;
			const current = st.tabs.find((t) => t.id === id);
			if (d.type === "meta" || d.type === "ready" || d.type === "navigate" || d.type === "history") {
				const url = d.url;
				const title = d.title;
				const redirectedFrom = d.redirectedFrom ?? null;
				st.updateTab(id, {
					loading: false,
					...url ? {
						displayUrl: url,
						redirectedFrom
					} : {},
					...title ? { title } : {},
					...d.favicon ? { favicon: String(d.favicon) } : {}
				});
				if (url) {
					if (st.activeId === id) st.setAddressDraft(url);
					if (current && !current.incognito) st.pushHistory(url, title || hostnameOf(url), current.incognito);
				}
			}
			if (d.type === "error") st.updateTab(id, {
				loading: false,
				crash: String(d.message || d.title || "Error")
			});
			if (d.type === "console") st.pushConsole({
				level: d.level,
				args: d.args ?? []
			});
			if (d.type === "net") st.pushNet({
				method: d.method || "GET",
				url: d.url,
				status: d.status,
				ms: d.ms,
				phase: d.phase
			});
			if (d.type === "inspect") {
				st.setInspect(d);
				st.setDevtoolsOpen(true);
			}
			if (d.type === "source") st.setPageSource(String(d.html || ""));
			if (d.type === "open" && d.url) st.newTab(d.url);
			if (d.type === "save-password" && d.origin && d.password && st.session.kind === "user" && !current?.incognito) st.upsertPassword({
				origin: String(d.origin),
				username: String(d.username || ""),
				password: String(d.password)
			});
			if (d.type === "download") handleDownload(d);
			if (d.type === "cookie" && st.session.kind === "user" && !current?.incognito && d.cookie && d.url) persistCookieFromHook(String(d.cookie), String(d.url), st.session.userId);
			if (d.type === "contextmenu") {
				const rect = frames.current[id]?.getBoundingClientRect();
				const x = (rect?.left ?? 0) + Number(d.x || 0);
				const y = (rect?.top ?? 0) + Number(d.y || 0);
				setCtx({
					x,
					y,
					items: pageContextItems(id, () => {
						const src = proxySrcFor(st.tabs.find((t) => t.id === id), st.settings);
						if (src) window.open(src, "_blank", "noopener,noreferrer");
					})
				});
			}
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
		const onSource = () => frames.current[tab.id]?.contentWindow?.postMessage({
			ns: "veil",
			type: "source"
		}, "*");
		const onApply = (e) => {
			const html = e.detail;
			frames.current[tab.id]?.contentWindow?.postMessage({
				ns: "veil",
				type: "apply-html",
				html
			}, "*");
		};
		const onEdit = (e) => {
			const html = e.detail;
			frames.current[tab.id]?.contentWindow?.postMessage({
				ns: "veil",
				type: "edit-html",
				html
			}, "*");
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
	useEffect(() => {
		if (!menuOpen) return;
		const onDoc = (e) => {
			if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
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
	const tabBar = /* @__PURE__ */ jsx(TabBar, {
		tabs,
		activeId: tab.id,
		onNew: () => store.getState().newTab(),
		onClose: (id) => store.getState().closeTab(id),
		onActivate: (id) => store.getState().activate(id),
		onContext: (e, t) => {
			e.preventDefault();
			setCtx({
				x: e.clientX,
				y: e.clientY,
				items: [
					{
						kind: "item",
						label: "New tab",
						onSelect: () => store.getState().newTab()
					},
					{
						kind: "item",
						label: "New incognito tab",
						onSelect: () => store.getState().newTab("veil://newtab", { incognito: true })
					},
					{
						kind: "item",
						label: "Duplicate",
						onSelect: () => store.getState().duplicateTab(t.id)
					},
					{ kind: "sep" },
					{
						kind: "item",
						label: "Reload",
						onSelect: () => store.getState().reload(t.id)
					},
					{
						kind: "item",
						label: t.pointerLock ? "Disable cursor lock" : "Enable cursor lock",
						onSelect: () => store.getState().updateTab(t.id, { pointerLock: !t.pointerLock })
					},
					{
						kind: "item",
						label: "Close",
						onSelect: () => store.getState().closeTab(t.id)
					},
					{
						kind: "item",
						label: "Close others",
						onSelect: () => tabs.filter((x) => x.id !== t.id).forEach((x) => store.getState().closeTab(x.id))
					},
					{ kind: "sep" },
					{
						kind: "item",
						label: settings.layout.tabPosition === "top" ? "Move tab bar to bottom" : "Move tab bar to top",
						onSelect: () => store.getState().setLayout({ tabPosition: settings.layout.tabPosition === "top" ? "bottom" : "top" })
					}
				]
			});
		}
	});
	const menuItems = [
		["New tab", () => store.getState().newTab()],
		["New incognito tab", () => store.getState().newTab("veil://newtab", { incognito: true })],
		["Settings", () => store.getState().newTab("veil://settings")],
		...guest ? [] : [
			["History", () => store.getState().newTab("veil://history")],
			["Downloads", () => store.getState().newTab("veil://downloads")],
			["Files", () => store.getState().newTab("veil://files")],
			["Bookmarks", () => store.getState().newTab("veil://bookmarks")]
		],
		["Keyboard shortcuts", () => store.getState().newTab("veil://shortcuts")],
		["Developer tools", () => store.getState().setDevtoolsOpen(!devtoolsOpen)],
		["Zoom in", () => store.getState().setZoom(tab.id, tab.zoom + .1)],
		["Zoom out", () => store.getState().setZoom(tab.id, tab.zoom - .1)]
	];
	return /* @__PURE__ */ jsxs("div", {
		className: cn("veil-chrome flex h-dvh min-h-0 flex-col bg-background text-foreground", tab.incognito && "veil-incognito"),
		"data-density": settings.theme.density,
		"data-incognito": tab.incognito ? "1" : "0",
		children: [
			/* @__PURE__ */ jsx(Toaster, {
				theme: settings.theme.mode === "light" && !tab.incognito ? "light" : "dark",
				position: "bottom-right"
			}),
			settings.layout.tabPosition === "top" ? tabBar : null,
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-1 border-b border-border bg-surface px-2",
				style: { height: "var(--nav-h)" },
				onContextMenu: (e) => {
					e.preventDefault();
					setCtx({
						x: e.clientX,
						y: e.clientY,
						items: [
							{
								kind: "item",
								label: settings.layout.bookmarkBar ? "Hide bookmarks bar" : "Show bookmarks bar",
								onSelect: () => store.getState().setLayout({ bookmarkBar: !settings.layout.bookmarkBar })
							},
							{
								kind: "item",
								label: settings.layout.statusBar ? "Hide status bar" : "Show status bar",
								onSelect: () => store.getState().setLayout({ statusBar: !settings.layout.statusBar })
							},
							{
								kind: "item",
								label: settings.layout.tabPosition === "top" ? "Move tab bar to bottom" : "Move tab bar to top",
								onSelect: () => store.getState().setLayout({ tabPosition: settings.layout.tabPosition === "top" ? "bottom" : "top" })
							},
							{
								kind: "item",
								label: settings.theme.density === "comfortable" ? "Use compact density" : "Use comfortable density",
								onSelect: () => store.getState().setTheme({ density: settings.theme.density === "comfortable" ? "compact" : "comfortable" })
							},
							{ kind: "sep" },
							{
								kind: "item",
								label: "Settings",
								onSelect: () => store.getState().newTab("veil://settings")
							}
						]
					});
				},
				children: [
					/* @__PURE__ */ jsx(IconBtn, {
						label: "Back",
						disabled: tab.stackIndex <= 0,
						onClick: () => store.getState().back(tab.id),
						children: /* @__PURE__ */ jsx(ArrowLeft, {})
					}),
					/* @__PURE__ */ jsx(IconBtn, {
						label: "Forward",
						disabled: tab.stackIndex >= tab.stack.length - 1,
						onClick: () => store.getState().forward(tab.id),
						children: /* @__PURE__ */ jsx(ArrowRight, {})
					}),
					tab.loading ? /* @__PURE__ */ jsx(IconBtn, {
						label: "Stop",
						onClick: () => store.getState().stop(tab.id),
						children: /* @__PURE__ */ jsx(Square, { className: "size-3.5 fill-current" })
					}) : /* @__PURE__ */ jsx(IconBtn, {
						label: "Reload",
						onClick: () => store.getState().reload(tab.id),
						children: /* @__PURE__ */ jsx(RotateCw, {})
					}),
					/* @__PURE__ */ jsx(IconBtn, {
						label: "Home",
						onClick: () => {
							if (settings.homeUrl) go(settings.homeUrl);
							else store.getState().navigate(tab.id, "veil://newtab", { fromUser: true });
						},
						children: /* @__PURE__ */ jsx(Home$1, {})
					}),
					/* @__PURE__ */ jsxs("form", {
						className: "veil-omnibox mx-2 flex min-w-0 flex-1 items-center gap-2 px-3",
						onSubmit: (e) => {
							e.preventDefault();
							go(addressDraft);
						},
						children: [
							settings.stealth ? /* @__PURE__ */ jsx(Shield, { className: "size-3.5 shrink-0 text-ok" }) : /* @__PURE__ */ jsx(ShieldOff, { className: "size-3.5 shrink-0 text-muted" }),
							/* @__PURE__ */ jsx("input", {
								ref: addressRef,
								value: addressDraft,
								onChange: (e) => store.getState().setAddressDraft(e.target.value),
								onFocus: (e) => e.currentTarget.select(),
								spellCheck: false,
								placeholder: "Search or enter address",
								className: "min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted",
								"aria-label": "Address"
							}),
							tab.redirectedFrom ? /* @__PURE__ */ jsxs("span", {
								className: "hidden max-w-[36%] truncate text-xs text-muted sm:inline",
								children: ["from ", tab.redirectedFrom]
							}) : null,
							!guest ? /* @__PURE__ */ jsx("button", {
								type: "button",
								className: cn("grid size-8 place-items-center rounded-full", bookmarked ? "text-warn" : "text-muted"),
								"aria-label": "Bookmark",
								onClick: () => {
									if (!tab.displayUrl && !tab.url) return;
									if (isInternalUrl(tab.url)) return;
									if (bookmarked) {
										const b = bookmarks.find((x) => x.url === tab.displayUrl || x.url === tab.url);
										if (b) store.getState().removeBookmark(b.id);
									} else {
										store.getState().addBookmark({
											title: tab.title,
											url: tab.displayUrl || tab.url
										});
										toast.success("Bookmark added");
									}
								},
								children: /* @__PURE__ */ jsx(Star, { className: cn("size-3.5", bookmarked && "fill-current") })
							}) : null
						]
					}),
					/* @__PURE__ */ jsx(IconBtn, {
						label: "Open proxy fullscreen",
						onClick: openFullscreen,
						disabled: internal,
						children: /* @__PURE__ */ jsx(Expand, {})
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "relative",
						ref: menuRef,
						children: [/* @__PURE__ */ jsx(IconBtn, {
							label: "Menu",
							onClick: () => setMenuOpen((v) => !v),
							children: /* @__PURE__ */ jsx(Ellipsis, {})
						}), menuOpen ? /* @__PURE__ */ jsx("div", {
							className: "absolute right-0 top-[calc(100%+6px)] z-40 w-56 overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-[var(--shadow-panel)]",
							children: menuItems.map(([label, fn]) => /* @__PURE__ */ jsx("button", {
								type: "button",
								className: "flex h-10 w-full items-center px-3 text-left text-sm hover:bg-surface-2",
								onClick: () => {
									fn();
									setMenuOpen(false);
								},
								children: label
							}, label))
						}) : null]
					})
				]
			}),
			settings.layout.bookmarkBar && bookmarks.length ? /* @__PURE__ */ jsx("div", {
				className: "flex h-10 items-center gap-1 overflow-x-auto border-b border-border bg-surface px-2 veil-scroll",
				onContextMenu: (e) => {
					e.preventDefault();
					setCtx({
						x: e.clientX,
						y: e.clientY,
						items: [{
							kind: "item",
							label: "Hide bookmarks bar",
							onSelect: () => store.getState().setLayout({ bookmarkBar: false })
						}]
					});
				},
				children: bookmarks.map((b) => /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: () => go(b.url),
					onContextMenu: (e) => {
						e.preventDefault();
						e.stopPropagation();
						setCtx({
							x: e.clientX,
							y: e.clientY,
							items: [
								{
									kind: "item",
									label: "Open",
									onSelect: () => go(b.url)
								},
								{
									kind: "item",
									label: "Open in new tab",
									onSelect: () => store.getState().newTab(b.url)
								},
								{
									kind: "item",
									label: "Remove",
									danger: true,
									onSelect: () => store.getState().removeBookmark(b.id)
								}
							]
						});
					},
					className: "h-8 shrink-0 rounded-md px-2.5 text-sm text-muted hover:bg-surface-2 hover:text-foreground",
					children: b.title
				}, b.id))
			}) : null,
			/* @__PURE__ */ jsx("div", {
				className: "relative h-0.5 bg-border",
				children: tab.loading ? /* @__PURE__ */ jsx("div", { className: "veil-loading-bar absolute inset-0" }) : null
			}),
			/* @__PURE__ */ jsx("div", {
				className: "relative flex min-h-0 flex-1 bg-surface",
				children: /* @__PURE__ */ jsxs("div", {
					className: "relative min-h-0 min-w-0 flex-1",
					children: [
						tabs.map((t) => {
							const src = proxySrcFor(t, settings);
							const on = t.id === tab.id;
							const tInternal = isInternalUrl(t.url);
							return /* @__PURE__ */ jsx("div", {
								className: cn("absolute inset-0", on ? "z-10" : "pointer-events-none invisible"),
								"aria-hidden": !on,
								children: tInternal || !t.url ? on ? /* @__PURE__ */ jsx(InternalPage, {
									url: t.url || "veil://newtab",
									onGo: (url) => store.getState().navigate(t.id, url, { fromUser: true })
								}) : null : src ? /* @__PURE__ */ jsx(TabFrame, {
									tab: t,
									src,
									active: on,
									onBind: (el) => {
										frames.current[t.id] = el;
									},
									engineKey: `${t.frameKey}-${settings.engine}-${settings.stealth ? "s" : "c"}`
								}) : on ? /* @__PURE__ */ jsx(InternalPage, {
									url: "veil://newtab",
									onGo: (url) => store.getState().navigate(t.id, url, { fromUser: true })
								}) : null
							}, t.id);
						}),
						tab.crash ? /* @__PURE__ */ jsx("div", {
							className: "pointer-events-none absolute inset-x-0 top-3 z-20 flex justify-center",
							children: /* @__PURE__ */ jsx("div", {
								className: "pointer-events-auto rounded-lg border border-border bg-surface px-3 py-2 text-sm text-danger shadow-[var(--shadow-panel)]",
								children: tab.crash
							})
						}) : null,
						tabsOpen ? /* @__PURE__ */ jsx(TabSwitcher, {
							tabs,
							activeId: tab.id,
							onActivate: (id) => {
								store.getState().activate(id);
								setTabsOpen(false);
							},
							onClose: (id) => store.getState().closeTab(id),
							onDismiss: () => setTabsOpen(false)
						}) : null
					]
				})
			}),
			devtoolsOpen ? /* @__PURE__ */ jsx(DevtoolsDock, {}) : null,
			settings.layout.tabPosition === "bottom" ? tabBar : null,
			settings.layout.statusBar ? /* @__PURE__ */ jsxs("footer", {
				className: "hidden h-8 items-center justify-between gap-3 border-t border-border bg-surface px-3 text-xs text-muted sm:flex",
				children: [/* @__PURE__ */ jsxs("span", {
					className: "truncate",
					children: [
						tab.incognito ? "Incognito · " : "",
						guest ? "Guest · " : "",
						tab.displayUrl || tab.url || "New tab",
						" · ",
						settings.engine,
						settings.stealth ? " · stealth" : ""
					]
				}), /* @__PURE__ */ jsxs("span", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ jsxs("span", { children: [Math.round(tab.zoom * 100), "%"] }), settings.adblock ? /* @__PURE__ */ jsx("span", { children: "blocker on" }) : null]
				})]
			}) : null,
			/* @__PURE__ */ jsx(MobileDock, {
				tabCount: tabs.length,
				guest,
				onTabs: () => setTabsOpen(true),
				onNew: () => store.getState().newTab(),
				onSettings: () => store.getState().newTab("veil://settings")
			}),
			ctx ? /* @__PURE__ */ jsx(ContextMenu, {
				x: ctx.x,
				y: ctx.y,
				items: ctx.items,
				onClose: () => setCtx(null)
			}) : null
		]
	});
}
function proxySrcFor(t, settings) {
	if (!t?.url || isInternalUrl(t.url)) return null;
	try {
		const tabKey = t.incognito ? `priv-${t.id}` : t.id;
		return encodeProxyPath(settings.engine, tabKey, t.url, settings.stealth);
	} catch {
		return null;
	}
}
function pageContextItems(tabId, openFullscreen) {
	const st = useBrowserStore.getState();
	const t = st.tabs.find((x) => x.id === tabId);
	return [
		{
			kind: "item",
			label: "Back",
			disabled: !t || t.stackIndex <= 0,
			onSelect: () => st.back(tabId)
		},
		{
			kind: "item",
			label: "Forward",
			disabled: !t || t.stackIndex >= (t?.stack.length ?? 0) - 1,
			onSelect: () => st.forward(tabId)
		},
		{
			kind: "item",
			label: "Reload",
			onSelect: () => st.reload(tabId)
		},
		{ kind: "sep" },
		{
			kind: "item",
			label: "Inspect",
			onSelect: () => {
				st.setDevtoolsOpen(true);
				st.setInspectOn(true);
			}
		},
		{
			kind: "item",
			label: "View page source",
			onSelect: () => {
				st.setDevtoolsOpen(true);
				window.dispatchEvent(new Event("veil:source"));
			}
		},
		{
			kind: "item",
			label: "Open proxy fullscreen",
			onSelect: openFullscreen
		}
	];
}
function TabFrame({ tab, src, active, onBind, engineKey }) {
	const [committed, setCommitted] = useState(src);
	const [pending, setPending] = useState(null);
	const [showCover, setShowCover] = useState(true);
	const liveRef = useRef(null);
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
	}, [
		onBind,
		committed,
		pending,
		active
	]);
	const bindLive = (el) => {
		liveRef.current = el;
		onBind(el);
	};
	const allow = tab.pointerLock ? IFRAME_ALLOW : IFRAME_ALLOW.replace("pointer-lock; ", "");
	return /* @__PURE__ */ jsxs("div", {
		className: "absolute inset-0 bg-surface",
		children: [
			committed ? /* @__PURE__ */ jsx("iframe", {
				ref: pending ? void 0 : bindLive,
				title: tab.title,
				src: committed,
				allow,
				allowFullScreen: true,
				className: "h-full w-full border-0 bg-surface",
				style: {
					transform: tab.zoom === 1 ? void 0 : `scale(${tab.zoom})`,
					transformOrigin: "0 0"
				},
				onLoad: () => {
					if (!pending) {
						setShowCover(false);
						useBrowserStore.getState().updateTab(tab.id, { loading: false });
					}
				}
			}) : null,
			pending ? /* @__PURE__ */ jsx("iframe", {
				ref: bindLive,
				title: tab.title,
				src: pending,
				allow,
				allowFullScreen: true,
				className: "absolute inset-0 h-full w-full border-0 bg-surface opacity-0",
				style: {
					transform: tab.zoom === 1 ? void 0 : `scale(${tab.zoom})`,
					transformOrigin: "0 0"
				},
				onLoad: (e) => {
					e.currentTarget.style.opacity = "1";
					setCommitted(pending);
					setPending(null);
					setShowCover(false);
					useBrowserStore.getState().updateTab(tab.id, { loading: false });
				}
			}) : null,
			showCover && tab.loading ? /* @__PURE__ */ jsx("div", {
				className: "pointer-events-none absolute inset-0 bg-surface",
				"aria-hidden": true
			}) : null
		]
	});
}
function TabBar({ tabs, activeId, onNew, onClose, onActivate, onContext }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex items-end gap-1 overflow-x-auto bg-background px-2 pt-2 veil-scroll",
		onContextMenu: (e) => {
			const t = tabs.find((x) => x.id === activeId);
			if (t) onContext(e, t);
		},
		children: [tabs.map((t) => {
			const on = t.id === activeId;
			return /* @__PURE__ */ jsxs("div", {
				onContextMenu: (e) => onContext(e, t),
				className: cn("veil-tab group flex shrink-0 items-center gap-2 rounded-t-lg px-3 text-sm", on ? "bg-surface text-foreground shadow-[0_-1px_0_var(--veil-border)]" : "text-muted hover:bg-surface/70", t.incognito && "italic"),
				children: [
					t.favicon ? /* @__PURE__ */ jsx("img", {
						src: t.favicon,
						alt: "",
						className: "size-4 rounded-sm",
						onError: (e) => {
							e.currentTarget.style.display = "none";
						}
					}) : /* @__PURE__ */ jsx("span", {
						className: "grid size-4 place-items-center rounded-sm bg-surface-2 text-[9px] font-semibold",
						children: (t.title || "N").slice(0, 1)
					}),
					t.loading ? /* @__PURE__ */ jsx("span", { className: "size-1.5 animate-pulse rounded-full bg-ring" }) : null,
					/* @__PURE__ */ jsx("button", {
						type: "button",
						className: "min-w-0 flex-1 truncate text-left",
						onClick: () => onActivate(t.id),
						children: t.title || "New tab"
					}),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						"aria-label": `Close ${t.title}`,
						className: "grid size-7 place-items-center rounded-md opacity-70 hover:bg-surface-2",
						onClick: () => onClose(t.id),
						children: /* @__PURE__ */ jsx(X, { className: "size-3.5" })
					})
				]
			}, t.id);
		}), /* @__PURE__ */ jsx("button", {
			type: "button",
			"aria-label": "New tab",
			onClick: onNew,
			className: "mb-1 grid size-9 shrink-0 place-items-center rounded-md text-muted hover:bg-surface-2 hover:text-foreground",
			children: /* @__PURE__ */ jsx(Plus, { className: "size-4" })
		})]
	});
}
function TabSwitcher({ tabs, activeId, onActivate, onClose, onDismiss }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "absolute inset-0 z-40 flex flex-col bg-background/95 p-4 sm:hidden",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "mb-3 flex items-center justify-between",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "text-sm font-medium",
				children: "Tabs"
			}), /* @__PURE__ */ jsx("button", {
				type: "button",
				className: "grid size-11 place-items-center rounded-md hover:bg-surface-2",
				onClick: onDismiss,
				"aria-label": "Close tabs",
				children: /* @__PURE__ */ jsx(X, { className: "size-4" })
			})]
		}), /* @__PURE__ */ jsx("ul", {
			className: "min-h-0 flex-1 space-y-2 overflow-auto veil-scroll",
			children: tabs.map((t) => /* @__PURE__ */ jsxs("li", {
				className: cn("flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-3", t.id === activeId && "border-ring"),
				children: [/* @__PURE__ */ jsx("button", {
					type: "button",
					className: "min-w-0 flex-1 truncate text-left text-sm",
					onClick: () => onActivate(t.id),
					children: t.title || "New tab"
				}), /* @__PURE__ */ jsx("button", {
					type: "button",
					"aria-label": `Close ${t.title}`,
					className: "grid size-10 place-items-center rounded-md hover:bg-surface-2",
					onClick: () => onClose(t.id),
					children: /* @__PURE__ */ jsx(X, { className: "size-4" })
				})]
			}, t.id))
		})]
	});
}
function IconBtn({ children, label, onClick, disabled }) {
	return /* @__PURE__ */ jsx("button", {
		type: "button",
		"aria-label": label,
		title: label,
		disabled,
		onClick,
		className: "grid size-10 shrink-0 place-items-center rounded-lg text-foreground hover:bg-surface-2 disabled:opacity-30 [&_svg]:size-4",
		children
	});
}
function MobileDock({ tabCount, guest, onTabs, onNew, onSettings }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex h-12 items-center justify-around border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] sm:hidden",
		children: [
			/* @__PURE__ */ jsx("button", {
				type: "button",
				className: "grid size-11 place-items-center",
				"aria-label": "Back",
				onClick: () => {
					const s = useBrowserStore.getState();
					s.back(s.activeId);
				},
				children: /* @__PURE__ */ jsx(ArrowLeft, { className: "size-5" })
			}),
			/* @__PURE__ */ jsx("button", {
				type: "button",
				className: "grid size-11 place-items-center",
				"aria-label": "Tabs",
				onClick: onTabs,
				children: /* @__PURE__ */ jsx("span", {
					className: "grid size-6 place-items-center rounded-md border border-border text-xs tabular-nums",
					children: tabCount
				})
			}),
			/* @__PURE__ */ jsx("button", {
				type: "button",
				className: "grid size-11 place-items-center",
				"aria-label": "New tab",
				onClick: onNew,
				children: /* @__PURE__ */ jsx(Plus, { className: "size-5" })
			}),
			!guest ? /* @__PURE__ */ jsx("button", {
				type: "button",
				className: "grid size-11 place-items-center",
				"aria-label": "Downloads",
				onClick: () => useBrowserStore.getState().newTab("veil://downloads"),
				children: /* @__PURE__ */ jsx(Download, { className: "size-5" })
			}) : null,
			/* @__PURE__ */ jsx("button", {
				type: "button",
				className: "grid size-11 place-items-center",
				"aria-label": "Settings",
				onClick: onSettings,
				children: /* @__PURE__ */ jsx(Settings, { className: "size-5" })
			})
		]
	});
}
function useHotkeys(addressRef, tab) {
	useEffect(() => {
		const onKey = (e) => {
			const s = useBrowserStore.getState();
			const id = s.activeId;
			const prevent = () => {
				e.preventDefault();
				e.stopPropagation();
			};
			for (const binding of s.settings.shortcuts) {
				if (!eventMatchesCombo(e, binding.combo)) continue;
				prevent();
				switch (binding.action) {
					case "newTab":
						s.newTab();
						break;
					case "closeTab":
						s.closeTab(id);
						break;
					case "reopenTab":
						s.restoreTab();
						break;
					case "focusAddress":
						addressRef.current?.focus();
						addressRef.current?.select();
						break;
					case "reload":
						s.reload(id);
						break;
					case "back":
						s.back(id);
						break;
					case "forward":
						s.forward(id);
						break;
					case "devtools":
						s.setDevtoolsOpen(!s.devtoolsOpen);
						break;
					case "history":
						s.newTab("veil://history");
						break;
					case "downloads":
						s.newTab("veil://downloads");
						break;
					case "settings":
						s.newTab("veil://settings");
						break;
					case "stealth":
						if (s.settings.stealth) s.patchSettings({ stealth: false });
						else s.applyStealth();
						break;
					case "incognito":
						s.newTab("veil://newtab", { incognito: true });
						break;
					case "nextTab":
						s.cycleTab(1);
						break;
					case "prevTab":
						s.cycleTab(-1);
						break;
					case "fullscreenProxy": {
						const t = s.tabs.find((x) => x.id === id);
						if (!t?.url || isInternalUrl(t.url)) break;
						try {
							window.open(encodeProxyPath(s.settings.engine, t.incognito ? `priv-${t.id}` : t.id, t.displayUrl || t.url, s.settings.stealth), "_blank");
						} catch {}
						break;
					}
				}
				return;
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [addressRef, tab.id]);
}
async function handleDownload(d) {
	const st = useBrowserStore.getState();
	const filename = d.filename || "download";
	const id = st.addDownload({
		filename,
		url: d.url || d.href || "",
		mime: d.mime || "application/octet-stream",
		size: d.size || 0,
		status: "saving"
	});
	const target = d.href || d.url;
	if (!target) return;
	try {
		const blob = await (await fetch(target)).blob();
		const href = URL.createObjectURL(blob);
		st.updateDownload(id, {
			status: "done",
			href,
			size: blob.size
		});
		const fsId = st.addFile({
			parentId: "folder_downloads",
			name: filename,
			kind: "file",
			mime: blob.type,
			size: blob.size,
			href,
			sourceUrl: target
		});
		st.updateDownload(id, { fsId });
		if (st.session.kind === "user") uploadToBucket(st.session.userId, filename, blob);
		toast.success(`Saved ${filename} in Veil`);
	} catch {
		st.updateDownload(id, { status: "error" });
		toast.error("Download failed");
	}
}
async function uploadToBucket(userId, filename, blob) {
	const { getSupabase } = await import("./supabase-DviS4g_V.js");
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
		storage_path: path
	});
}
async function persistCookieFromHook(raw, url, userId) {
	try {
		const host = new URL(url).hostname;
		const first = raw.split(";")[0] ?? "";
		const eq = first.indexOf("=");
		if (eq < 0) return;
		await persistCookieRow(userId, {
			domain: host,
			name: first.slice(0, eq).trim(),
			path: "/",
			value: first.slice(eq + 1).trim()
		});
	} catch {}
}
//#endregion
//#region src/routes/index.tsx?tsr-split=component
var routes_exports = /* @__PURE__ */ __exportAll({ component: () => Home });
function Home() {
	return /* @__PURE__ */ jsx(BrowserShell, {});
}
//#endregion
export { stopAccountSync as a, getSupabaseConfig as c, Home as component, startAccountSync as i, isSupabaseConfigured as l, hydrateCookieJar as n, encryptionSecret as o, persistCookieRow as r, getSupabase as s, routes_exports as t };
