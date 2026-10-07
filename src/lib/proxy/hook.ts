import type { EngineId } from "./types";

export type HookConfig = {
  tabId: string;
  engine: EngineId;
  realUrl: string;
  redirectedFrom: string | null;
  stealth: boolean;
  webrtcBlock: boolean;
  fingerprintResist: boolean;
  adblock: boolean;
  cosmetic: string[];
};

export function buildClientHook(cfg: HookConfig): string {
  const json = JSON.stringify(cfg).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028");
  return `(() => {
  if (window.__veilHooked) return;
  window.__veilHooked = true;
  const cfg = ${json};
  const PREFIX = "/p/";
  const UV_KEY = "veil-uv-codec";
  const SJ_KEY = "veil-sj-codec";
  const STEALTH_MARK = "x.";
  const URL_ATTRS = {href:1,src:1,action:1,poster:1,formaction:1,cite:1,background:1,"data-src":1,"data-href":1,"data-original":1,"data-lazy-src":1,"xlink:href":1,data:1};
  const ORIG = "__veil_orig_";

  function b64urlEncode(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = "";
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\\+/g, "-").replace(/\\//g, "_").replace(/=+$/g, "");
  }
  function b64urlDecode(s) {
    const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
    const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
    const bin = atob(b64);
    let out = "";
    for (let i = 0; i < bin.length; i++) out += bin[i];
    return out;
  }
  function xorStr(str, key) {
    let out = "";
    for (let i = 0; i < str.length; i++) out += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    return out;
  }
  function xorB64(str, key) {
    return btoa(xorStr(str, key)).replace(/\\+/g, "-").replace(/\\//g, "_").replace(/=+$/g, "");
  }
  function xorB64Decode(str, key) {
    return xorStr(b64urlDecode(str), key);
  }
  function xorHex(str, key) {
    let hex = "";
    for (let i = 0; i < str.length; i++) hex += (str.charCodeAt(i) ^ key.charCodeAt(i % key.length)).toString(16).padStart(2, "0");
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
    if (cfg.stealth) rest = STEALTH_MARK + xorB64(noHash, UV_KEY);
    else if (cfg.engine === "ultraviolet") rest = xorB64(noHash, UV_KEY);
    else if (cfg.engine === "mercury") rest = b64urlEncode(noHash);
    else if (cfg.engine === "scramjet") rest = xorHex(noHash, SJ_KEY);
    else rest = pathStyle(noHash);
    return PREFIX + code + "/" + cfg.tabId + "/" + rest + hash;
  }
  function isSpecial(u) {
    return /^(javascript:|data:|blob:|mailto:|tel:|about:|#)/i.test(u);
  }
  function decodeProxyUrl(s) {
    if (!s) return null;
    try {
      const u = new URL(String(s), location.origin);
      if (u.origin !== location.origin || u.pathname.indexOf(PREFIX) !== 0) return null;
      const parts = u.pathname.slice(PREFIX.length).split("/");
      const rest = parts.slice(2).join("/");
      if (!rest) return null;
      if (rest.indexOf("https/") === 0) return "https://" + rest.slice(6) + u.search + u.hash;
      if (rest.indexOf("http/") === 0) return "http://" + rest.slice(5) + u.search + u.hash;
      const blob = rest.split("/")[0];
      let decoded;
      if (blob.indexOf(STEALTH_MARK) === 0) decoded = xorB64Decode(blob.slice(STEALTH_MARK.length), UV_KEY);
      else if (cfg.engine === "ultraviolet") decoded = xorB64Decode(blob, UV_KEY);
      else if (cfg.engine === "mercury") decoded = b64urlDecode(blob);
      else if (cfg.engine === "scramjet") {
        let out = "";
        for (let i = 0; i < blob.length; i += 2) out += String.fromCharCode(parseInt(blob.slice(i, i+2), 16) ^ SJ_KEY.charCodeAt((i/2) % SJ_KEY.length));
        decoded = out;
      }
      if (!decoded) return null;
      const extra = rest.split("/").slice(1).join("/");
      if (extra) return new URL(extra, decoded.endsWith("/") ? decoded : decoded + "/").href;
      return decoded;
    } catch (e) { return null; }
  }
  function rewrite(u, base) {
    if (u == null) return u;
    const s = String(u);
    if (!s || isSpecial(s)) return s;
    if (s.startsWith(PREFIX) || (s.indexOf(location.origin + PREFIX) === 0)) return s;
    try {
      const abs = new URL(s, base || cfg.realUrl);
      if (abs.origin === location.origin && abs.pathname.indexOf(PREFIX) !== 0) {
        return encodeTarget(new URL(abs.pathname + abs.search + abs.hash, cfg.realUrl).href);
      }
      if (abs.protocol !== "http:" && abs.protocol !== "https:") return s;
      return encodeTarget(abs.href);
    } catch { return s; }
  }
  function reveal(u) {
    if (u == null) return u;
    const decoded = decodeProxyUrl(u);
    if (decoded) return decoded;
    try {
      const abs = new URL(String(u), location.href);
      if (abs.origin === location.origin && abs.pathname.indexOf(PREFIX) !== 0 && !isSpecial(abs.pathname)) {
        return new URL(abs.pathname + abs.search + abs.hash, cfg.realUrl).href;
      }
    } catch (e) {}
    return u;
  }

  function emit(type, payload) {
    try { parent.postMessage(Object.assign({ ns: "veil", type, tabId: cfg.tabId }, payload || {}), "*"); }
    catch (e) {}
  }

  const loc = new URL(cfg.realUrl);
  function syncLoc(href) {
    try { const n = new URL(href, loc.href); loc.href = n.href; cfg.realUrl = n.href; window.__veilLoc = locationShim; }
    catch (e) {}
  }
  const realLoc = window.location;
  function navigate(v, replace) {
    const abs = new URL(v, loc.href).href;
    const next = rewrite(abs);
    emit("navigate", { url: abs, replace: !!replace });
    if (replace) realLoc.replace(next);
    else realLoc.assign(next);
  }
  const locationShim = {
    get href() { return loc.href; },
    set href(v) { navigate(v, false); },
    get protocol() { return loc.protocol; },
    set protocol(v) { loc.protocol = v; navigate(loc.href, false); },
    get host() { return loc.host; },
    set host(v) { loc.host = v; navigate(loc.href, false); },
    get hostname() { return loc.hostname; },
    set hostname(v) { loc.hostname = v; navigate(loc.href, false); },
    get port() { return loc.port; },
    get pathname() { return loc.pathname; },
    set pathname(v) { loc.pathname = v; navigate(loc.href, false); },
    get search() { return loc.search; },
    set search(v) { loc.search = v; navigate(loc.href, false); },
    get hash() { return loc.hash; },
    set hash(v) { loc.hash = v; },
    get origin() { return loc.origin; },
    assign(v) { navigate(v, false); },
    replace(v) { navigate(v, true); },
    reload() { realLoc.reload(); },
    toString() { return loc.href; },
    valueOf() { return loc.href; },
    ancestorOrigins: { length: 0, item: function() { return null; } }
  };
  window.__veilLoc = locationShim;

  try {
    Object.defineProperty(window, "parent", { configurable: true, get() { return window; } });
    Object.defineProperty(window, "top", { configurable: true, get() { return window; } });
    Object.defineProperty(window, "frameElement", { configurable: true, get() { return null; } });
    Object.defineProperty(window, "opener", { configurable: true, get() { return null; } });
    Object.defineProperty(window, "origin", { configurable: true, get() { return loc.origin; } });
  } catch (e) {}
  try {
    const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
    Object.defineProperty(navigator, "userAgent", { configurable: true, get() { return ua; } });
    Object.defineProperty(navigator, "appVersion", { configurable: true, get() { return "5.0 (Windows)"; } });
    Object.defineProperty(navigator, "vendor", { configurable: true, get() { return "Google Inc."; } });
    Object.defineProperty(navigator, "webdriver", { configurable: true, get() { return undefined; } });
  } catch (e) {}

  try {
    const desc = Object.getOwnPropertyDescriptor(window, "location") || Object.getOwnPropertyDescriptor(Window.prototype, "location");
    if (desc && desc.configurable) {
      Object.defineProperty(window, "location", { configurable: true, get() { return locationShim; }, set(v) { navigate(v, false); } });
    }
  } catch (e) {}
  try {
    Object.defineProperty(document, "location", { configurable: true, get() { return locationShim; }, set(v) { navigate(v, false); } });
  } catch (e) {}
  try {
    Object.defineProperty(document, "URL", { configurable: true, get() { return loc.href; } });
    Object.defineProperty(document, "documentURI", { configurable: true, get() { return loc.href; } });
    Object.defineProperty(document, "baseURI", { configurable: true, get() { return loc.href; } });
    Object.defineProperty(document, "domain", { configurable: true, get() { return loc.hostname; }, set() {} });
    Object.defineProperty(document, "referrer", { configurable: true, get() { return cfg.redirectedFrom || loc.origin + "/"; } });
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

  const ns = "__veil_ls_" + cfg.tabId + "_" + loc.hostname + "_";
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

  const cookieJar = {};
  Object.defineProperty(document, "cookie", {
    configurable: true,
    get() {
      return Object.keys(cookieJar).map((k) => k + "=" + cookieJar[k]).join("; ");
    },
    set(v) {
      const first = String(v).split(";")[0];
      const eq = first.indexOf("=");
      if (eq < 0) return;
      const name = first.slice(0, eq).trim();
      const value = first.slice(eq + 1).trim();
      cookieJar[name] = value;
      emit("cookie", { cookie: String(v), url: loc.href });
    }
  });

  const origFetch = window.fetch.bind(window);
  const OrigRequest = window.Request;
  window.Request = function(input, init) {
    try {
      if (typeof input === "string" || (typeof URL !== "undefined" && input instanceof URL)) {
        return new OrigRequest(rewrite(String(input)), init);
      }
      if (input instanceof OrigRequest) {
        const next = rewrite(input.url);
        return new OrigRequest(next, init || input);
      }
    } catch (e) {}
    return new OrigRequest(input, init);
  };
  window.Request.prototype = OrigRequest.prototype;
  try {
    Object.keys(OrigRequest).forEach(function(k) {
      try { window.Request[k] = OrigRequest[k]; } catch (e) {}
    });
  } catch (e) {}

  window.fetch = function(input, init) {
    const req = input instanceof OrigRequest ? input : null;
    let url = req ? req.url : (typeof input === "string" ? input : (input && (input.href || input.url)) || String(input));
    const revealed = reveal(url);
    const next = rewrite(revealed);
    const headers = new Headers((init && init.headers) || (req && req.headers) || undefined);
    headers.set("X-Veil-Page", loc.href);
    const t0 = performance.now();
    emit("net", { phase: "start", method: (init && init.method) || (req && req.method) || "GET", url: String(revealed) });
    const p = req
      ? origFetch(new OrigRequest(next, req), init ? Object.assign({}, init, { headers }) : { headers })
      : origFetch(next, Object.assign({}, init || {}, { headers }));
    return p.then((res) => {
      emit("net", { phase: "end", url: String(revealed), status: res.status, ms: Math.round(performance.now() - t0) });
      try {
        Object.defineProperty(res, "url", { configurable: true, get() { return revealed; } });
      } catch (e) {}
      return res;
    }, (err) => {
      emit("net", { phase: "error", url: String(revealed), error: String(err) });
      throw err;
    });
  };

  const OrigXHR = window.XMLHttpRequest;
  function WrappedXHR() {
    const xhr = new OrigXHR();
    let real = "";
    const open = xhr.open;
    xhr.open = function(method, url) {
      real = reveal(String(url));
      const args = Array.prototype.slice.call(arguments);
      args[1] = rewrite(real);
      emit("net", { phase: "start", method: method, url: real });
      const ret = open.apply(xhr, args);
      try { xhr.setRequestHeader("X-Veil-Page", loc.href); } catch (e) {}
      return ret;
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
    window.EventSource = function(url, opts) { return new OrigES(rewrite(url), opts); };
    window.EventSource.prototype = OrigES.prototype;
  }
  if (navigator.sendBeacon) {
    const origBeacon = navigator.sendBeacon.bind(navigator);
    navigator.sendBeacon = function(url, data) { return origBeacon(rewrite(url), data); };
  }

  try {
    const OrigWorker = window.Worker;
    window.Worker = function(url, opts) { return new OrigWorker(rewrite(url), opts); };
    window.Worker.prototype = OrigWorker.prototype;
  } catch (e) {}
  try {
    if (window.SharedWorker) {
      const OrigSW = window.SharedWorker;
      window.SharedWorker = function(url, opts) { return new OrigSW(rewrite(url), opts); };
      window.SharedWorker.prototype = OrigSW.prototype;
    }
  } catch (e) {}
  try {
    if (navigator.serviceWorker) {
      navigator.serviceWorker.register = function() { return Promise.reject(new Error("Service workers are blocked in Veil")); };
      navigator.serviceWorker.getRegistrations().then(function(rs) { rs.forEach(function(r) { r.unregister(); }); }).catch(function() {});
    }
  } catch (e) {}

  const origOpen = window.open;
  window.open = function(url, name, specs) {
    if (!url) return origOpen.call(window, url, name, specs);
    emit("open", { url: new URL(url, loc.href).href });
    return origOpen.call(window, rewrite(url), name, specs);
  };

  function wrapAttr(proto, prop) {
    const desc = Object.getOwnPropertyDescriptor(proto, prop);
    if (!desc || !desc.set || !desc.configurable) return;
    Object.defineProperty(proto, prop, {
      configurable: true,
      enumerable: desc.enumerable,
      get() {
        if (this[ORIG + prop] != null) return this[ORIG + prop];
        const actual = desc.get ? desc.get.call(this) : "";
        return reveal(actual);
      },
      set(v) {
        this[ORIG + prop] = v;
        desc.set.call(this, rewrite(v));
      }
    });
  }
  [
    [HTMLAnchorElement, "href"],
    [HTMLImageElement, "src"],
    [HTMLScriptElement, "src"],
    [HTMLIFrameElement, "src"],
    [HTMLSourceElement, "src"],
    [HTMLVideoElement, "src"],
    [HTMLAudioElement, "src"],
    [HTMLEmbedElement, "src"],
    [HTMLMediaElement, "src"],
    [HTMLInputElement, "src"],
    [HTMLLinkElement, "href"],
    [HTMLFormElement, "action"],
    [HTMLObjectElement, "data"]
  ].forEach(function(pair) {
    try { wrapAttr(pair[0].prototype, pair[1]); } catch (e) {}
  });
  try { wrapAttr(HTMLImageElement.prototype, "srcset"); } catch (e) {}
  try { wrapAttr(HTMLSourceElement.prototype, "srcset"); } catch (e) {}

  const origSetAttr = Element.prototype.setAttribute;
  const origGetAttr = Element.prototype.getAttribute;
  Element.prototype.setAttribute = function(name, value) {
    const n = String(name).toLowerCase();
    if (URL_ATTRS[n] || n === "srcset" || n === "imagesrcset" || (n.indexOf("data-") === 0 && /src|href|url/.test(n))) {
      this[ORIG + n] = value;
      value = rewrite(value);
    }
    return origSetAttr.call(this, name, value);
  };
  Element.prototype.getAttribute = function(name) {
    const n = String(name).toLowerCase();
    if (this[ORIG + n] != null) return this[ORIG + n];
    const v = origGetAttr.call(this, name);
    return reveal(v);
  };

  const origInner = Object.getOwnPropertyDescriptor(Element.prototype, "innerHTML");
  if (origInner && origInner.set) {
    Object.defineProperty(Element.prototype, "innerHTML", {
      configurable: true,
      enumerable: origInner.enumerable,
      get: origInner.get,
      set(html) {
        origInner.set.call(this, html);
        rewriteTree(this);
      }
    });
  }

  function rewriteNode(el) {
    if (!el || el.nodeType !== 1) return;
    for (const name of ["src", "href", "action", "poster", "formaction", "data-src", "data-href", "srcset"]) {
      if (!el.getAttribute) continue;
      const stored = el[ORIG + name];
      if (stored != null) continue;
      const v = origGetAttr.call(el, name);
      if (!v || isSpecial(v) || String(v).startsWith("data:")) continue;
      if (String(v).startsWith(PREFIX) || String(v).indexOf(location.origin + PREFIX) === 0) {
        el[ORIG + name] = reveal(v);
        continue;
      }
      el[ORIG + name] = v;
      origSetAttr.call(el, name, rewrite(v));
    }
  }
  function rewriteTree(root) {
    if (!root) return;
    rewriteNode(root);
    if (root.querySelectorAll) {
      root.querySelectorAll("[src],[href],[action],[poster],[data-src],[srcset]").forEach(rewriteNode);
    }
  }

  const mo = new MutationObserver(function(muts) {
    muts.forEach(function(m) {
      if (m.type === "attributes" && m.target) rewriteNode(m.target);
      if (m.type === "childList") m.addedNodes.forEach(function(n) { rewriteTree(n); });
    });
  });
  const startMo = function() {
    if (document.documentElement) mo.observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ["src","href","action","poster","srcset","data-src","data-href"] });
    rewriteTree(document);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", startMo);
  else startMo();

  document.addEventListener("click", function(ev) {
    const a = ev.target && ev.target.closest ? ev.target.closest("a") : null;
    if (!a || !a.href) return;
    if (a.hasAttribute("download")) {
      ev.preventDefault();
      emit("download", { url: a.getAttribute("href") || a.href, filename: a.getAttribute("download") || "" });
      return;
    }
    if (a.target === "_blank" || ev.metaKey || ev.ctrlKey) {
      ev.preventDefault();
      const raw = a.getAttribute("href") || "";
      emit("open", { url: raw.startsWith(PREFIX) ? (decodeProxyUrl(raw) || loc.href) : new URL(raw, loc.href).href });
      return;
    }
  }, true);

  document.addEventListener("contextmenu", function(ev) {
    if (ev.shiftKey) return;
    ev.preventDefault();
    emit("contextmenu", { x: ev.clientX, y: ev.clientY, shift: ev.shiftKey });
  }, true);

  document.addEventListener("submit", function(ev) {
    const form = ev.target;
    if (!form || !form.action) return;
    try {
      const action = origGetAttr.call(form, "action") || loc.href;
      if (!String(action).startsWith(PREFIX)) form.action = rewrite(action);
      const pwd = form.querySelector && form.querySelector("input[type=password]");
      const user = form.querySelector && form.querySelector("input[type=email], input[name=username], input[name=email], input[autocomplete=username]");
      if (pwd && pwd.value) {
        emit("save-password", {
          origin: loc.origin,
          username: user && user.value ? user.value : "",
          password: pwd.value
        });
      }
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

  try {
    const titleDesc = Object.getOwnPropertyDescriptor(Document.prototype, "title");
    if (titleDesc && titleDesc.set) {
      Object.defineProperty(document, "title", {
        configurable: true,
        enumerable: true,
        get() { return titleDesc.get.call(this); },
        set(v) { titleDesc.set.call(this, v); reportTitle(); }
      });
    }
  } catch (e) {}

  function faviconHref() {
    const link = document.querySelector("link[rel*='icon']");
    if (link) {
      const raw = origGetAttr.call(link, "href") || link.href;
      return raw && String(raw).startsWith(PREFIX) ? (location.origin + raw) : rewrite(raw || (loc.origin + "/favicon.ico"));
    }
    return rewrite(loc.origin + "/favicon.ico");
  }
  function reportTitle() {
    emit("meta", { title: document.title || loc.hostname, url: loc.href, redirectedFrom: cfg.redirectedFrom, favicon: faviconHref() });
  }
  const obs = new MutationObserver(reportTitle);
  const startObs = function() {
    if (document.documentElement) obs.observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["href"] });
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

  if (cfg.webrtcBlock || cfg.stealth) {
    try {
      const origRtc = window.RTCPeerConnection;
      window.RTCPeerConnection = function() { throw new Error("WebRTC disabled"); };
      if (origRtc) window.RTCPeerConnection.prototype = origRtc.prototype;
      window.webkitRTCPeerConnection = window.RTCPeerConnection;
    } catch (e) {}
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
      Object.defineProperty(navigator, "vendor", { get() { return "Google Inc."; } });
      Object.defineProperty(navigator, "plugins", { get() { return [{ name: "Chrome PDF Plugin" }, { name: "Chrome PDF Viewer" }, { name: "Native Client" }]; } });
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

  try { Object.defineProperty(navigator, "webdriver", { get() { return undefined; } }); } catch (e) {}

  let inspectOn = false;
  let lastEl = null;
  const tip = document.createElement("div");
  tip.style.cssText = "position:fixed;z-index:2147483646;pointer-events:none;background:#202124;color:#e8eaed;border:1px solid #5f6368;padding:4px 8px;font:12px/1.3 ui-monospace,monospace;border-radius:6px;display:none;";
  function outline(el, on) {
    if (!el || !el.style) return;
    el.style.outline = on ? "2px solid #1a73e8" : "";
  }
  function applyAutofill(list) {
    if (!Array.isArray(list) || !list.length) return;
    const hit = list.find(function(p) {
      try { return new URL(p.origin).origin === loc.origin || loc.href.indexOf(p.origin) === 0; }
      catch { return p.origin === loc.origin; }
    }) || list[0];
    if (!hit) return;
    document.querySelectorAll("input").forEach(function(input) {
      const type = (input.type || "").toLowerCase();
      const auto = (input.autocomplete || input.name || input.id || "").toLowerCase();
      if (type === "password") input.value = hit.password;
      else if (type === "email" || type === "username" || /user|email|login|account/.test(auto)) {
        if (!input.value) input.value = hit.username;
      }
    });
  }
  function dumpSource() {
    emit("source", { html: document.documentElement ? document.documentElement.outerHTML : "" });
  }
  window.addEventListener("message", function(ev) {
    const d = ev.data;
    if (!d || d.ns !== "veil") return;
    if (d.type === "inspect") inspectOn = !!d.on;
    if (d.type === "autofill") applyAutofill(d.passwords);
    if (d.type === "source") dumpSource();
    if (d.type === "apply-html" && typeof d.html === "string") {
      try { document.open(); document.write(d.html); document.close(); } catch (e) {}
    }
    if (d.type === "edit-html" && lastEl && typeof d.html === "string") {
      try { lastEl.outerHTML = d.html; } catch (e) {}
    }
    if (d.type === "eval") {
      try {
        const r = (0, eval)(d.code);
        emit("console", { level: "info", args: [String(r)] });
      } catch (err) {
        emit("console", { level: "error", args: [String(err)] });
      }
    }
    if (d.type === "edit-style" && lastEl) {
      try { lastEl.setAttribute("style", d.style || ""); } catch (e) {}
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
      html: el ? el.outerHTML.slice(0, 8000) : "",
      tag: el ? el.tagName : "",
      styles: cs ? {
        display: cs.display, color: cs.color, background: cs.backgroundColor, font: cs.font,
        width: cs.width, height: cs.height, margin: cs.margin, padding: cs.padding, position: cs.position
      } : null
    });
  }, true);

  emit("ready", { url: loc.href, redirectedFrom: cfg.redirectedFrom, title: document.title || loc.hostname, favicon: faviconHref() });
})();`;
}
