import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { _ as createFileRoute, d as Scripts, f as HeadContent, g as lazyRouteComponent, h as Outlet, m as createRouter, v as createRootRoute, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as TriangleAlert } from "../_libs/lucide-react.mjs";
import { a as union, i as string, n as number, r as object, t as literal } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-Fv5TB1wU.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var styles_default = "/assets/styles-Bf6rRdtr.css";
var APP_NAME = "Veil";
var THEME_BOOT = `(function(){try{var raw=localStorage.getItem('veil-browser');if(!raw)return;var s=JSON.parse(raw).state;if(!s)return;var theme=s.settings&&s.settings.theme;var mode=theme&&theme.mode;var light=false;if(mode==='light')light=true;else if(mode==='system'&&window.matchMedia('(prefers-color-scheme: light)').matches)light=true;if(light)document.documentElement.dataset.theme='light';if(theme){if(theme.bg)document.documentElement.style.setProperty('--veil-bg',theme.bg);if(theme.fg)document.documentElement.style.setProperty('--veil-fg',theme.fg);if(theme.accent)document.documentElement.style.setProperty('--veil-accent',theme.accent);if(theme.font)document.documentElement.style.setProperty('--veil-font',theme.font);if(theme.mono)document.documentElement.style.setProperty('--veil-mono',theme.mono);if(typeof theme.radius==='number')document.documentElement.style.setProperty('--veil-radius',theme.radius+'px');}if(s.settings&&s.settings.lockEnabled)document.documentElement.dataset.locked='1';}catch(e){}})();`;
var Route$4 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, viewport-fit=cover"
			},
			{ title: APP_NAME },
			{
				name: "theme-color",
				content: "#0b0c0e"
			},
			{
				name: "description",
				content: "Veil is a private window on the web — a fully customizable browser-in-browser proxy."
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/icon-192.png"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Outfit:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,500;1,6..72,500&display=swap"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		suppressHydrationWarning: true,
		className: "antialiased",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", { dangerouslySetInnerHTML: { __html: THEME_BOOT } }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	})
});
var $$splitComponentImporter = () => import("./routes-OeGGUTed.mjs");
var Route$3 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var TARGETS = [
	{
		id: "example",
		name: "example.com",
		url: "https://example.com/"
	},
	{
		id: "cloudflare",
		name: "cloudflare.com",
		url: "https://www.cloudflare.com/cdn-cgi/trace"
	},
	{
		id: "brave",
		name: "search.brave.com",
		url: "https://search.brave.com/"
	},
	{
		id: "wikipedia",
		name: "wikipedia.org",
		url: "https://www.wikipedia.org/"
	}
];
async function ping(url) {
	const t0 = Date.now();
	try {
		const res = await fetch(url, {
			method: "GET",
			redirect: "follow",
			signal: AbortSignal.timeout(8e3),
			headers: {
				"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
				accept: "*/*"
			}
		});
		const buf = await res.arrayBuffer();
		return {
			ok: res.ok,
			ms: Date.now() - t0,
			status: res.status,
			bytes: buf.byteLength
		};
	} catch (err) {
		return {
			ok: false,
			ms: Date.now() - t0,
			status: 0,
			bytes: 0,
			error: err instanceof Error ? err.message : "failed"
		};
	}
}
var Route$2 = createFileRoute("/api/speed")({ server: { handlers: { GET: async () => {
	const results = await Promise.all(TARGETS.map(async (t) => ({
		...t,
		...await ping(t.url)
	})));
	const ok = results.filter((r) => r.ok);
	const avg = ok.length ? Math.round(ok.reduce((a, r) => a + r.ms, 0) / ok.length) : null;
	return Response.json({
		at: Date.now(),
		avg,
		results
	});
} } } });
var Route$1 = createFileRoute("/api/ws")({ server: { handlers: { GET: async () => new Response("WebSocket upgrade required", {
	status: 426,
	headers: { "content-type": "text/plain; charset=utf-8" }
}) } } });
/** Compact built-in list (EasyList-inspired). Disabled unless the user turns blocking on. */
var BUILTIN_NETWORK_FILTERS = [
	"||doubleclick.net^",
	"||googlesyndication.com^",
	"||googleadservices.com^",
	"||googletagservices.com^",
	"||googletagmanager.com^",
	"||google-analytics.com^",
	"||adservice.google.com^",
	"||pagead2.googlesyndication.com^",
	"||adsystem.com^",
	"||amazon-adsystem.com^",
	"||adnxs.com^",
	"||adsrvr.org^",
	"||adform.net^",
	"||advertising.com^",
	"||adsafeprotected.com^",
	"||ads-twitter.com^",
	"||ads.linkedin.com^",
	"||ads.yahoo.com^",
	"||ads.facebook.com^",
	"||creative.ak.fbcdn.net^",
	"||criteo.com^",
	"||criteo.net^",
	"||taboola.com^",
	"||outbrain.com^",
	"||scorecardresearch.com^",
	"||quantserve.com^",
	"||hotjar.com^",
	"||hotjar.io^",
	"||mouseflow.com^",
	"||fullstory.com^",
	"||mixpanel.com^",
	"||segment.io^",
	"||segment.com^",
	"||newrelic.com^",
	"||nr-data.net^",
	"||sentry.io^",
	"||facebook.net^",
	"||connect.facebook.net^",
	"||pixel.facebook.com^",
	"||an.facebook.com^",
	"||tr.snapchat.com^",
	"||sc-static.net^",
	"||ads.pinterest.com^",
	"||log.pinterest.com^",
	"||analytics.tiktok.com^",
	"||ads.tiktok.com^",
	"||ad.doubleclick.net^",
	"||static.ads-twitter.com^",
	"||tpc.googlesyndication.com^",
	"||partner.googleadservices.com^",
	"||pagead.l.doubleclick.net^",
	"||securepubads.g.doubleclick.net^",
	"||moatads.com^",
	"||openx.net^",
	"||pubmatic.com^",
	"||rubiconproject.com^",
	"||casalemedia.com^",
	"||contextweb.com^",
	"||bidswitch.net^",
	"||smartadserver.com^",
	"||serving-sys.com^",
	"||2mdn.net^",
	"||adroll.com^",
	"||adgrx.com^",
	"||bluekai.com^",
	"||exelator.com^",
	"||krxd.net^",
	"||rlcdn.com^",
	"||tapad.com^",
	"||agkn.com^",
	"||demdex.net^",
	"||omtrdc.net^",
	"||everesttech.net^",
	"||ads.reddit.com^",
	"||alb.reddit.com^",
	"||carbonads.net^",
	"||carbonads.com^",
	"||buysellads.com^",
	"||servedby-buysellads.com^",
	"||popads.net^",
	"||popcash.net^",
	"||propellerads.com^",
	"||adsterra.com^",
	"||exoclick.com^",
	"||juicyads.com^",
	"||trafficjunky.net^",
	"||adcash.com^",
	"||adblade.com^",
	"||adcolony.com^",
	"||applovin.com^",
	"||unityads.unity3d.com^",
	"||chartbeat.com^",
	"||chartbeat.net^",
	"||parse.ly^",
	"||parsely.com^",
	"||optimizely.com^",
	"||crazyegg.com^",
	"||clicktale.net^",
	"||inspectlet.com^",
	"||luckyorange.com^",
	"||yandex.ru/ads^",
	"||mc.yandex.ru^",
	"||aniview.com^",
	"||spotxchange.com^",
	"||teads.tv^",
	"||yieldmo.com^",
	"||media.net^",
	"||indexww.com^",
	"||sovrn.com^",
	"||lijit.com^",
	"/ads/",
	"/ad-server/",
	"/adserver/",
	"/adservice",
	"/advertisement",
	"/pagead/",
	"/pagead2/",
	"/sponsor/",
	"adsystem",
	"adservice",
	"doubleclick",
	"googlesyndication",
	"popunder",
	"pop-under"
];
var BUILTIN_COSMETIC = [
	"#ad",
	"#ads",
	"#advert",
	"#advertisement",
	".ad",
	".ads",
	".adsbox",
	".ad-banner",
	".ad-container",
	".ad-slot",
	".adslot",
	".advert",
	".advertisement",
	".sponsored",
	".sponsor",
	"[id*='google_ads']",
	"[id*='div-gpt-ad']",
	"[class*='google-ad']",
	"iframe[src*='doubleclick']",
	"iframe[src*='googlesyndication']",
	"ins.adsbygoogle"
];
function compileFilters(rules) {
	const hosts = /* @__PURE__ */ new Set();
	const hostSuffixes = [];
	const pathIncludes = [];
	for (const raw of rules) {
		const rule = raw.trim();
		if (!rule || rule.startsWith("!") || rule.startsWith("[")) continue;
		if (rule.startsWith("||") && rule.endsWith("^")) {
			const host = rule.slice(2, -1).toLowerCase();
			hosts.add(host);
			hostSuffixes.push("." + host);
			continue;
		}
		if (rule.startsWith("||")) {
			const host = rule.slice(2).replace(/\^$/, "").toLowerCase();
			hosts.add(host);
			continue;
		}
		pathIncludes.push(rule.toLowerCase());
	}
	return {
		hosts,
		hostSuffixes,
		pathIncludes
	};
}
function matchesNetworkFilter(url, compiled) {
	const host = url.hostname.toLowerCase();
	if (compiled.hosts.has(host)) return true;
	for (const suf of compiled.hostSuffixes) if (host.endsWith(suf)) return true;
	const hay = (host + url.pathname + url.search).toLowerCase();
	for (const p of compiled.pathIncludes) if (p && hay.includes(p.replace(/^\//, ""))) {
		if (p.startsWith("/") && url.pathname.toLowerCase().includes(p.toLowerCase())) return true;
		if (!p.startsWith("/") && hay.includes(p)) return true;
	}
	return false;
}
var ENGINES = {
	nginx: {
		id: "nginx",
		code: "n",
		name: "NGINX",
		tagline: "Reverse proxy",
		description: "Path-style reverse proxy with an NGINX-inspired header and SSL config layer. Default engine."
	},
	ultraviolet: {
		id: "ultraviolet",
		code: "u",
		name: "Ultraviolet",
		tagline: "XOR codec",
		description: "Titanium-style encoded URLs, aggressive client hooks, and Chrome TLS fingerprinting."
	},
	mercury: {
		id: "mercury",
		code: "m",
		name: "Mercury",
		tagline: "Base64 codec",
		description: "Compact base64url paths with rewritten assets and isolated sessions."
	},
	scramjet: {
		id: "scramjet",
		code: "s",
		name: "Scramjet",
		tagline: "XOR+hex codec",
		description: "Scramjet-style hex encoding with extra anti-detection rewrites."
	},
	rammerhead: {
		id: "rammerhead",
		code: "r",
		name: "Rammerhead",
		tagline: "Session proxy",
		description: "Per-tab session identity with sticky cookies and header mirroring."
	}
};
var DEFAULT_NGINX_LAYER = {
	sslServerName: true,
	forwardFor: false,
	hidePoweredBy: true,
	hideServer: true,
	extraRequestHeaders: {},
	extraHideHeaders: [
		"x-powered-by",
		"server",
		"via",
		"x-cache",
		"cf-ray"
	],
	userAgentOverride: ""
};
function isPathStyleEngine(engine) {
	return engine === "nginx" || engine === "rammerhead";
}
var UV_KEY = "veil-uv-codec";
var SJ_KEY = "veil-sj-codec";
function bytesXor(input, key) {
	const out = new Uint8Array(input.length);
	for (let i = 0; i < input.length; i++) out[i] = input.charCodeAt(i) ^ key.charCodeAt(i % key.length);
	return out;
}
function b64urlEncodeBytes(bytes) {
	let bin = "";
	for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
	return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function b64urlDecodeBytes(s) {
	const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - s.length % 4);
	const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
	const bin = atob(b64);
	const out = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
	return out;
}
function xorB64Encode(str, key) {
	return b64urlEncodeBytes(bytesXor(str, key));
}
function xorB64Decode(str, key) {
	const decoded = b64urlDecodeBytes(str);
	let raw = "";
	for (let i = 0; i < decoded.length; i++) raw += String.fromCharCode(decoded[i]);
	const bytes = bytesXor(raw, key);
	let out = "";
	for (let i = 0; i < bytes.length; i++) out += String.fromCharCode(bytes[i]);
	return out;
}
function xorHexEncode(str, key) {
	const bytes = bytesXor(str, key);
	let hex = "";
	for (let i = 0; i < bytes.length; i++) hex += bytes[i].toString(16).padStart(2, "0");
	return hex;
}
function xorHexDecode(hex, key) {
	if (hex.length % 2 !== 0) throw new Error("Invalid hex");
	let out = "";
	for (let i = 0; i < hex.length; i += 2) {
		const b = parseInt(hex.slice(i, i + 2), 16);
		out += String.fromCharCode(b ^ key.charCodeAt(i / 2 % key.length));
	}
	return out;
}
function pathStyleEncode(url) {
	const u = new URL(url);
	return `${u.protocol.replace(":", "")}/${u.host}${u.pathname}` + u.search;
}
function pathStyleDecode(splat) {
	const cut = splat.indexOf("/");
	if (cut < 0) throw new Error("Invalid path-style target");
	const proto = splat.slice(0, cut);
	const rest = splat.slice(cut + 1);
	if (proto !== "http" && proto !== "https") throw new Error("Unsupported protocol");
	return `${proto}://${rest}`;
}
function engineFromCode(code) {
	for (const e of Object.values(ENGINES)) if (e.code === code) return e.id;
	return null;
}
function encodeProxyPath(engine, tabId, url) {
	const code = ENGINES[engine].code;
	const abs = new URL(url).href;
	if (engine === "ultraviolet") return `/p/${code}/${tabId}/${xorB64Encode(abs, UV_KEY)}`;
	if (engine === "mercury") return `/p/${code}/${tabId}/${b64urlEncodeBytes(new TextEncoder().encode(abs))}`;
	if (engine === "scramjet") return `/p/${code}/${tabId}/${xorHexEncode(abs, SJ_KEY)}`;
	return `/p/${code}/${tabId}/${pathStyleEncode(abs)}`;
}
function decodeProxySplat(splat) {
	const parts = splat.split("/");
	if (parts.length < 3) return null;
	const code = parts[0] ?? "";
	const tabId = parts[1] ?? "";
	const rest = parts.slice(2).join("/");
	if (!code || !tabId || !rest) return null;
	const engine = engineFromCode(code);
	if (!engine) return null;
	try {
		let target;
		if (engine === "ultraviolet") target = xorB64Decode(rest, UV_KEY);
		else if (engine === "mercury") target = new TextDecoder().decode(b64urlDecodeBytes(rest));
		else if (engine === "scramjet") target = xorHexDecode(rest, SJ_KEY);
		else target = pathStyleDecode(rest);
		const url = new URL(target);
		if (url.protocol !== "http:" && url.protocol !== "https:") return null;
		return {
			engine,
			tabId,
			target: url.href
		};
	} catch {
		return null;
	}
}
function rewriteAbsoluteUrl(raw, pageUrl, engine, tabId) {
	const trimmed = raw.trim();
	if (!trimmed) return raw;
	const lower = trimmed.toLowerCase();
	if (lower.startsWith("javascript:") || lower.startsWith("data:") || lower.startsWith("blob:") || lower.startsWith("mailto:") || lower.startsWith("tel:") || lower.startsWith("#") || lower.startsWith("about:")) return raw;
	if (trimmed.startsWith("/p/")) return raw;
	try {
		const abs = new URL(trimmed, pageUrl).href;
		const hashIndex = abs.indexOf("#");
		const hash = hashIndex >= 0 ? abs.slice(hashIndex) : "";
		return encodeProxyPath(engine, tabId, hashIndex >= 0 ? abs.slice(0, hashIndex) : abs) + hash;
	} catch {
		return raw;
	}
}
function b64url(s) {
	return Buffer.from(s, "utf8").toString("base64url");
}
function b64urlDecode(s) {
	return Buffer.from(s, "base64url").toString("utf8");
}
/** v1--{tabId}--{b64(domain)}--{b64(name)}  — tab ids may contain underscores. */
function cookieName(tabId, domain, name) {
	return `v1--${tabId}--${b64url(domain)}--${b64url(name)}`;
}
function parseSetCookie(header, fallbackDomain) {
	const parts = header.split(";").map((p) => p.trim());
	const first = parts.shift();
	if (!first) return null;
	const eq = first.indexOf("=");
	if (eq < 0) return null;
	const name = first.slice(0, eq).trim();
	const value = first.slice(eq + 1).trim();
	if (!name) return null;
	const c = {
		name,
		value,
		domain: fallbackDomain,
		path: "/"
	};
	for (const p of parts) {
		const [k, ...rest] = p.split("=");
		const key = (k ?? "").trim().toLowerCase();
		const val = rest.join("=").trim();
		if (key === "domain" && val) c.domain = val.replace(/^\./, "");
		else if (key === "path" && val) c.path = val;
		else if (key === "expires" && val) {
			const t = Date.parse(val);
			if (!Number.isNaN(t)) c.expires = t;
		} else if (key === "max-age" && val) {
			const n = Number(val);
			if (Number.isFinite(n)) c.expires = Date.now() + n * 1e3;
		} else if (key === "secure") c.secure = true;
		else if (key === "httponly") c.httpOnly = true;
	}
	return c;
}
function cookieMatches(c, url) {
	if (c.expires && c.expires < Date.now()) return false;
	if (c.secure && url.protocol !== "https:") return false;
	const host = url.hostname;
	const d = c.domain.replace(/^\./, "");
	if (!(host === d || host.endsWith("." + d))) return false;
	const path = url.pathname || "/";
	const p = c.path || "/";
	return path === p || path.startsWith(p.endsWith("/") ? p : p + "/") || p === "/";
}
function jarToCookieHeader(cookies, url) {
	return cookies.filter((c) => cookieMatches(c, url)).map((c) => `${c.name}=${c.value}`).join("; ");
}
function setCookieToResponse(cookie, tabId, reqUrl) {
	const parts = [
		`${cookieName(tabId, cookie.domain, cookie.name)}=${encodeURIComponent(cookie.value)}`,
		`Path=/p/`,
		`SameSite=Lax`
	];
	if (reqUrl.protocol === "https:") parts.push("Secure");
	if (cookie.httpOnly) parts.push("HttpOnly");
	if (cookie.expires) parts.push(`Expires=${new Date(cookie.expires).toUTCString()}`);
	return parts.join("; ");
}
function readJarFromRequest(request, tabId) {
	const raw = request.headers.get("cookie");
	if (!raw) return [];
	const out = [];
	const prefix = `v1--${tabId}--`;
	for (const piece of raw.split(";")) {
		const eq = piece.indexOf("=");
		if (eq < 0) continue;
		const name = piece.slice(0, eq).trim();
		let value = piece.slice(eq + 1).trim();
		try {
			value = decodeURIComponent(value);
		} catch {}
		if (!name.startsWith(prefix)) continue;
		const rest = name.slice(prefix.length);
		const cut = rest.indexOf("--");
		if (cut < 1) continue;
		try {
			const domain = b64urlDecode(rest.slice(0, cut));
			const origName = b64urlDecode(rest.slice(cut + 2));
			out.push({
				name: origName,
				value,
				domain,
				path: "/"
			});
		} catch {}
	}
	return out;
}
var HOP_BY_HOP = /* @__PURE__ */ new Set([
	"connection",
	"keep-alive",
	"proxy-authenticate",
	"proxy-authorization",
	"te",
	"trailer",
	"transfer-encoding",
	"upgrade",
	"host",
	"content-length",
	"content-encoding",
	"cookie",
	"origin",
	"referer"
]);
var STRIP_RESPONSE = /* @__PURE__ */ new Set([
	"content-security-policy",
	"content-security-policy-report-only",
	"x-frame-options",
	"x-xss-protection",
	"report-to",
	"nel",
	"clear-site-data",
	"strict-transport-security",
	"content-encoding",
	"content-length",
	"transfer-encoding",
	"alt-svc",
	"expect-ct",
	"cross-origin-opener-policy",
	"cross-origin-embedder-policy",
	"cross-origin-resource-policy",
	"origin-agent-cluster"
]);
function chromeClientHints(stealth) {
	if (!stealth) return {
		"sec-ch-ua": "\"Chromium\";v=\"129\", \"Not=A?Brand\";v=\"8\", \"Google Chrome\";v=\"129\"",
		"sec-ch-ua-mobile": "?0",
		"sec-ch-ua-platform": "\"Windows\""
	};
	return {
		"sec-ch-ua": "\"Chromium\";v=\"129\", \"Not=A?Brand\";v=\"8\", \"Google Chrome\";v=\"129\"",
		"sec-ch-ua-mobile": "?0",
		"sec-ch-ua-platform": "\"Windows\"",
		"sec-ch-ua-full-version-list": "\"Chromium\";v=\"129.0.6668.90\", \"Not=A?Brand\";v=\"10.0.0.4\", \"Google Chrome\";v=\"129.0.6668.90\"",
		"sec-ch-ua-arch": "\"x86\"",
		"sec-ch-ua-bitness": "\"64\"",
		"sec-ch-ua-model": "\"\"",
		"sec-ch-ua-platform-version": "\"15.0.0\"",
		"sec-fetch-dest": "document",
		"sec-fetch-mode": "navigate",
		"sec-fetch-site": "none",
		"sec-fetch-user": "?1",
		"upgrade-insecure-requests": "1"
	};
}
function buildUpstreamHeaders(opts) {
	const { incoming, target, engine, nginx, stealth, cookieHeader, referer, isDocument } = opts;
	const out = new Headers();
	incoming.forEach((value, key) => {
		const k = key.toLowerCase();
		if (HOP_BY_HOP.has(k)) return;
		if (k.startsWith("x-veil") || k.startsWith("x-forwarded") || k === "via") return;
		if (k === "accept-encoding") return;
		out.set(key, value);
	});
	const ua = nginx.userAgentOverride.trim() || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36";
	out.set("user-agent", ua);
	out.set("host", target.host);
	out.set("accept-language", stealth ? "en-US,en;q=0.9" : incoming.get("accept-language") ?? "en-US,en;q=0.9");
	if (!out.has("accept")) out.set("accept", isDocument ? "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8" : "*/*");
	const hints = chromeClientHints(stealth || engine === "ultraviolet" || engine === "scramjet");
	for (const [k, v] of Object.entries(hints)) {
		if (k.startsWith("sec-fetch") && !isDocument) continue;
		out.set(k, v);
	}
	if (!isDocument) {
		out.set("sec-fetch-dest", incoming.get("sec-fetch-dest") ?? "empty");
		out.set("sec-fetch-mode", incoming.get("sec-fetch-mode") ?? "cors");
		out.set("sec-fetch-site", "same-origin");
	}
	if (referer) try {
		out.set("referer", new URL(referer).href);
		out.set("origin", new URL(referer).origin);
	} catch {}
	else if (isDocument) {
		out.delete("referer");
		out.delete("origin");
	} else {
		out.set("origin", target.origin);
		out.set("referer", target.origin + "/");
	}
	if (cookieHeader) out.set("cookie", cookieHeader);
	else out.delete("cookie");
	if (nginx.forwardFor) {
		const ip = incoming.get("x-forwarded-for") ?? incoming.get("cf-connecting-ip") ?? "1.1.1.1";
		out.set("x-real-ip", ip.split(",")[0].trim());
		out.set("x-forwarded-for", ip.split(",")[0].trim());
		out.set("x-forwarded-proto", target.protocol.replace(":", ""));
		out.set("x-forwarded-host", target.host);
	} else {
		out.delete("x-real-ip");
		out.delete("x-forwarded-for");
		out.delete("x-forwarded-proto");
		out.delete("x-forwarded-host");
		out.delete("forwarded");
		out.delete("via");
	}
	for (const [k, v] of Object.entries(nginx.extraRequestHeaders)) {
		if (!k.trim()) continue;
		out.set(k, v);
	}
	if (stealth || engine === "ultraviolet" || engine === "rammerhead") {
		out.delete("x-forwarded-for");
		out.delete("x-real-ip");
		out.delete("via");
		out.delete("forwarded");
	}
	return out;
}
function filterResponseHeaders(upstream, nginx, extraHide = []) {
	const out = new Headers();
	const hide = new Set([...nginx.extraHideHeaders, ...extraHide].map((h) => h.toLowerCase()));
	if (nginx.hidePoweredBy) hide.add("x-powered-by");
	if (nginx.hideServer) hide.add("server");
	upstream.forEach((value, key) => {
		const k = key.toLowerCase();
		if (STRIP_RESPONSE.has(k) || hide.has(k)) return;
		if (k === "set-cookie") return;
		if (k === "location") return;
		out.set(key, value);
	});
	return out;
}
function buildClientHook(cfg) {
	return `(() => {
  if (window.__veilHooked) return;
  window.__veilHooked = true;
  const cfg = ${JSON.stringify(cfg).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028")};
  const PREFIX = "/p/";
  const UV_KEY = "veil-uv-codec";
  const SJ_KEY = "veil-sj-codec";
  const URL_PROPS = { src: 1, href: 1, action: 1, poster: 1, formaction: 1, data: 1 };

  function b64urlEncode(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = "";
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\\+/g, "-").replace(/\\//g, "_").replace(/=+$/g, "");
  }
  function xorB64(str, key) {
    let bin = "";
    for (let i = 0; i < str.length; i++) bin += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    return btoa(bin).replace(/\\+/g, "-").replace(/\\//g, "_").replace(/=+$/g, "");
  }
  function xorHex(str, key) {
    let hex = "";
    for (let i = 0; i < str.length; i++) {
      hex += (str.charCodeAt(i) ^ key.charCodeAt(i % key.length)).toString(16).padStart(2, "0");
    }
    return hex;
  }
  function pathStyle(url) {
    const u = new URL(url);
    return u.protocol.replace(":", "") + "/" + u.host + u.pathname + u.search;
  }
  function engineCode(id) {
    return ({ nginx: "n", ultraviolet: "u", mercury: "m", scramjet: "s", rammerhead: "r" })[id] || "n";
  }
  function encodeTarget(url) {
    const abs = new URL(url, cfg.realUrl).href;
    const hash = abs.indexOf("#") >= 0 ? abs.slice(abs.indexOf("#")) : "";
    const noHash = hash ? abs.slice(0, abs.indexOf("#")) : abs;
    const code = engineCode(cfg.engine);
    let rest;
    if (cfg.engine === "ultraviolet") rest = xorB64(noHash, UV_KEY);
    else if (cfg.engine === "mercury") rest = b64urlEncode(noHash);
    else if (cfg.engine === "scramjet") rest = xorHex(noHash, SJ_KEY);
    else rest = pathStyle(noHash);
    return PREFIX + code + "/" + cfg.tabId + "/" + rest + hash;
  }
  function isSpecial(u) {
    return /^(javascript:|data:|blob:|mailto:|tel:|about:|#)/i.test(u);
  }
  function rewrite(u, base) {
    if (u == null) return u;
    const s = String(u);
    if (!s || isSpecial(s) || s.startsWith(PREFIX) || s.startsWith("/api/ws")) return s;
    try { return encodeTarget(new URL(s, base || cfg.realUrl).href); }
    catch { return s; }
  }

  function emit(type, payload) {
    try { parent.postMessage(Object.assign({ ns: "veil", type, tabId: cfg.tabId }, payload || {}), "*"); }
    catch (e) {}
  }

  const loc = new URL(cfg.realUrl);
  function syncLoc(href) {
    try { const n = new URL(href, loc.href); loc.href = n.href; cfg.realUrl = n.href; }
    catch (e) {}
  }
  const locationShim = {
    get href() { return loc.href; },
    set href(v) { navigate(v, false); },
    get protocol() { return loc.protocol; },
    get host() { return loc.host; },
    get hostname() { return loc.hostname; },
    get port() { return loc.port; },
    get pathname() { return loc.pathname; },
    get search() { return loc.search; },
    get hash() { return loc.hash; },
    set hash(v) { loc.hash = v; },
    get origin() { return loc.origin; },
    assign(v) { navigate(v, false); },
    replace(v) { navigate(v, true); },
    reload() { realLoc.reload(); },
    toString() { return loc.href; },
    ancestorOrigins: { length: 0, item: function() { return null; } }
  };
  const realLoc = window.location;
  function navigate(v, replace) {
    const next = rewrite(v);
    emit("navigate", { url: new URL(v, loc.href).href, replace: !!replace });
    if (replace) realLoc.replace(next);
    else realLoc.assign(next);
  }

  try {
    Object.defineProperty(window, "parent", { configurable: true, get() { return window; } });
    Object.defineProperty(window, "top", { configurable: true, get() { return window; } });
    Object.defineProperty(window, "frameElement", { configurable: true, get() { return null; } });
    Object.defineProperty(window, "opener", { configurable: true, get() { return null; } });
  } catch (e) {}

  try {
    const desc = Object.getOwnPropertyDescriptor(window, "location");
    if (!desc || desc.configurable) {
      Object.defineProperty(window, "location", { configurable: true, get() { return locationShim; }, set(v) { navigate(v, false); } });
    }
  } catch (e) {}
  try {
    Object.defineProperty(document, "location", { configurable: true, get() { return locationShim; }, set(v) { navigate(v, false); } });
  } catch (e) {}
  try {
    Object.defineProperty(document, "URL", { configurable: true, get() { return loc.href; } });
    Object.defineProperty(document, "documentURI", { configurable: true, get() { return loc.href; } });
    Object.defineProperty(document, "domain", { configurable: true, get() { return loc.hostname; }, set() {} });
    Object.defineProperty(document, "referrer", { configurable: true, get() { return cfg.redirectedFrom || ""; } });
  } catch (e) {}

  const hist = window.history;
  const wrapState = function(orig) {
    return function(state, title, url) {
      if (url) {
        const abs = new URL(url, loc.href).href;
        syncLoc(abs);
        emit("history", { url: abs });
        return orig.call(this, state, title, rewrite(url));
      }
      return orig.call(this, state, title, url);
    };
  };
  try {
    hist.pushState = wrapState(hist.pushState.bind(hist));
    hist.replaceState = wrapState(hist.replaceState.bind(hist));
  } catch (e) {}

  const ns = "__veil_ls_" + cfg.tabId + "_";
  function wrapStorage(storage, kind) {
    const fake = {
      get length() {
        let n = 0;
        for (let i = 0; i < storage.length; i++) {
          const k = storage.key(i);
          if (k && k.startsWith(ns)) n++;
        }
        return n;
      },
      key(i) {
        const keys = [];
        for (let j = 0; j < storage.length; j++) {
          const k = storage.key(j);
          if (k && k.startsWith(ns)) keys.push(k.slice(ns.length));
        }
        return keys[i] ?? null;
      },
      getItem(k) { return storage.getItem(ns + k); },
      setItem(k, v) { storage.setItem(ns + k, String(v)); },
      removeItem(k) { storage.removeItem(ns + k); },
      clear() {
        const rm = [];
        for (let i = 0; i < storage.length; i++) {
          const k = storage.key(i);
          if (k && k.startsWith(ns)) rm.push(k);
        }
        rm.forEach((k) => storage.removeItem(k));
      }
    };
    try { Object.defineProperty(window, kind, { configurable: true, get() { return fake; } }); } catch (e) {}
  }
  try { wrapStorage(window.localStorage, "localStorage"); } catch (e) {}
  try { wrapStorage(window.sessionStorage, "sessionStorage"); } catch (e) {}

  const origCookie = Object.getOwnPropertyDescriptor(Document.prototype, "cookie") ||
    Object.getOwnPropertyDescriptor(document, "cookie");
  if (origCookie && origCookie.get && origCookie.set) {
    Object.defineProperty(document, "cookie", {
      configurable: true,
      get() {
        const raw = origCookie.get.call(document);
        const keep = [];
        raw.split(";").forEach((p) => {
          const t = p.trim();
          if (t.indexOf("v1--" + cfg.tabId + "--") === 0) keep.push(t);
        });
        return keep.join("; ");
      },
      set(v) { origCookie.set.call(document, v); }
    });
  }

  const origFetch = window.fetch.bind(window);
  window.fetch = function(input, init) {
    const req = input instanceof Request ? input : null;
    let url = req ? req.url : (typeof input === "string" ? input : (input && input.url) || String(input));
    const next = rewrite(url);
    const headers = new Headers((init && init.headers) || (req && req.headers) || undefined);
    headers.set("X-Veil-Page", loc.href);
    const t0 = performance.now();
    emit("net", { phase: "start", method: (init && init.method) || (req && req.method) || "GET", url: String(url) });
    const p = req
      ? origFetch(new Request(next, req), init ? Object.assign({}, init, { headers }) : { headers })
      : origFetch(next, Object.assign({}, init || {}, { headers }));
    return p.then((res) => {
      emit("net", { phase: "end", url: String(url), status: res.status, ms: Math.round(performance.now() - t0) });
      return res;
    }, (err) => {
      emit("net", { phase: "error", url: String(url), error: String(err) });
      throw err;
    });
  };

  const OrigXHR = window.XMLHttpRequest;
  function WrappedXHR() {
    const xhr = new OrigXHR();
    let real = "";
    const open = xhr.open;
    xhr.open = function(method, url) {
      real = String(url);
      const args = arguments;
      args[1] = rewrite(url);
      emit("net", { phase: "start", method: method, url: real });
      return open.apply(xhr, args);
    };
    xhr.addEventListener("loadend", function() {
      emit("net", { phase: "end", url: real, status: xhr.status });
    });
    return xhr;
  }
  WrappedXHR.prototype = OrigXHR.prototype;
  window.XMLHttpRequest = WrappedXHR;

  const OrigWS = window.WebSocket;
  window.WebSocket = function(url, protocols) {
    const abs = new URL(url, loc.href);
    const proxied = (location.protocol === "https:" ? "wss:" : "ws:") + "//" + location.host + "/api/ws?u=" + encodeURIComponent(abs.href) + "&tab=" + encodeURIComponent(cfg.tabId);
    emit("net", { phase: "ws", url: abs.href });
    return protocols ? new OrigWS(proxied, protocols) : new OrigWS(proxied);
  };
  window.WebSocket.prototype = OrigWS.prototype;
  window.WebSocket.CONNECTING = OrigWS.CONNECTING;
  window.WebSocket.OPEN = OrigWS.OPEN;
  window.WebSocket.CLOSING = OrigWS.CLOSING;
  window.WebSocket.CLOSED = OrigWS.CLOSED;

  if (window.EventSource) {
    const OrigES = window.EventSource;
    window.EventSource = function(url, opts) {
      return new OrigES(rewrite(url), opts);
    };
    window.EventSource.prototype = OrigES.prototype;
  }

  if (window.Worker) {
    const OrigWorker = window.Worker;
    window.Worker = function(url, opts) {
      return new OrigWorker(rewrite(url), opts);
    };
    window.Worker.prototype = OrigWorker.prototype;
  }

  const origOpen = window.open;
  window.open = function(url, name, specs) {
    if (!url) return origOpen.call(window, url, name, specs);
    emit("open", { url: new URL(url, loc.href).href });
    return origOpen.call(window, rewrite(url), name, specs);
  };

  function trapProto(proto, prop) {
    if (!proto) return;
    const desc = Object.getOwnPropertyDescriptor(proto, prop);
    if (!desc || !desc.set) return;
    try {
      Object.defineProperty(proto, prop, {
        configurable: true,
        enumerable: desc.enumerable,
        get: desc.get,
        set(v) { desc.set.call(this, rewrite(v)); }
      });
    } catch (e) {}
  }
  [
    [HTMLScriptElement && HTMLScriptElement.prototype, "src"],
    [HTMLImageElement && HTMLImageElement.prototype, "src"],
    [HTMLIFrameElement && HTMLIFrameElement.prototype, "src"],
    [HTMLAnchorElement && HTMLAnchorElement.prototype, "href"],
    [HTMLFormElement && HTMLFormElement.prototype, "action"],
    [HTMLLinkElement && HTMLLinkElement.prototype, "href"],
    [HTMLSourceElement && HTMLSourceElement.prototype, "src"],
    [HTMLVideoElement && HTMLVideoElement.prototype, "src"],
    [HTMLAudioElement && HTMLAudioElement.prototype, "src"],
    [HTMLEmbedElement && HTMLEmbedElement.prototype, "src"],
    [HTMLObjectElement && HTMLObjectElement.prototype, "data"],
    [HTMLInputElement && HTMLInputElement.prototype, "src"]
  ].forEach(function (pair) { trapProto(pair[0], pair[1]); });

  const origSetAttr = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function(name, value) {
    const n = String(name).toLowerCase();
    if (URL_PROPS[n] || n === "srcset" || n === "imagesrcset" || (n.indexOf("data-") === 0 && /src|href|url/.test(n))) {
      if (n === "srcset" || n === "imagesrcset") {
        const next = String(value).split(",").map(function(part) {
          const t = part.trim();
          if (!t) return t;
          const bits = t.split(/\\s+/);
          bits[0] = rewrite(bits[0]);
          return bits.join(" ");
        }).join(", ");
        return origSetAttr.call(this, name, next);
      }
      return origSetAttr.call(this, name, rewrite(value));
    }
    return origSetAttr.call(this, name, value);
  };

  function rewriteNode(node) {
    if (!node || node.nodeType !== 1) return;
    if (node.hasAttribute && node.hasAttribute("data-veil")) return;
    for (const attr of ["src", "href", "action", "poster", "formaction", "data-src", "data-href"]) {
      if (!node.getAttribute) continue;
      const v = node.getAttribute(attr);
      if (v && !isSpecial(v) && v.indexOf(PREFIX) !== 0) {
        origSetAttr.call(node, attr, rewrite(v));
      }
    }
    const kids = node.children;
    if (kids) for (let i = 0; i < kids.length; i++) rewriteNode(kids[i]);
  }
  try {
    const mo = new MutationObserver(function(muts) {
      for (let i = 0; i < muts.length; i++) {
        const nodes = muts[i].addedNodes;
        for (let j = 0; j < nodes.length; j++) rewriteNode(nodes[j]);
      }
    });
    mo.observe(document.documentElement || document, { childList: true, subtree: true });
  } catch (e) {}

  if (navigator.serviceWorker && navigator.serviceWorker.register) {
    navigator.serviceWorker.register = function() {
      return Promise.reject(new Error("Service workers are disabled inside Veil"));
    };
  }

  document.addEventListener("click", function(ev) {
    const a = ev.target && ev.target.closest ? ev.target.closest("a") : null;
    if (!a || !a.href) return;
    if (a.hasAttribute("download")) {
      ev.preventDefault();
      emit("download", { url: a.href, filename: a.getAttribute("download") || "" });
      return;
    }
    if (a.target === "_blank" || ev.metaKey || ev.ctrlKey) {
      ev.preventDefault();
      const raw = a.getAttribute("href") || a.href;
      emit("open", { url: raw.startsWith(PREFIX) ? loc.href : (function(){ try { return new URL(raw, loc.href).href; } catch(e){ return loc.href; } })() });
      return;
    }
  }, true);

  document.addEventListener("submit", function(ev) {
    const form = ev.target;
    if (!form || !form.action) return;
    try {
      const action = form.getAttribute("action") || loc.href;
      if (!String(action).startsWith(PREFIX)) form.action = rewrite(action);
    } catch (e) {}
  }, true);

  ["log", "info", "warn", "error", "debug"].forEach((level) => {
    const orig = console[level].bind(console);
    console[level] = function() {
      try {
        const args = Array.from(arguments).map((a) => {
          try { return typeof a === "string" ? a : JSON.stringify(a); }
          catch { return String(a); }
        });
        emit("console", { level, args });
      } catch (e) {}
      return orig.apply(console, arguments);
    };
  });
  window.addEventListener("error", function(ev) {
    emit("console", { level: "error", args: [ev.message + " at " + (ev.filename || "") + ":" + ev.lineno] });
  });

  function reportTitle() {
    emit("meta", { title: document.title || loc.hostname, url: loc.href, redirectedFrom: cfg.redirectedFrom, favicon: faviconHref() });
  }
  function faviconHref() {
    const link = document.querySelector("link[rel*='icon']");
    return (link && link.href) || (loc.origin + "/favicon.ico");
  }
  const obs = new MutationObserver(reportTitle);
  const startObs = function() {
    if (document.documentElement) obs.observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ["href"] });
    reportTitle();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", startObs);
  else startObs();

  if (cfg.adblock && cfg.cosmetic && cfg.cosmetic.length) {
    const style = document.createElement("style");
    style.setAttribute("data-veil", "adblock");
    style.textContent = cfg.cosmetic.join(",") + "{display:none!important;visibility:hidden!important;height:0!important;overflow:hidden!important;}";
    (document.head || document.documentElement).appendChild(style);
  }

  if (cfg.stealth || cfg.fingerprintResist) {
    try {
      Object.defineProperty(navigator, "webdriver", { get() { return undefined; } });
      Object.defineProperty(navigator, "languages", { get() { return ["en-US", "en"]; } });
      Object.defineProperty(navigator, "language", { get() { return "en-US"; } });
      Object.defineProperty(navigator, "platform", { get() { return "Win32"; } });
      Object.defineProperty(navigator, "hardwareConcurrency", { get() { return 8; } });
      Object.defineProperty(navigator, "deviceMemory", { get() { return 8; } });
      Object.defineProperty(navigator, "maxTouchPoints", { get() { return 0; } });
      const toBlob = HTMLCanvasElement.prototype.toBlob;
      const toDataURL = HTMLCanvasElement.prototype.toDataURL;
      function noise(canvas) {
        try {
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          const { width, height } = canvas;
          if (!width || !height || width > 4096 || height > 4096) return;
          const img = ctx.getImageData(0, 0, Math.min(width, 16), 1);
          for (let i = 0; i < img.data.length; i += 4) img.data[i] ^= 1;
          ctx.putImageData(img, 0, 0);
        } catch (e) {}
      }
      HTMLCanvasElement.prototype.toDataURL = function() { noise(this); return toDataURL.apply(this, arguments); };
      HTMLCanvasElement.prototype.toBlob = function() { noise(this); return toBlob.apply(this, arguments); };
    } catch (e) {}
  }

  if (cfg.webrtcBlock || cfg.stealth) {
    try {
      const origRtc = window.RTCPeerConnection;
      window.RTCPeerConnection = function() { throw new Error("WebRTC disabled in stealth mode"); };
      if (origRtc) window.RTCPeerConnection.prototype = origRtc.prototype;
      window.webkitRTCPeerConnection = window.RTCPeerConnection;
    } catch (e) {}
  }

  function fillLogin(logins) {
    if (!logins || !logins.length) return;
    const forms = document.querySelectorAll("form");
    forms.forEach(function(form) {
      const user = form.querySelector("input[type='email'], input[type='text'][name*='user' i], input[name='email'], input[autocomplete='username']");
      const pass = form.querySelector("input[type='password']");
      if (!user || !pass) return;
      const login = logins[0];
      if (!user.value) { user.value = login.username; user.dispatchEvent(new Event("input", { bubbles: true })); }
      if (!pass.value) { pass.value = login.password; pass.dispatchEvent(new Event("input", { bubbles: true })); }
    });
  }

  let inspectOn = false;
  let lastEl = null;
  const tip = document.createElement("div");
  tip.style.cssText = "position:fixed;z-index:2147483646;pointer-events:none;background:#0b0c0e;color:#eceef2;border:1px solid #2a2d34;padding:4px 8px;font:12px/1.3 ui-monospace,monospace;border-radius:6px;display:none;";
  function outline(el, on) {
    if (!el || !el.style) return;
    el.style.outline = on ? "2px solid #8fa3c4" : "";
  }
  window.addEventListener("message", function(ev) {
    const d = ev.data;
    if (!d || d.ns !== "veil") return;
    if (d.type === "inspect") inspectOn = !!d.on;
    if (d.type === "autofill") fillLogin(d.logins || []);
    if (d.type === "eval") {
      try {
        const r = (0, eval)(d.code);
        emit("console", { level: "info", args: [String(r)] });
      } catch (err) {
        emit("console", { level: "error", args: [String(err)] });
      }
    }
  });
  document.addEventListener("mousemove", function(ev) {
    if (!inspectOn) return;
    const el = ev.target;
    if (el === lastEl) return;
    outline(lastEl, false);
    lastEl = el;
    outline(el, true);
    tip.style.display = "block";
    tip.textContent = (el.tagName || "").toLowerCase() + (el.id ? "#" + el.id : "") + (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\\s+/).slice(0, 2).join(".") : "");
    tip.style.left = Math.min(ev.clientX + 12, innerWidth - 160) + "px";
    tip.style.top = Math.min(ev.clientY + 12, innerHeight - 32) + "px";
    if (!tip.parentNode) document.documentElement.appendChild(tip);
  }, true);
  document.addEventListener("click", function(ev) {
    if (!inspectOn) return;
    ev.preventDefault();
    ev.stopPropagation();
    const el = ev.target;
    const cs = el ? getComputedStyle(el) : null;
    emit("inspect", {
      html: el ? el.outerHTML.slice(0, 4000) : "",
      tag: el ? el.tagName : "",
      styles: cs ? { display: cs.display, color: cs.color, background: cs.backgroundColor, font: cs.font, width: cs.width, height: cs.height } : null
    });
  }, true);

  emit("ready", { url: loc.href, redirectedFrom: cfg.redirectedFrom });
})();`;
}
var URL_ATTRS = /* @__PURE__ */ new Set([
	"href",
	"src",
	"action",
	"poster",
	"formaction",
	"cite",
	"background",
	"data-src",
	"data-href",
	"data-original",
	"data-lazy-src",
	"longdesc",
	"usemap",
	"xlink:href"
]);
var SRCSET_ATTRS = /* @__PURE__ */ new Set([
	"srcset",
	"imagesrcset",
	"data-srcset"
]);
function rewriteCss(css, pageUrl, engine, tabId) {
	let out = css.replace(/@import\s+(?:url\(\s*)?(["']?)([^"')]+)\1\s*\)?/gi, (_m, _q, u) => {
		return `@import url("${rewriteAbsoluteUrl(u, pageUrl, engine, tabId)}")`;
	});
	out = out.replace(/url\(\s*(["']?)([^"')]+)\1\s*\)/gi, (m, q, u) => {
		const t = String(u).trim();
		if (!t || /^(data:|blob:|#)/i.test(t)) return m;
		const rewritten = rewriteAbsoluteUrl(t, pageUrl, engine, tabId);
		const quote = q || "\"";
		return `url(${quote}${rewritten}${quote})`;
	});
	return out;
}
function rewriteSrcset(value, pageUrl, engine, tabId) {
	return value.split(",").map((part) => {
		const trimmed = part.trim();
		if (!trimmed) return trimmed;
		const bits = trimmed.split(/\s+/);
		return [rewriteAbsoluteUrl(bits.shift() ?? "", pageUrl, engine, tabId), ...bits].join(" ");
	}).join(", ");
}
function rewriteAttrValue(name, value, pageUrl, engine, tabId) {
	const n = name.toLowerCase();
	if (n === "style") return rewriteCss(value, pageUrl, engine, tabId);
	if (SRCSET_ATTRS.has(n) || n === "srcset" || n === "imagesrcset") return rewriteSrcset(value, pageUrl, engine, tabId);
	if (n === "ping") return value.split(/\s+/).map((u) => rewriteAbsoluteUrl(u, pageUrl, engine, tabId)).join(" ");
	if (n === "content" && /url=/i.test(value)) return value.replace(/url\s*=\s*([^\s;]+)/i, (_m, u) => {
		return "url=" + rewriteAbsoluteUrl(u.replace(/^["']|["']$/g, ""), pageUrl, engine, tabId);
	});
	if (URL_ATTRS.has(n) || n.startsWith("data-") && /src|href|url/i.test(n)) return rewriteAbsoluteUrl(value, pageUrl, engine, tabId);
	return value;
}
function stripDangerous(html) {
	return html.replace(/<meta\b[^>]*http-equiv\s*=\s*["']?content-security-policy[^>]*>/gi, "").replace(/<base\b[^>]*>/gi, "").replace(/\s+integrity\s*=\s*(["'][^"']*["']|[^\s>]+)/gi, "").replace(/\s+nonce\s*=\s*(["'][^"']*["']|[^\s>]+)/gi, "").replace(/\s+crossorigin\s*=\s*(["'][^"']*["']|[^\s>]+)/gi, "").replace(/<meta\b[^>]*http-equiv\s*=\s*["']?x-frame-options[^>]*>/gi, "");
}
function rewriteHtml(html, pageUrl, engine, tabId, hookScript) {
	let out = stripDangerous(html);
	out = out.replace(/<(meta)\b([^>]*http-equiv\s*=\s*["']?refresh["']?[^>]*)>/gi, (_m, tag, attrs) => {
		return `<${tag}${attrs.replace(/\bcontent\s*=\s*(["'])([\s\S]*?)\1/i, (_a, q, v) => {
			return `content=${q}${rewriteAttrValue("content", v, pageUrl, engine, tabId)}${q}`;
		})}>`;
	});
	out = out.replace(/<\s*([a-zA-Z][\w:-]*)\b([^>]*)>/g, (m, tag, attrs) => {
		if (!attrs) return m;
		if (/\/\s*$/.test(m) && tag.toLowerCase() === "script" && attrs.includes("data-veil")) return m;
		return `<${tag}${attrs.replace(/(\s)([a-zA-Z_:][\w:.-]*)(\s*=\s*)(["'])([\s\S]*?)\4/g, (_a, sp, name, eq, q, val) => {
			const n = name.toLowerCase();
			if (URL_ATTRS.has(n) || SRCSET_ATTRS.has(n) || n === "style" || n === "ping" || n === "srcset" || n === "imagesrcset" || n === "content" || n.startsWith("data-") && /src|href|url/i.test(n)) return `${sp}${name}${eq}${q}${rewriteAttrValue(n, val, pageUrl, engine, tabId)}${q}`;
			return _a;
		})}>`;
	});
	out = out.replace(/<style\b([^>]*)>([\s\S]*?)<\/style>/gi, (_m, attrs, css) => {
		return `<style${attrs}>${rewriteCss(css, pageUrl, engine, tabId)}</style>`;
	});
	const hook = `<script data-veil="hook">${hookScript}<\/script>`;
	if (/<head[^>]*>/i.test(out)) out = out.replace(/<head[^>]*>/i, (m) => m + hook);
	else if (/<html[^>]*>/i.test(out)) out = out.replace(/<html[^>]*>/i, (m) => `${m}<head>${hook}</head>`);
	else out = hook + out;
	return out;
}
function sniffHtml(contentType, url, head) {
	const ct = (contentType ?? "").toLowerCase();
	if (ct.includes("text/html") || ct.includes("application/xhtml")) return true;
	if (ct && !ct.includes("octet-stream") && !ct.includes("text/plain")) return false;
	const start = new TextDecoder("utf-8", { fatal: false }).decode(head.slice(0, 256)).trimStart();
	if (/^<!doctype html/i.test(start) || /^<html/i.test(start)) return true;
	const path = new URL(url).pathname;
	if (/\.html?$/i.test(path) || path.endsWith("/")) return start.startsWith("<");
	return false;
}
function isCss(contentType, url) {
	if ((contentType ?? "").toLowerCase().includes("text/css")) return true;
	return /\.css(?:$|\?)/i.test(new URL(url).pathname);
}
var BLOCKED_HOSTS = /* @__PURE__ */ new Set([
	"localhost",
	"localhost.localdomain",
	"metadata.google.internal",
	"metadata.goog",
	"metadata"
]);
function ipv4ToInt(ip) {
	const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(ip);
	if (!m) return null;
	const parts = m.slice(1).map((n) => Number(n));
	if (parts.some((n) => n > 255)) return null;
	return (parts[0] << 24 | parts[1] << 16 | parts[2] << 8 | parts[3]) >>> 0;
}
function inCidr(ip, base, bits) {
	const b = ipv4ToInt(base);
	if (b === null) return false;
	const mask = bits === 0 ? 0 : -1 << 32 - bits >>> 0;
	return (ip & mask) === (b & mask);
}
function isBlockedHost(hostname) {
	const host = hostname.replace(/\.+$/, "").toLowerCase();
	if (BLOCKED_HOSTS.has(host)) return true;
	if (host.endsWith(".localhost") || host.endsWith(".internal") || host.endsWith(".local")) return true;
	if (host.includes("metadata.google")) return true;
	if (host.includes(":")) {
		const h = host.replace(/^\[|\]$/g, "");
		if (h === "::1" || h === "::" || h.startsWith("fd") || h.startsWith("fe80") || h.startsWith("fc")) return true;
		const v4mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i.exec(h);
		if (v4mapped) return isBlockedHost(v4mapped[1]);
	}
	const ip = ipv4ToInt(host);
	if (ip === null) return false;
	return inCidr(ip, "0.0.0.0", 8) || inCidr(ip, "10.0.0.0", 8) || inCidr(ip, "127.0.0.0", 8) || inCidr(ip, "169.254.0.0", 16) || inCidr(ip, "172.16.0.0", 12) || inCidr(ip, "192.168.0.0", 16) || inCidr(ip, "100.64.0.0", 10);
}
function assertPublicUrl(url) {
	if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("Only http and https are allowed");
	if (url.username || url.password) throw new Error("Credentials in URLs are not allowed");
	if (isBlockedHost(url.hostname)) throw new Error("This host is not reachable through Veil");
}
var MAX_BODY = 18874368;
var MAX_REDIRECTS = 8;
var TIMEOUT_MS = 22e3;
var compiledBuiltin = compileFilters(BUILTIN_NETWORK_FILTERS);
function readCfgCookie(request) {
	const raw = request.headers.get("cookie") ?? "";
	const match = /(?:^|;\s*)veil_cfg=([^;]+)/.exec(raw);
	if (!match) return {
		adblock: false,
		stealth: false,
		webrtcBlock: false,
		fingerprintResist: false,
		engine: "nginx",
		nginx: DEFAULT_NGINX_LAYER
	};
	try {
		const parsed = JSON.parse(decodeURIComponent(match[1]));
		return {
			adblock: !!parsed.adblock,
			stealth: !!parsed.stealth,
			webrtcBlock: !!parsed.webrtcBlock,
			fingerprintResist: !!parsed.fingerprintResist,
			engine: parsed.engine || "nginx",
			nginx: {
				...DEFAULT_NGINX_LAYER,
				...parsed.nginx ?? {}
			}
		};
	} catch {
		return {
			adblock: false,
			stealth: false,
			webrtcBlock: false,
			fingerprintResist: false,
			engine: "nginx",
			nginx: DEFAULT_NGINX_LAYER
		};
	}
}
function extraFilters(request) {
	const raw = request.headers.get("cookie") ?? "";
	const match = /(?:^|;\s*)veil_filters=([^;]+)/.exec(raw);
	if (!match) return [];
	try {
		const parsed = JSON.parse(decodeURIComponent(match[1]));
		return Array.isArray(parsed) ? parsed.map(String) : [];
	} catch {
		return [];
	}
}
function errorPage(title, message, url) {
	const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
<style>
  :root { color-scheme: dark; }
  body { margin:0; min-height:100vh; display:grid; place-items:center; font:15px/1.5 Outfit, system-ui, sans-serif;
    background:#0b0c0e; color:#eceef2; }
  main { max-width: 28rem; padding: 2rem; }
  h1 { font-size: 1.25rem; font-weight: 600; letter-spacing: -0.02em; margin: 0 0 .5rem; }
  p { color:#8e939c; margin: 0 0 1rem; }
  code { font: 12px/1.4 ui-monospace, monospace; color:#c9cfd8; word-break: break-all; }
</style></head>
<body><main>
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(message)}</p>
  <code>${escapeHtml(url)}</code>
</main>
<script>try{parent.postMessage({ns:'veil',type:'error',title:${JSON.stringify(title)},message:${JSON.stringify(message)}},'*')}catch(e){}<\/script>
</body></html>`;
	return new Response(html, {
		status: 502,
		headers: {
			"content-type": "text/html; charset=utf-8",
			"cache-control": "no-store"
		}
	});
}
function escapeHtml(s) {
	return s.replace(/[&<>"']/g, (ch) => {
		switch (ch) {
			case "&": return "&amp;";
			case "<": return "&lt;";
			case ">": return "&gt;";
			case "\"": return "&quot;";
			default: return "&#39;";
		}
	});
}
function collectSetCookies(headers) {
	const anyHeaders = headers;
	if (typeof anyHeaders.getSetCookie === "function") return anyHeaders.getSetCookie();
	const single = headers.get("set-cookie");
	return single ? [single] : [];
}
function isDownload(headers, url) {
	const cd = headers.get("content-disposition") ?? "";
	if (/attachment/i.test(cd)) return true;
	const ct = (headers.get("content-type") ?? "").toLowerCase();
	if (ct.includes("application/octet-stream") || ct.includes("application/zip")) return /attachment/i.test(cd) || /download=1/.test(url.search);
	return false;
}
function filenameFrom(headers, url) {
	const cd = headers.get("content-disposition") ?? "";
	const m = /filename\*?=(?:UTF-8''|"([^"]+)"|([^;]+))/i.exec(cd);
	if (m) try {
		return decodeURIComponent((m[1] || m[2] || "").trim());
	} catch {
		return (m[1] || m[2] || "download").trim();
	}
	return url.pathname.split("/").filter(Boolean).pop() || "download";
}
/** Path-style engines put the real query on the proxy request (`/p/n/tab/https/host/path?q=`). */
function applyProxySearch(target, requestUrl, engine) {
	if (!isPathStyleEngine(engine)) return;
	if (target.search) return;
	const params = new URLSearchParams(requestUrl.search);
	params.delete("_dl");
	const qs = params.toString();
	if (qs) target.search = qs;
}
async function handleProxyRequest(request, splat) {
	if (request.method === "OPTIONS") return new Response(null, {
		status: 204,
		headers: {
			"access-control-allow-origin": "*",
			"access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,HEAD,OPTIONS",
			"access-control-allow-headers": request.headers.get("access-control-request-headers") ?? "*",
			"access-control-max-age": "86400"
		}
	});
	const decoded = decodeProxySplat(splat);
	if (!decoded) return errorPage("Invalid proxy path", "Veil could not decode that destination.", splat);
	const reqUrl = new URL(request.url);
	let target;
	try {
		target = new URL(decoded.target);
		applyProxySearch(target, reqUrl, decoded.engine);
		assertPublicUrl(target);
	} catch (err) {
		return errorPage("Blocked destination", err instanceof Error ? err.message : "Invalid URL", decoded.target);
	}
	const cfg = readCfgCookie(request);
	const extra = extraFilters(request);
	const compiled = extra.length ? compileFilters([...BUILTIN_NETWORK_FILTERS, ...extra]) : compiledBuiltin;
	if (cfg.adblock && matchesNetworkFilter(target, compiled)) return new Response("", {
		status: 204,
		headers: {
			"x-veil-blocked": "adblock",
			"cache-control": "no-store"
		}
	});
	const isDl = reqUrl.searchParams.get("_dl") === "1";
	const pageHint = request.headers.get("x-veil-page");
	const jar = readJarFromRequest(request, decoded.tabId);
	const cookieHeader = jarToCookieHeader(jar, target) || null;
	const accept = request.headers.get("accept") ?? "";
	const dest = request.headers.get("sec-fetch-dest");
	const isDocument = request.method === "GET" && (accept.includes("text/html") || !dest || dest === "document" || dest === "iframe" || dest === "frame");
	const nginx = cfg.nginx ?? DEFAULT_NGINX_LAYER;
	const engine = decoded.engine;
	const chain = [target.href];
	let current = target;
	let upstream = null;
	const method = request.method === "HEAD" ? "GET" : request.method;
	const body = method === "GET" || method === "HEAD" ? void 0 : await request.arrayBuffer();
	try {
		for (let i = 0; i <= MAX_REDIRECTS; i++) {
			const headers = buildUpstreamHeaders({
				incoming: request.headers,
				target: current,
				engine,
				nginx,
				stealth: cfg.stealth || cfg.fingerprintResist,
				cookieHeader: jarToCookieHeader(jar, current) || cookieHeader,
				referer: pageHint,
				isDocument: isDocument && i === 0
			});
			const ac = AbortSignal.timeout(TIMEOUT_MS);
			upstream = await fetch(current.href, {
				method,
				headers,
				body: i === 0 ? body : void 0,
				redirect: "manual",
				signal: ac
			});
			const loc = upstream.headers.get("location");
			if (loc && upstream.status >= 300 && upstream.status < 400) {
				const next = new URL(loc, current.href);
				assertPublicUrl(next);
				chain.push(next.href);
				current = next;
				continue;
			}
			break;
		}
	} catch (err) {
		return errorPage("Unable to reach site", err instanceof Error ? err.message : "Fetch failed", target.href);
	}
	if (!upstream) return errorPage("No response", "The upstream server did not respond.", target.href);
	const finalUrl = current.href;
	const redirectedFrom = chain.length > 1 ? chain[0] : null;
	for (const sc of collectSetCookies(upstream.headers)) {
		const parsed = parseSetCookie(sc, current.hostname);
		if (parsed) jar.push(parsed);
	}
	if (request.method === "HEAD") {
		const outHeaders = filterResponseHeaders(upstream.headers, nginx);
		outHeaders.set("cache-control", "no-store");
		outHeaders.set("x-veil-final-url", finalUrl);
		const res = new Response(null, {
			status: upstream.status,
			headers: outHeaders
		});
		for (const c of jar) res.headers.append("set-cookie", setCookieToResponse(c, decoded.tabId, reqUrl));
		return res;
	}
	const buf = new Uint8Array(await upstream.arrayBuffer());
	if (buf.byteLength > MAX_BODY) return errorPage("Response too large", "This file exceeds Veil’s transfer limit.", finalUrl);
	const outHeaders = filterResponseHeaders(upstream.headers, nginx);
	outHeaders.set("cache-control", "no-store");
	outHeaders.set("x-veil-final-url", finalUrl);
	if (redirectedFrom) outHeaders.set("x-veil-redirected-from", redirectedFrom);
	outHeaders.set("x-veil-engine", engine);
	outHeaders.delete("content-security-policy");
	outHeaders.set("access-control-allow-origin", "*");
	const cookiesOut = [];
	for (const c of jar) cookiesOut.push(setCookieToResponse(c, decoded.tabId, reqUrl));
	if (!isDl && isDownload(upstream.headers, current)) {
		const filename = filenameFrom(upstream.headers, current);
		const intercept = `<!doctype html><html><head><meta charset="utf-8"><title>Download</title></head>
<body><script>
parent.postMessage({ns:'veil',type:'download',tabId:${JSON.stringify(decoded.tabId)},url:${JSON.stringify(reqUrl.pathname + "?_dl=1")},filename:${JSON.stringify(filename)},mime:${JSON.stringify(upstream.headers.get("content-type") || "application/octet-stream")},size:${buf.byteLength}},'*');
<\/script><p style="font:14px system-ui;padding:2rem">Saving ${escapeHtml(filename)}…</p></body></html>`;
		const res = new Response(intercept, {
			status: 200,
			headers: {
				"content-type": "text/html; charset=utf-8",
				"cache-control": "no-store"
			}
		});
		for (const c of cookiesOut) res.headers.append("set-cookie", c);
		return res;
	}
	const ct = upstream.headers.get("content-type");
	if (sniffHtml(ct, finalUrl, buf.slice(0, 512))) {
		const html = new TextDecoder("utf-8", { fatal: false }).decode(buf);
		const stealth = cfg.stealth || cfg.fingerprintResist;
		const hook = buildClientHook({
			tabId: decoded.tabId,
			engine,
			realUrl: finalUrl,
			redirectedFrom: redirectedFrom && redirectedFrom !== finalUrl ? new URL(redirectedFrom).hostname : null,
			stealth,
			webrtcBlock: cfg.webrtcBlock || stealth,
			fingerprintResist: cfg.fingerprintResist || stealth,
			adblock: cfg.adblock,
			cosmetic: cfg.adblock ? BUILTIN_COSMETIC : []
		});
		const rewritten = rewriteHtml(html, finalUrl, engine, decoded.tabId, hook);
		outHeaders.set("content-type", "text/html; charset=utf-8");
		const res = new Response(rewritten, {
			status: upstream.status,
			headers: outHeaders
		});
		for (const c of cookiesOut) res.headers.append("set-cookie", c);
		return res;
	}
	if (isCss(ct, finalUrl)) {
		const css = rewriteCss(new TextDecoder().decode(buf), finalUrl, engine, decoded.tabId);
		outHeaders.set("content-type", "text/css; charset=utf-8");
		const res = new Response(css, {
			status: upstream.status,
			headers: outHeaders
		});
		for (const c of cookiesOut) res.headers.append("set-cookie", c);
		return res;
	}
	outHeaders.set("content-type", ct || "application/octet-stream");
	const res = new Response(buf, {
		status: upstream.status,
		headers: outHeaders
	});
	for (const c of cookiesOut) res.headers.append("set-cookie", c);
	return res;
}
async function handle({ request, params }) {
	return handleProxyRequest(request, params._splat ?? "");
}
var Route = createFileRoute("/p/$")({ server: { handlers: {
	GET: handle,
	POST: handle,
	PUT: handle,
	PATCH: handle,
	DELETE: handle,
	HEAD: handle,
	OPTIONS: handle
} } });
var rootRouteChildren = {
	IndexRoute: Route$3.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$4
	}),
	ApiSpeedRoute: Route$2.update({
		id: "/api/speed",
		path: "/api/speed",
		getParentRoute: () => Route$4
	}),
	ApiWsRoute: Route$1.update({
		id: "/api/ws",
		path: "/api/ws",
		getParentRoute: () => Route$4
	}),
	PSplatRoute: Route.update({
		id: "/p/$",
		path: "/p/$",
		getParentRoute: () => Route$4
	})
};
var routeTree = Route$4._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { ENGINES as i, encodeProxyPath as n, DEFAULT_NGINX_LAYER as r, router_exports as t };
