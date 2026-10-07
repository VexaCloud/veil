import { decryptString, encryptString } from "@/lib/crypto-box";
import type { StoredCookie } from "./cookies";
import { upsertCookie } from "./cookies";

type JarRecord = {
  cookies: StoredCookie[];
  userId: string | null;
  updatedAt: number;
};

const memory = new Map<string, JarRecord>();

export function getMemoryJar(sid: string): StoredCookie[] {
  const rec = memory.get(sid);
  if (!rec) return [];
  const now = Date.now();
  rec.cookies = rec.cookies.filter((c) => !c.expires || c.expires > now);
  return rec.cookies;
}

export function setMemoryJar(sid: string, cookies: StoredCookie[], userId: string | null): void {
  memory.set(sid, { cookies, userId, updatedAt: Date.now() });
}

export function mergeMemoryCookie(sid: string, cookie: StoredCookie, userId: string | null): StoredCookie[] {
  const next = upsertCookie(getMemoryJar(sid), cookie);
  setMemoryJar(sid, next, userId);
  return next;
}

export async function encodeJarBlob(cookies: StoredCookie[], secret: string): Promise<string> {
  return encryptString(JSON.stringify(cookies), secret);
}

export async function decodeJarBlob(blob: string, secret: string): Promise<StoredCookie[]> {
  try {
    const json = await decryptString(blob, secret);
    const parsed = JSON.parse(json) as StoredCookie[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function readCfgCookie(request: Request): {
  adblock: boolean;
  stealth: boolean;
  webrtcBlock: boolean;
  fingerprintResist: boolean;
  engine: string;
  nginx: Record<string, unknown>;
  extraFilters: string[];
} {
  const raw = request.headers.get("cookie") ?? "";
  const match = /(?:^|;\s*)veil_cfg=([^;]+)/.exec(raw);
  const extraMatch = /(?:^|;\s*)veil_filters=([^;]+)/.exec(raw);
  let extraFilters: string[] = [];
  if (extraMatch) {
    try {
      const parsed = JSON.parse(decodeURIComponent(extraMatch[1]!));
      extraFilters = Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      extraFilters = [];
    }
  }
  if (!match) {
    return {
      adblock: true,
      stealth: false,
      webrtcBlock: false,
      fingerprintResist: false,
      engine: "nginx",
      nginx: {},
      extraFilters,
    };
  }
  try {
    const parsed = JSON.parse(decodeURIComponent(match[1]!)) as Record<string, unknown>;
    return {
      adblock: !!parsed.adblock,
      stealth: !!parsed.stealth,
      webrtcBlock: !!parsed.webrtcBlock,
      fingerprintResist: !!parsed.fingerprintResist,
      engine: typeof parsed.engine === "string" ? parsed.engine : "nginx",
      nginx: (parsed.nginx as Record<string, unknown>) ?? {},
      extraFilters,
    };
  } catch {
    return {
      adblock: false,
      stealth: false,
      webrtcBlock: false,
      fingerprintResist: false,
      engine: "nginx",
      nginx: {},
      extraFilters,
    };
  }
}
