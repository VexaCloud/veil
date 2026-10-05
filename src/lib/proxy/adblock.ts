/** Compact built-in list (EasyList-inspired). Disabled unless the user turns blocking on. */
export const BUILTIN_NETWORK_FILTERS: string[] = [
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
  "pop-under",
];

export const BUILTIN_COSMETIC: string[] = [
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
  "ins.adsbygoogle",
];

export type CompiledFilters = {
  hosts: Set<string>;
  hostSuffixes: string[];
  pathIncludes: string[];
};

export function compileFilters(rules: string[]): CompiledFilters {
  const hosts = new Set<string>();
  const hostSuffixes: string[] = [];
  const pathIncludes: string[] = [];
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
  return { hosts, hostSuffixes, pathIncludes };
}

export function matchesNetworkFilter(url: URL, compiled: CompiledFilters): boolean {
  const host = url.hostname.toLowerCase();
  if (compiled.hosts.has(host)) return true;
  for (const suf of compiled.hostSuffixes) {
    if (host.endsWith(suf)) return true;
  }
  const hay = (host + url.pathname + url.search).toLowerCase();
  for (const p of compiled.pathIncludes) {
    if (p && hay.includes(p.replace(/^\//, ""))) {
      if (p.startsWith("/") && url.pathname.toLowerCase().includes(p.toLowerCase())) return true;
      if (!p.startsWith("/") && hay.includes(p)) return true;
    }
  }
  return false;
}
