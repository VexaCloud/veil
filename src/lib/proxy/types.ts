export const ENGINE_IDS = [
  "nginx",
  "ultraviolet",
  "mercury",
  "scramjet",
  "rammerhead",
] as const;

export type EngineId = (typeof ENGINE_IDS)[number];

export type EngineInfo = {
  id: EngineId;
  code: string;
  name: string;
  tagline: string;
  description: string;
};

export const ENGINES: Record<EngineId, EngineInfo> = {
  nginx: {
    id: "nginx",
    code: "n",
    name: "NGINX",
    tagline: "Reverse proxy",
    description:
      "Path-style reverse proxy with an NGINX-inspired header and SSL config layer. Default engine.",
  },
  ultraviolet: {
    id: "ultraviolet",
    code: "u",
    name: "Ultraviolet",
    tagline: "XOR codec",
    description:
      "Titanium-style encoded URLs, aggressive client hooks, and Chrome TLS fingerprinting.",
  },
  mercury: {
    id: "mercury",
    code: "m",
    name: "Mercury",
    tagline: "Base64 codec",
    description: "Compact base64url paths with rewritten assets and isolated sessions.",
  },
  scramjet: {
    id: "scramjet",
    code: "s",
    name: "Scramjet",
    tagline: "XOR+hex codec",
    description: "Scramjet-style hex encoding with extra anti-detection rewrites.",
  },
  rammerhead: {
    id: "rammerhead",
    code: "r",
    name: "Rammerhead",
    tagline: "Session proxy",
    description: "Per-tab session identity with sticky cookies and header mirroring.",
  },
};

export type NginxLayer = {
  sslServerName: boolean;
  forwardFor: boolean;
  hidePoweredBy: boolean;
  hideServer: boolean;
  extraRequestHeaders: Record<string, string>;
  extraHideHeaders: string[];
  userAgentOverride: string;
};

export const DEFAULT_NGINX_LAYER: NginxLayer = {
  sslServerName: true,
  forwardFor: false,
  hidePoweredBy: true,
  hideServer: true,
  extraRequestHeaders: {},
  extraHideHeaders: ["x-powered-by", "server", "via", "x-cache", "cf-ray"],
  userAgentOverride: "",
};

export type ProxyCfg = {
  adblock: boolean;
  stealth: boolean;
  webrtcBlock: boolean;
  fingerprintResist: boolean;
  engine: EngineId;
  nginx: NginxLayer;
};

export type RewriteContext = {
  tabId: string;
  engine: EngineId;
  pageUrl: string;
  prefix: string;
  stealth: boolean;
  adblock: boolean;
};

export const PROXY_PREFIX = "/p";
