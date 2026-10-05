import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uid(prefix = ""): string {
  const id = Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  return prefix ? `${prefix}_${id}` : id;
}

export function looksLikeUrl(input: string): boolean {
  const v = input.trim();
  if (!v) return false;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(v)) return true;
  if (v.startsWith("localhost") || v.startsWith("127.0.0.1")) return true;
  if (/\s/.test(v)) return false;
  return /^(?:[\w-]+\.)+[a-z]{2,}(?:[/:?#].*)?$/i.test(v);
}

export function normalizeNavigableUrl(input: string, searchUrl: string): string {
  const raw = input.trim();
  if (!raw) return "";
  if (looksLikeUrl(raw)) {
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(raw)) return raw;
    return `https://${raw}`;
  }
  return searchUrl.replace("%s", encodeURIComponent(raw));
}

export function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export function prettyUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.host}${u.pathname}${u.search}${u.hash}`.replace(/\/$/, "") || u.host;
  } catch {
    return url;
  }
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatRelative(ts: number): string {
  const d = Date.now() - ts;
  const sec = Math.round(d / 1000);
  if (sec < 60) return "just now";
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(ts).toLocaleDateString();
}

export async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function letterMark(title: string): string {
  const t = title.replace(/^https?:\/\//, "").replace(/^www\./, "");
  const parts = t.split(/[./\s-]+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "V";
  const b = parts[1]?.[0] ?? parts[0]?.[1] ?? "";
  return (a + b).toUpperCase();
}
