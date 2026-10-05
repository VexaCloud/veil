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
    if (!s || isSpecial(s) || s.startsWith(PREFIX)) return s;
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
        const host = loc.hostname.replace(/\\./g, "_");
        const keep = [];
        raw.split(";").forEach((p) => {
          const t = p.trim();
          const marker = "v_" + cfg.tabId + "_" + host + "_";
          if (t.startsWith(marker)) {
            const rest = t.slice(marker.length);
            keep.push(rest);
          }
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
      const raw = a.getAttribute("href") || "";
      emit("open", { url: raw.startsWith(PREFIX) ? loc.href : new URL(raw, loc.href).href });
      return;
    }
  }, true);

  document.addEventListener("submit", function(ev) {
    const form = ev.target;
    if (!form || !form.action) return;
    try {
      const action = form.getAttribute("action") || loc.href;
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

  if (cfg.webrtcBlock || cfg.stealth) {
    try {
      const origRtc = window.RTCPeerConnection;
      window.RTCPeerConnection = function() { throw new Error("WebRTC disabled"); };
      if (origRtc) window.RTCPeerConnection.prototype = origRtc.prototype;
      window.webkitRTCPeerConnection = window.RTCPeerConnection;
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia = function() { return Promise.reject(new Error("blocked")); };
      }
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

  let inspectOn = false;
  let lastEl = null;
  const tip = document.createElement("div");
  tip.style.cssText = "position:fixed;z-index:2147483646;pointer-events:none;background:#0b0c0e;color:#eceef2;border:1px solid #2a2d34;padding:4px 8px;font:12px/1.3 ui-monospace,monospace;border-radius:6px;display:none;";
  function outline(el, on) {
    if (!el || !el.style) return;
    el.style.outline = on ? "2px solid #8fa3c4" : "";
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
  window.addEventListener("message", function(ev) {
    const d = ev.data;
    if (!d || d.ns !== "veil") return;
    if (d.type === "inspect") inspectOn = !!d.on;
    if (d.type === "autofill") applyAutofill(d.passwords);
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
