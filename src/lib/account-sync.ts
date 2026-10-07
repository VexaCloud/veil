import { decryptString, encryptString } from "@/lib/crypto-box";
import { encryptionSecret, getSupabase } from "@/lib/supabase";
import type { StoredCookie } from "@/lib/proxy/cookies";
import { useBrowserStore, type Bookmark, type HistoryEntry, type SavedPassword, type Settings } from "@/lib/browser-store";

export async function hydrateCookieJar(userId: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const { data, error } = await sb
    .from("proxy_cookies")
    .select("domain,name,path,value_enc,expires,secure,http_only");
  if (error || !data) return;
  const secret = encryptionSecret(userId);
  const cookies: StoredCookie[] = [];
  for (const row of data) {
    try {
      cookies.push({
        name: row.name,
        value: await decryptString(row.value_enc, secret),
        domain: row.domain,
        path: row.path || "/",
        expires: row.expires ? Date.parse(row.expires) : undefined,
        secure: !!row.secure,
        httpOnly: !!row.http_only,
      });
    } catch {
      /* skip undecryptable */
    }
  }
  await fetch("/api/jar", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ cookies, userId }),
  });
}

export async function persistCookieRow(
  userId: string,
  cookie: { domain: string; name: string; path?: string; value: string },
): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const value_enc = await encryptString(cookie.value, encryptionSecret(userId));
  await sb.from("proxy_cookies").upsert(
    {
      user_id: userId,
      domain: cookie.domain,
      name: cookie.name,
      path: cookie.path || "/",
      value_enc,
    },
    { onConflict: "user_id,domain,name,path" },
  );
}

async function pullCloud(userId: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const secret = encryptionSecret(userId);
  const [settingsRes, bookmarksRes, historyRes, passwordsRes] = await Promise.all([
    sb.from("user_settings").select("payload_enc").eq("user_id", userId).maybeSingle(),
    sb.from("bookmarks").select("id,title,url_enc,folder").eq("user_id", userId),
    sb.from("history_entries").select("id,title,url_enc,visited_at").eq("user_id", userId).order("visited_at", { ascending: false }).limit(400),
    sb.from("saved_passwords").select("id,origin_enc,username_enc,password_enc,updated_at").eq("user_id", userId),
  ]);

  const patch: {
    settings?: Settings;
    bookmarks?: Bookmark[];
    history?: HistoryEntry[];
    passwords?: SavedPassword[];
  } = {};

  if (settingsRes.data?.payload_enc) {
    try {
      const parsed = JSON.parse(await decryptString(settingsRes.data.payload_enc, secret)) as Settings;
      if (parsed && typeof parsed === "object") {
        patch.settings = { ...useBrowserStore.getState().settings, ...parsed };
      }
    } catch {
      /* ignore */
    }
  }
  if (bookmarksRes.data) {
    const bookmarks: Bookmark[] = [];
    for (const row of bookmarksRes.data) {
      try {
        bookmarks.push({
          id: row.id,
          title: row.title,
          url: await decryptString(row.url_enc, secret),
          folder: row.folder ?? undefined,
        });
      } catch {
        /* skip */
      }
    }
    if (bookmarks.length) patch.bookmarks = bookmarks;
  }
  if (historyRes.data) {
    const history: HistoryEntry[] = [];
    for (const row of historyRes.data) {
      try {
        history.push({
          id: row.id,
          title: row.title,
          url: await decryptString(row.url_enc, secret),
          at: Date.parse(row.visited_at) || Date.now(),
        });
      } catch {
        /* skip */
      }
    }
    if (history.length) patch.history = history;
  }
  if (passwordsRes.data) {
    const passwords: SavedPassword[] = [];
    for (const row of passwordsRes.data) {
      try {
        passwords.push({
          id: row.id,
          origin: await decryptString(row.origin_enc, secret),
          username: await decryptString(row.username_enc, secret),
          password: await decryptString(row.password_enc, secret),
          updatedAt: Date.parse(row.updated_at) || Date.now(),
        });
      } catch {
        /* skip */
      }
    }
    if (passwords.length) patch.passwords = passwords;
  }

  if (Object.keys(patch).length) {
    useBrowserStore.setState(patch);
  }
}

async function pushCloud(userId: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const secret = encryptionSecret(userId);
  const s = useBrowserStore.getState();
  const payload_enc = await encryptString(JSON.stringify(s.settings), secret);
  await sb.from("user_settings").upsert({ user_id: userId, payload_enc, updated_at: new Date().toISOString() });

  await sb.from("bookmarks").delete().eq("user_id", userId);
  const bookmarkRows = await Promise.all(
    s.bookmarks.map(async (b) => ({
      user_id: userId,
      title: b.title,
      url_enc: await encryptString(b.url, secret),
      folder: b.folder ?? null,
    })),
  );
  if (bookmarkRows.length) await sb.from("bookmarks").insert(bookmarkRows);

  await sb.from("history_entries").delete().eq("user_id", userId);
  const historyRows = await Promise.all(
    s.history.slice(0, 200).map(async (h) => ({
      user_id: userId,
      title: h.title,
      url_enc: await encryptString(h.url, secret),
      visited_at: new Date(h.at).toISOString(),
    })),
  );
  if (historyRows.length) await sb.from("history_entries").insert(historyRows);

  await sb.from("saved_passwords").delete().eq("user_id", userId);
  const passwordRows = await Promise.all(
    s.passwords.map(async (p) => ({
      user_id: userId,
      origin_enc: await encryptString(p.origin, secret),
      username_enc: await encryptString(p.username, secret),
      password_enc: await encryptString(p.password, secret),
      updated_at: new Date(p.updatedAt).toISOString(),
    })),
  );
  if (passwordRows.length) await sb.from("saved_passwords").insert(passwordRows);
}

let unsub: (() => void) | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;

export async function startAccountSync(userId: string): Promise<void> {
  stopAccountSync();
  await Promise.all([hydrateCookieJar(userId), pullCloud(userId)]);
  unsub = useBrowserStore.subscribe((state, prev) => {
    if (state.session.kind !== "user") return;
    if (
      state.settings === prev.settings &&
      state.bookmarks === prev.bookmarks &&
      state.history === prev.history &&
      state.passwords === prev.passwords
    ) {
      return;
    }
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      void pushCloud(userId);
    }, 1400);
  });
}

export function stopAccountSync(): void {
  unsub?.();
  unsub = null;
  if (timer) clearTimeout(timer);
  timer = null;
}
