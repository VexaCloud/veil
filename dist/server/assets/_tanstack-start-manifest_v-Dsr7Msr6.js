//#region \0tanstack-start-manifest:v
var tsrStartManifest = () => ({ routes: {
	__root__: {
		filePath: "/workspaces/veil/src/routes/__root.tsx",
		children: [
			"/",
			"/$",
			"/api/jar",
			"/api/speed",
			"/api/ws",
			"/p/$"
		],
		preloads: ["/assets/index-DLLgGgzC.js"],
		scripts: [{ attrs: {
			type: "module",
			async: !0,
			src: "/assets/index-DLLgGgzC.js"
		} }]
	},
	"/": {
		filePath: "/workspaces/veil/src/routes/index.tsx",
		children: void 0,
		preloads: ["/assets/routes-BeX3G7Lq.js"]
	}
} });
//#endregion
export { tsrStartManifest };
