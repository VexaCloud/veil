//#region src/lib/proxy/types.ts
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
//#endregion
export { ENGINES as n, DEFAULT_NGINX_LAYER as t };
