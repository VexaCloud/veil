import { FiltersEngine, Request as AdRequest } from "@ghostery/adblocker";
import easylist from "./easylist-network.txt?raw";

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
  "[id*='taboola']",
  "[class*='taboola']",
  "[id*='outbrain']",
  "[class*='outbrain']",
];

let engine: FiltersEngine | null = null;

export function getAdblockEngine(): FiltersEngine {
  if (!engine) {
    engine = FiltersEngine.parse(easylist);
  }
  return engine;
}

function matchUrl(blocker: FiltersEngine, url: URL, sourceUrl?: string): boolean {
  const { match } = blocker.match(
    AdRequest.fromRawDetails({
      url: url.href,
      type: "xhr",
      sourceUrl: sourceUrl || url.origin + "/",
    }),
  );
  return match;
}

export function matchesNetworkFilter(
  url: URL,
  extraRules: string[] = [],
  sourceUrl?: string,
): boolean {
  try {
    if (matchUrl(getAdblockEngine(), url, sourceUrl)) return true;
    if (extraRules.length) {
      const extra = FiltersEngine.parse(extraRules.join("\n"));
      return matchUrl(extra, url, sourceUrl);
    }
    return false;
  } catch {
    return false;
  }
}

export function cosmeticSelectors(pageUrl: string, extraRules: string[] = []): string[] {
  try {
    const blocker = extraRules.length
      ? FiltersEngine.parse(`${easylist}\n${extraRules.join("\n")}`)
      : getAdblockEngine();
    const { hostname } = new URL(pageUrl);
    const result = blocker.getCosmeticsFilters({
      url: pageUrl,
      hostname,
      domain: hostname,
    });
    const styles = result.styles ?? "";
    const fromEngine = styles
      .split("}")
      .map((chunk) => chunk.split("{")[0]?.trim() ?? "")
      .filter(Boolean);
    return Array.from(new Set([...BUILTIN_COSMETIC, ...fromEngine])).slice(0, 400);
  } catch {
    return BUILTIN_COSMETIC;
  }
}
