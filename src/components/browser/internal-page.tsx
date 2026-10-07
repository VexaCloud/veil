import { useRef, useState, type ReactNode } from "react";
import {
  Bookmark,
  Download,
  Folder,
  Globe,
  History,
  Paintbrush,
  Shield,
  SlidersHorizontal,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ENGINES, type EngineId } from "@/lib/proxy/types";
import { currentSearchEngine, useBrowserStore, type ThemeId } from "@/lib/browser-store";
import { parseInternal, type InternalHost } from "@/lib/internal";
import { comboFromEvent, DEFAULT_SHORTCUTS } from "@/lib/shortcuts";
import { downloadJson, formatBytes, formatRelative, uid } from "@/lib/utils";
import { NewTab } from "./new-tab";
import { toast } from "sonner";
import JSZip from "jszip";

export function InternalPage({ url, onGo }: { url: string; onGo: (url: string) => void }) {
  const parsed = parseInternal(url);
  const host = parsed?.host ?? "newtab";
  if (host === "newtab") return <NewTab onGo={onGo} />;
  if (host === "settings") return <SettingsPage />;
  if (host === "history") return <HistoryPage onGo={onGo} />;
  if (host === "downloads") return <DownloadsPage />;
  if (host === "bookmarks") return <BookmarksPage onGo={onGo} />;
  if (host === "files") return <FilesPage />;
  if (host === "shortcuts") return <ShortcutsPage />;
  if (host === "passwords") return <PasswordsPage />;
  if (host === "about") return <AboutPage />;
  return <NewTab onGo={onGo} />;
}

export function openInternal(host: InternalHost) {
  useBrowserStore.getState().newTab(`veil://${host}`);
}

function SettingsPage() {
  const [section, setSection] = useState("general");
  const settings = useBrowserStore((s) => s.settings);
  const session = useBrowserStore((s) => s.session);
  const patchSettings = useBrowserStore((s) => s.patchSettings);
  const setTheme = useBrowserStore((s) => s.setTheme);
  const applyStealth = useBrowserStore((s) => s.applyStealth);
  const guest = session.kind === "guest";

  const nav = [
    { id: "general", label: "General", icon: SlidersHorizontal },
    { id: "appearance", label: "Appearance", icon: Paintbrush },
    { id: "proxy", label: "Proxy", icon: Globe },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "about", label: "About", icon: Bookmark },
  ];

  return (
    <div className="flex h-full min-h-0 bg-surface">
      <nav className="hidden w-56 shrink-0 flex-col gap-1 overflow-auto border-r border-border p-3 sm:flex">
        {nav.map((n) => {
          const Icon = n.icon;
          const on = section === n.id;
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => setSection(n.id)}
              className={`flex h-11 items-center gap-2 rounded-lg px-3 text-sm ${on ? "bg-surface-2 font-medium" : "text-muted hover:bg-surface-2 hover:text-foreground"}`}
            >
              <Icon className="size-4" />
              {n.label}
            </button>
          );
        })}
      </nav>
      <div className="min-h-0 flex-1 overflow-auto p-6 veil-scroll">
        {section === "general" ? (
          <Block title="General" desc="Search engine and home page.">
            {guest ? <p className="rounded-lg bg-surface-2 px-3 py-2 text-sm text-muted">Guest session — these choices stay on this device until you leave.</p> : null}
            <Field label="Search engine">
              <select
                className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm"
                value={settings.searchEngineId}
                onChange={(e) => patchSettings({ searchEngineId: e.target.value })}
              >
                {settings.searchEngines.map((se) => (
                  <option key={se.id} value={se.id}>{se.name}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-muted">{currentSearchEngine(settings).url}</p>
            </Field>
            <AddSearchEngine />
            <Field label="Home page (blank = New Tab)">
              <Input value={settings.homeUrl} placeholder="https://…" onChange={(e) => patchSettings({ homeUrl: e.target.value })} />
            </Field>
          </Block>
        ) : null}

        {section === "appearance" ? (
          <Block title="Appearance" desc="Pick a look. Right-click the tab strip or toolbar to rearrange chrome — no CSS required.">
            <Field label="Theme">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(["chrome", "safari", "midnight", "graphite"] as ThemeId[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setTheme({ preset: p, mode: p === "midnight" || p === "graphite" ? "dark" : "light" })}
                    className={`h-20 rounded-xl border capitalize ${settings.theme.preset === p ? "border-ring bg-surface-2" : "border-border bg-background"}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Density">
              <div className="flex gap-2">
                {(["comfortable", "compact"] as const).map((d) => (
                  <Button key={d} variant={settings.theme.density === d ? "default" : "outline"} size="sm" onClick={() => setTheme({ density: d })}>
                    {d}
                  </Button>
                ))}
              </div>
            </Field>
            <Field label="Tab strip">
              <div className="flex gap-2">
                <Button
                  variant={settings.layout.tabPosition === "top" ? "default" : "outline"}
                  size="sm"
                  onClick={() => useBrowserStore.getState().setLayout({ tabPosition: "top" })}
                >
                  Top
                </Button>
                <Button
                  variant={settings.layout.tabPosition === "bottom" ? "default" : "outline"}
                  size="sm"
                  onClick={() => useBrowserStore.getState().setLayout({ tabPosition: "bottom" })}
                >
                  Bottom
                </Button>
              </div>
            </Field>
            <Row
              label="Bookmarks bar"
              checked={settings.layout.bookmarkBar}
              onChange={(v) => useBrowserStore.getState().setLayout({ bookmarkBar: v })}
            />
            <Row
              label="Status bar"
              checked={settings.layout.statusBar}
              onChange={(v) => useBrowserStore.getState().setLayout({ statusBar: v })}
            />
          </Block>
        ) : null}

        {section === "proxy" ? (
          <Block title="Proxy engine" desc="Switching engines reloads the current tab through that codec and header profile.">
            <div className="grid gap-2">
              {(Object.keys(ENGINES) as EngineId[]).map((id) => {
                const e = ENGINES[id];
                const on = settings.engine === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      patchSettings({ engine: id });
                      const st = useBrowserStore.getState();
                      st.reload(st.activeId);
                    }}
                    className={`rounded-xl border p-4 text-left ${on ? "border-ring bg-surface-2" : "border-border bg-background hover:bg-surface-2"}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{e.name}</span>
                      <span className="text-xs text-muted">{e.tagline}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted">{e.description}</p>
                  </button>
                );
              })}
            </div>
            <Separator className="my-4" />
            <Row label="Hide Server / X-Powered-By" checked={settings.nginx.hideServer} onChange={(v) => patchSettings({ nginx: { ...settings.nginx, hideServer: v, hidePoweredBy: v } })} />
            <Row label="Forward client IP" checked={settings.nginx.forwardFor} onChange={(v) => patchSettings({ nginx: { ...settings.nginx, forwardFor: v } })} />
            <Field label="User-Agent override">
              <Input value={settings.nginx.userAgentOverride} placeholder="Leave blank for Chrome 131" onChange={(e) => patchSettings({ nginx: { ...settings.nginx, userAgentOverride: e.target.value } })} />
            </Field>
            <Button onClick={() => { applyStealth(); toast.success("Stealth on — URLs are encoded on the wire."); }}>
              Enable stealth profile
            </Button>
          </Block>
        ) : null}

        {section === "privacy" ? (
          <Block title="Privacy" desc="Ghostery EasyList blocker, stealth encoding, and fingerprint resistance.">
            <Row label="Ad blocker (EasyList)" checked={settings.adblock} onChange={(v) => patchSettings({ adblock: v })} />
            <Row label="Stealth (encode proxy URLs)" checked={settings.stealth} onChange={(v) => patchSettings({ stealth: v })} />
            <Row label="Block WebRTC leaks" checked={settings.webrtcBlock} onChange={(v) => patchSettings({ webrtcBlock: v })} />
            <Row label="Resist fingerprinting" checked={settings.fingerprintResist} onChange={(v) => patchSettings({ fingerprintResist: v })} />
          </Block>
        ) : null}

        {section === "about" ? <AboutPage /> : null}
      </div>
    </div>
  );
}

function HistoryPage({ onGo }: { onGo: (url: string) => void }) {
  const history = useBrowserStore((s) => s.history);
  const session = useBrowserStore((s) => s.session);
  const clearHistory = useBrowserStore((s) => s.clearHistory);
  const [q, setQ] = useState("");
  if (session.kind === "guest") {
    return <Empty title="History is off for guests" body="Sign in to keep a private, encrypted history on your account." />;
  }
  const filtered = history.filter((h) => h.title.toLowerCase().includes(q.toLowerCase()) || h.url.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="flex h-full flex-col bg-surface">
      <div className="flex items-center gap-2 border-b border-border p-4">
        <History className="size-4 text-muted" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search history" className="h-10" />
        <Button variant="ghost" onClick={clearHistory}><Trash2 className="size-4" /> Clear</Button>
      </div>
      <ul className="flex-1 overflow-auto veil-scroll">
        {filtered.length === 0 ? (
          <li className="px-4 py-16 text-center text-sm text-muted">No history yet.</li>
        ) : filtered.map((h) => (
          <li key={h.id}>
            <button type="button" onClick={() => onGo(h.url)} className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left hover:bg-surface-2">
              <span className="min-w-0">
                <span className="block truncate text-sm">{h.title}</span>
                <span className="block truncate text-xs text-muted">{h.url}</span>
              </span>
              <span className="text-xs tabular-nums text-muted">{formatRelative(h.at)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DownloadsPage() {
  const downloads = useBrowserStore((s) => s.downloads);
  return (
    <div className="flex h-full flex-col bg-surface">
      <header className="flex items-center justify-between border-b border-border px-5 py-4">
        <h1 className="text-lg font-semibold">Downloads</h1>
        <Button variant="ghost" onClick={() => useBrowserStore.getState().newTab("veil://files")}>Open Files</Button>
      </header>
      <ul className="flex-1 overflow-auto veil-scroll">
        {downloads.length === 0 ? (
          <li className="px-4 py-16 text-center text-sm text-muted">Files you save from sites land here, not in the host browser.</li>
        ) : downloads.map((d) => (
          <li key={d.id} className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm">{d.filename}</p>
              <p className="text-xs text-muted">{formatBytes(d.size)} · {d.status} · {formatRelative(d.at)}</p>
            </div>
            {d.href ? <a href={d.href} download={d.filename} className="text-sm text-ring">Export</a> : <Download className="size-4 text-muted" />}
          </li>
        ))}
      </ul>
    </div>
  );
}

function BookmarksPage({ onGo }: { onGo: (url: string) => void }) {
  const bookmarks = useBrowserStore((s) => s.bookmarks);
  const removeBookmark = useBrowserStore((s) => s.removeBookmark);
  return (
    <div className="flex h-full flex-col bg-surface">
      <header className="border-b border-border px-5 py-4">
        <h1 className="text-lg font-semibold">Bookmarks</h1>
        <p className="text-sm text-muted">Empty until you star a site.</p>
      </header>
      <ul className="flex-1 overflow-auto veil-scroll">
        {bookmarks.length === 0 ? (
          <li className="px-4 py-16 text-center text-sm text-muted">No bookmarks yet.</li>
        ) : bookmarks.map((b) => (
          <li key={b.id} className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
            <button type="button" className="min-w-0 flex-1 text-left" onClick={() => onGo(b.url)}>
              <span className="block truncate text-sm">{b.title}</span>
              <span className="block truncate text-xs text-muted">{b.url}</span>
            </button>
            <Button variant="ghost" size="sm" onClick={() => removeBookmark(b.id)}>Remove</Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FilesPage() {
  const files = useBrowserStore((s) => s.files);
  const addFile = useBrowserStore((s) => s.addFile);
  const [folder, setFolder] = useState<string | null>("folder_downloads");
  const [newName, setNewName] = useState("");
  const current = files.filter((f) => f.parentId === folder);
  const here = files.find((f) => f.id === folder);

  async function exportAll() {
    const zip = new JSZip();
    for (const f of files.filter((x) => x.kind === "file")) {
      if (!f.href) continue;
      try {
        const res = await fetch(f.href);
        zip.file(f.name, await res.blob());
      } catch { /* skip */ }
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "veil-files.zip";
    a.click();
  }

  return (
    <div className="flex h-full flex-col bg-surface">
      <header className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h1 className="text-lg font-semibold">{here?.name ?? "Files"}</h1>
          <p className="text-sm text-muted">Veil’s library — export a zip to your computer.</p>
        </div>
        <div className="flex gap-2">
          <Input
            value={newName}
            placeholder="New folder"
            className="h-9 w-36"
            onChange={(e) => setNewName(e.target.value)}
          />
          <Button
            variant="secondary"
            onClick={() => {
              if (!newName.trim()) return;
              addFile({ parentId: null, name: newName.trim(), kind: "folder", size: 0 });
              setNewName("");
            }}
          >
            <Folder className="size-4" /> New
          </Button>
          <Button onClick={() => void exportAll()}><Upload className="size-4" /> Export zip</Button>
        </div>
      </header>
      <div className="flex min-h-0 flex-1">
        <aside className="w-48 shrink-0 border-r border-border p-3">
          {files.filter((f) => f.kind === "folder").map((f) => (
            <button key={f.id} type="button" onClick={() => setFolder(f.id)} className={`flex h-10 w-full items-center gap-2 rounded-lg px-2 text-sm ${folder === f.id ? "bg-surface-2" : "hover:bg-surface-2"}`}>
              <Folder className="size-4" /> {f.name}
            </button>
          ))}
        </aside>
        <ul className="flex-1 overflow-auto p-3 veil-scroll">
          {current.filter((f) => f.kind === "file").length === 0 ? (
            <li className="px-3 py-16 text-center text-sm text-muted">This folder is empty.</li>
          ) : current.filter((f) => f.kind === "file").map((f) => (
            <li key={f.id} className="flex items-center justify-between rounded-lg px-3 py-3 hover:bg-surface-2">
              <span className="truncate text-sm">{f.name}</span>
              {f.href ? <a href={f.href} download={f.name} className="text-sm text-ring">Export</a> : <span className="text-xs text-muted">{formatBytes(f.size)}</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ShortcutsPage() {
  const shortcuts = useBrowserStore((s) => s.settings.shortcuts);
  const setShortcut = useBrowserStore((s) => s.setShortcut);
  const [listening, setListening] = useState<string | null>(null);

  return (
    <div className="overflow-auto bg-surface p-6 veil-scroll">
      <div className="mx-auto max-w-lg">
        <h1 className="text-lg font-semibold">Keyboard shortcuts</h1>
        <p className="mt-1 mb-5 text-sm text-muted">Click a binding, then press the new keys. Alt is used so shortcuts still work inside this tab.</p>
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
          {(shortcuts.length ? shortcuts : DEFAULT_SHORTCUTS).map((row) => (
            <li key={row.action} className="flex items-center justify-between px-4 py-3 text-sm">
              <span>{row.label}</span>
              <button
                type="button"
                className="rounded-md bg-surface-2 px-2 py-1 font-mono text-xs"
                onClick={() => setListening(row.action)}
                onKeyDown={(e) => {
                  if (listening !== row.action) return;
                  e.preventDefault();
                  if (["Alt", "Control", "Shift", "Meta"].includes(e.key)) return;
                  setShortcut(row.action, comboFromEvent(e.nativeEvent));
                  setListening(null);
                }}
              >
                {listening === row.action ? "Press keys…" : row.combo}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function PasswordsPage() {
  const passwords = useBrowserStore((s) => s.passwords);
  const session = useBrowserStore((s) => s.session);
  const upsertPassword = useBrowserStore((s) => s.upsertPassword);
  const removePassword = useBrowserStore((s) => s.removePassword);
  const [origin, setOrigin] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  if (session.kind === "guest") return <Empty title="Passwords need an account" body="Guest mode does not store logins." />;
  return (
    <div className="overflow-auto bg-surface p-6 veil-scroll">
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-lg font-semibold">Passwords</h1>
        <p className="text-sm text-muted">Stored encrypted in your Supabase project when configured.</p>
        <div className="grid gap-2 sm:grid-cols-3">
          <Input placeholder="https://site.example" value={origin} onChange={(e) => setOrigin(e.target.value)} />
          <Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <div className="flex gap-2">
            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Button variant="secondary" onClick={() => {
              if (!origin || !username) return;
              upsertPassword({ origin, username, password });
              setOrigin(""); setUsername(""); setPassword("");
            }}>Save</Button>
          </div>
        </div>
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
          {passwords.length === 0 ? <li className="px-4 py-8 text-sm text-muted">No saved logins.</li> : passwords.map((p) => (
            <li key={p.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm">{p.origin}</p>
                <p className="text-xs text-muted">{p.username}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => removePassword(p.id)}>Remove</Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function AboutPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const exportAll = useBrowserStore((s) => s.exportAll);
  const importAll = useBrowserStore((s) => s.importAll);
  const signOut = useBrowserStore((s) => s.signOut);
  const session = useBrowserStore((s) => s.session);
  async function leave() {
    try {
      const { getSupabase } = await import("@/lib/supabase");
      const { stopAccountSync } = await import("@/lib/account-sync");
      stopAccountSync();
      await getSupabase()?.auth.signOut();
    } catch {
      /* ignore */
    }
    signOut();
  }
  return (
    <Block title="Hacker114 · Veil" desc="A private window on the open web. Traffic is rewritten through Veil — pages, assets, sockets, and downloads.">
      <ul className="space-y-2 text-sm text-muted">
        <li>Engines: NGINX, Ultraviolet, Mercury, Scramjet, Rammerhead</li>
        <li>Per-account encrypted cookies in Supabase · guest jars never leave this session</li>
        <li>Ghostery EasyList ad blocker · stealth URL encoding</li>
        <li>Open veil://settings, veil://history, veil://files, veil://shortcuts from the address bar</li>
      </ul>
      <div className="flex flex-wrap gap-2 pt-2">
        <Button onClick={() => downloadJson(`veil-export-${new Date().toISOString().slice(0, 10)}.json`, exportAll())}>Export data</Button>
        <Button variant="secondary" onClick={() => fileRef.current?.click()}>Import</Button>
        <Button variant="outline" onClick={() => void leave()}>{session.kind === "guest" ? "Leave guest session" : "Sign out"}</Button>
        <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          try {
            const err = importAll(JSON.parse(await file.text()));
            if (err) toast.error(err);
            else toast.success("Imported.");
          } catch { toast.error("Invalid file"); }
          e.target.value = "";
        }} />
      </div>
    </Block>
  );
}

function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="grid h-full place-items-center bg-surface px-6 text-center">
      <div>
        <h1 className="text-lg font-semibold">{title}</h1>
        <p className="mt-2 max-w-sm text-sm text-muted">{body}</p>
      </div>
    </div>
  );
}

function Block({ title, desc, children }: { title: string; desc: string; children: ReactNode }) {
  return (
    <section className="mx-auto max-w-2xl space-y-4">
      <header>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm text-muted">{desc}</p>
      </header>
      {children}
    </section>
  );
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
function Row({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-3">
      <Label>{label}</Label>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
function AddSearchEngine() {
  const settings = useBrowserStore((s) => s.settings);
  const patchSettings = useBrowserStore((s) => s.patchSettings);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  return (
    <div className="grid gap-2 rounded-xl border border-border bg-background p-3 sm:grid-cols-[1fr_1fr_auto]">
      <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <Input placeholder="https://example/search?q=%s" value={url} onChange={(e) => setUrl(e.target.value)} />
      <Button variant="secondary" onClick={() => {
        if (!name.trim() || !url.includes("%s")) { toast.error("Need a name and a URL containing %s."); return; }
        patchSettings({ searchEngines: [...settings.searchEngines, { id: uid("se"), name: name.trim(), url: url.trim() }] });
        setName(""); setUrl("");
      }}>Add</Button>
    </div>
  );
}


