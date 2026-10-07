export const INTERNAL_SCHEME = "veil:";

export const INTERNAL_PAGES = [
  { host: "newtab", title: "New tab", path: "veil://newtab" },
  { host: "settings", title: "Settings", path: "veil://settings" },
  { host: "history", title: "History", path: "veil://history" },
  { host: "downloads", title: "Downloads", path: "veil://downloads" },
  { host: "bookmarks", title: "Bookmarks", path: "veil://bookmarks" },
  { host: "files", title: "Files", path: "veil://files" },
  { host: "shortcuts", title: "Keyboard shortcuts", path: "veil://shortcuts" },
  { host: "passwords", title: "Passwords", path: "veil://passwords" },
  { host: "about", title: "About", path: "veil://about" },
] as const;

export type InternalHost = (typeof INTERNAL_PAGES)[number]["host"];

export function parseInternal(url: string): { host: InternalHost; rest: string } | null {
  const raw = url.trim();
  if (!raw.toLowerCase().startsWith("veil://")) return null;
  const body = raw.slice("veil://".length);
  const cut = body.search(/[/?#]/);
  const host = (cut < 0 ? body : body.slice(0, cut)).toLowerCase().replace(/\/+$/, "");
  const rest = cut < 0 ? "" : body.slice(cut);
  const known = INTERNAL_PAGES.find((p) => p.host === host);
  if (!known) return null;
  return { host: known.host, rest };
}

export function isInternalUrl(url: string): boolean {
  return parseInternal(url) != null;
}

export function internalTitle(url: string): string {
  const parsed = parseInternal(url);
  if (!parsed) return "Veil";
  return INTERNAL_PAGES.find((p) => p.host === parsed.host)?.title ?? "Veil";
}
