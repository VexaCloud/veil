import { useRef, useState, type ReactNode } from "react";
import {
  Download,
  Keyboard,
  Gauge,
  Globe,
  History,
  Lock,
  Paintbrush,
  ScrollText,
  Settings2,
  Shield,
  SlidersHorizontal,
  Upload,
  Wifi,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ENGINES, type EngineId } from "@/lib/proxy/types";
import {
  useBrowserStore,
  currentSearchEngine,
  type Overlay,
} from "@/lib/browser-store";
import { downloadJson, sha256, uid } from "@/lib/utils";
import { toast } from "sonner";

const NAV: { id: string; label: string; icon: typeof Settings2 }[] = [
  { id: "general", label: "General", icon: Settings2 },
  { id: "appearance", label: "Appearance", icon: Paintbrush },
  { id: "proxy", label: "Proxy", icon: Globe },
  { id: "privacy", label: "Privacy", icon: Shield },
  { id: "autofill", label: "Autofill", icon: Lock },
  { id: "logging", label: "Logging", icon: ScrollText },
  { id: "lock", label: "Lock", icon: Lock },
  { id: "data", label: "Import / Export", icon: SlidersHorizontal },
  { id: "about", label: "About", icon: Keyboard },
];

const FONTS = ["Outfit", "Figtree", "Newsreader", "system-ui", "serif", "JetBrains Mono"];

export function SettingsPanel({ onJump }: { onJump: (o: Overlay) => void }) {
  const [section, setSection] = useState("general");
  const settings = useBrowserStore((s) => s.settings);
  const passwords = useBrowserStore((s) => s.passwords);
  const patchSettings = useBrowserStore((s) => s.patchSettings);
  const setTheme = useBrowserStore((s) => s.setTheme);
  const setLayout = useBrowserStore((s) => s.setLayout);
  const applyStealth = useBrowserStore((s) => s.applyStealth);
  const importAll = useBrowserStore((s) => s.importAll);
  const exportAll = useBrowserStore((s) => s.exportAll);
  const upsertPassword = useBrowserStore((s) => s.upsertPassword);
  const removePassword = useBrowserStore((s) => s.removePassword);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex h-full min-h-0 flex-col bg-background sm:flex-row">
      <nav className="flex shrink-0 gap-1 overflow-x-auto border-b border-border p-2 sm:w-52 sm:flex-col sm:overflow-y-auto sm:border-b-0 sm:border-r">
        {NAV.map((n) => {
          const Icon = n.icon;
          const on = section === n.id;
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => setSection(n.id)}
              className={`flex h-10 items-center gap-2 rounded-md px-3 text-sm ${on ? "bg-surface-2 text-foreground" : "text-muted hover:bg-surface-2 hover:text-foreground"}`}
            >
              <Icon className="size-4" />
              {n.label}
            </button>
          );
        })}
      </nav>
      <div className="min-h-0 flex-1 overflow-auto p-5 veil-scroll">
        {section === "general" ? (
          <Block title="General" desc="Home, search, and new-tab behaviour.">
            <Field label="Search engine">
              <select
                className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm"
                value={settings.searchEngineId}
                onChange={(e) => patchSettings({ searchEngineId: e.target.value })}
              >
                {settings.searchEngines.map((se) => (
                  <option key={se.id} value={se.id}>
                    {se.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-muted">
                Current: {currentSearchEngine(settings).url}
              </p>
            </Field>
            <AddSearchEngine />
            <Field label="Home page (leave blank for New Tab)">
              <Input
                value={settings.homeUrl}
                placeholder="https://…"
                onChange={(e) => patchSettings({ homeUrl: e.target.value })}
              />
            </Field>
            <Row
              label="Shortcuts on new tab"
              checked={settings.showShortcutsOnNewTab}
              onChange={(v) => patchSettings({ showShortcutsOnNewTab: v })}
            />
            <div className="flex flex-wrap gap-2 pt-2">
              <Button variant="secondary" onClick={() => onJump("history")}>
                <History className="size-4" /> History
              </Button>
              <Button variant="secondary" onClick={() => onJump("downloads")}>
                <Download className="size-4" /> Downloads
              </Button>
              <Button variant="secondary" onClick={() => onJump("speed")}>
                <Gauge className="size-4" /> Speed test
              </Button>
              <Button variant="secondary" onClick={() => onJump("shortcuts")}>
                <Keyboard className="size-4" /> Shortcuts
              </Button>
            </div>
          </Block>
        ) : null}

        {section === "appearance" ? (
          <Block title="Appearance" desc="Colors, type, density, and custom CSS. Changes persist.">
            <Field label="Mode">
              <div className="flex gap-2">
                {(["dark", "light", "system"] as const).map((m) => (
                  <Button
                    key={m}
                    variant={settings.theme.mode === m ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme({ mode: m })}
                  >
                    {m}
                  </Button>
                ))}
              </div>
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Swatch label="Accent" value={settings.theme.accent} onChange={(v) => setTheme({ accent: v })} />
              <Swatch label="Background" value={settings.theme.bg} onChange={(v) => setTheme({ bg: v })} />
              <Swatch label="Text" value={settings.theme.fg} onChange={(v) => setTheme({ fg: v })} />
            </div>
            <Field label="Interface font">
              <select
                className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm"
                value={settings.theme.font}
                onChange={(e) => setTheme({ font: e.target.value })}
              >
                {FONTS.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </Field>
            <Field label={`Corner radius · ${settings.theme.radius}px`}>
              <input
                type="range"
                min={4}
                max={20}
                value={settings.theme.radius}
                onChange={(e) => setTheme({ radius: Number(e.target.value) })}
                className="w-full accent-ring"
              />
            </Field>
            <Field label="Density">
              <div className="flex gap-2">
                {(["compact", "comfortable"] as const).map((d) => (
                  <Button
                    key={d}
                    variant={settings.theme.density === d ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme({ density: d })}
                  >
                    {d}
                  </Button>
                ))}
              </div>
            </Field>
            <Row
              label="Bookmark bar"
              checked={settings.layout.bookmarkBar}
              onChange={(v) => setLayout({ bookmarkBar: v })}
            />
            <Row
              label="Status bar"
              checked={settings.layout.statusBar}
              onChange={(v) => setLayout({ statusBar: v })}
            />
            <Field label="Tab strip">
              <div className="flex gap-2">
                {(["top", "bottom"] as const).map((p) => (
                  <Button
                    key={p}
                    variant={settings.layout.tabPosition === p ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLayout({ tabPosition: p })}
                  >
                    {p}
                  </Button>
                ))}
              </div>
            </Field>
            <Field label="Sidebar">
              <div className="flex flex-wrap gap-2">
                {(["none", "bookmarks", "history", "downloads"] as const).map((p) => (
                  <Button
                    key={p}
                    variant={settings.layout.sidebar === p ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLayout({ sidebar: p })}
                  >
                    {p}
                  </Button>
                ))}
              </div>
            </Field>
            <Field label="Custom CSS">
              <Textarea
                className="font-mono text-xs"
                value={settings.theme.customCss}
                onChange={(e) => setTheme({ customCss: e.target.value })}
                placeholder={".veil-chrome { /* your rules */ }"}
              />
            </Field>
          </Block>
        ) : null}

        {section === "proxy" ? (
          <Block title="Proxy engine" desc="All traffic — pages, assets, forms, sockets — is rewritten through Veil. No escape paths.">
            <div className="grid gap-2">
              {(Object.keys(ENGINES) as EngineId[]).map((id) => {
                const e = ENGINES[id];
                const on = settings.engine === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => patchSettings({ engine: id })}
                    className={`rounded-xl border p-3 text-left ${on ? "border-ring bg-surface-2" : "border-border bg-surface hover:bg-surface-2"}`}
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
            <h3 className="mb-2 text-sm font-medium">NGINX layer</h3>
            <p className="mb-3 text-xs text-muted">
              Applies to every engine. Maps to reverse-proxy header behaviour.
            </p>
            <Row
              label="proxy_ssl_server_name"
              checked={settings.nginx.sslServerName}
              onChange={(v) => patchSettings({ nginx: { ...settings.nginx, sslServerName: v } })}
            />
            <Row
              label="Forward client IP (X-Forwarded-For)"
              checked={settings.nginx.forwardFor}
              onChange={(v) => patchSettings({ nginx: { ...settings.nginx, forwardFor: v } })}
            />
            <Row
              label="Hide X-Powered-By / Server"
              checked={settings.nginx.hideServer}
              onChange={(v) =>
                patchSettings({
                  nginx: { ...settings.nginx, hideServer: v, hidePoweredBy: v },
                })
              }
            />
            <Field label="User-Agent override (blank = Chrome 129)">
              <Input
                value={settings.nginx.userAgentOverride}
                onChange={(e) =>
                  patchSettings({ nginx: { ...settings.nginx, userAgentOverride: e.target.value } })
                }
                placeholder="Mozilla/5.0 …"
              />
            </Field>
            <ExtraHeaders />
            <Button
              className="mt-2"
              onClick={() => {
                applyStealth();
                toast.success("Stealth mode on — strongest anti-detection profile applied.");
              }}
            >
              <Wifi className="size-4" /> One-click stealth mode
            </Button>
          </Block>
        ) : null}

        {section === "privacy" ? (
          <Block title="Privacy" desc="Ad blocking is off until you enable it. Filter lists are local.">
            <Row
              label="Ad blocker"
              checked={settings.adblock}
              onChange={(v) => patchSettings({ adblock: v })}
            />
            <Row
              label="Stealth mode"
              checked={settings.stealth}
              onChange={(v) => patchSettings({ stealth: v })}
            />
            <Row
              label="Block WebRTC leaks"
              checked={settings.webrtcBlock}
              onChange={(v) => patchSettings({ webrtcBlock: v })}
            />
            <Row
              label="Fingerprinting resistance"
              checked={settings.fingerprintResist}
              onChange={(v) => patchSettings({ fingerprintResist: v })}
            />
            <Field label="Custom filter lists (one EasyList-style rule per line)">
              <Textarea
                className="font-mono text-xs"
                value={settings.filterLists.join("\n")}
                onChange={(e) =>
                  patchSettings({
                    filterLists: e.target.value.split("\n").map((l) => l.trim()).filter(Boolean),
                  })
                }
                placeholder={"||ads.example.com^\n/ads/"}
              />
            </Field>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "EasyPrivacy extras", rules: ["||scorecardresearch.com^", "||hotjar.com^", "||mixpanel.com^"] },
                { label: "Annoyances", rules: ["||outbrain.com^", "||taboola.com^", "||criteo.com^"] },
              ].map((preset) => (
                <Button
                  key={preset.label}
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    patchSettings({
                      filterLists: Array.from(new Set([...settings.filterLists, ...preset.rules])),
                    })
                  }
                >
                  Add {preset.label}
                </Button>
              ))}
            </div>
          </Block>
        ) : null}

        {section === "autofill" ? (
          <Block title="Password autofill" desc="Stored only in this browser. Never sent through the proxy as a payload of its own.">
            <PasswordForm onSave={upsertPassword} />
            <ul className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border">
              {passwords.length === 0 ? (
                <li className="px-4 py-6 text-sm text-muted">No saved logins yet.</li>
              ) : (
                passwords.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm">{p.origin}</p>
                      <p className="truncate text-xs text-muted">{p.username}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removePassword(p.id)}>
                      Remove
                    </Button>
                  </li>
                ))
              )}
            </ul>
          </Block>
        ) : null}

        {section === "logging" ? (
          <Block title="Logging" desc="Control what Veil records and how long it stays.">
            <Row label="Navigations" checked={settings.logging.nav} onChange={(v) => patchSettings({ logging: { ...settings.logging, nav: v } })} />
            <Row label="Network" checked={settings.logging.net} onChange={(v) => patchSettings({ logging: { ...settings.logging, net: v } })} />
            <Row label="Errors" checked={settings.logging.error} onChange={(v) => patchSettings({ logging: { ...settings.logging, error: v } })} />
            <Row label="Page console" checked={settings.logging.console} onChange={(v) => patchSettings({ logging: { ...settings.logging, console: v } })} />
            <Field label={`Retention · ${settings.logging.retentionHours} hours`}>
              <input
                type="range"
                min={1}
                max={168}
                value={settings.logging.retentionHours}
                onChange={(e) =>
                  patchSettings({ logging: { ...settings.logging, retentionHours: Number(e.target.value) } })
                }
                className="w-full"
              />
            </Field>
            <LogsViewer />
          </Block>
        ) : null}

        {section === "lock" ? (
          <LockSection />
        ) : null}

        {section === "data" ? (
          <Block title="Import / export" desc="Themes, engines, bookmarks, history, and local passwords.">
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => downloadJson(`veil-export-${new Date().toISOString().slice(0, 10)}.json`, exportAll())}
              >
                <Download className="size-4" /> Export
              </Button>
              <Button variant="secondary" onClick={() => fileRef.current?.click()}>
                <Upload className="size-4" /> Import
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const json = JSON.parse(await file.text());
                    const err = importAll(json);
                    if (err) toast.error(err);
                    else toast.success("Imported settings.");
                  } catch {
                    toast.error("That file isn’t valid JSON.");
                  }
                  e.target.value = "";
                }}
              />
            </div>
          </Block>
        ) : null}

        {section === "about" ? (
          <Block title="Veil" desc="A browser inside a browser. Traffic is rewritten through a Node proxy with selectable engines.">
            <ul className="space-y-2 text-sm text-muted">
              <li>Default engine: NGINX-style reverse proxy</li>
              <li>Also: Ultraviolet, Mercury, Scramjet, Rammerhead</li>
              <li>Per-tab cookie isolation · stealth headers · optional adblock</li>
              <li>Install as a PWA from your browser’s share / install menu</li>
            </ul>
          </Block>
        ) : null}
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
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Row({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2.5">
      <Label>{label}</Label>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function Swatch({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="size-10 cursor-pointer rounded-md border border-border bg-surface"
        />
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="font-mono" />
      </div>
    </Field>
  );
}

function AddSearchEngine() {
  const settings = useBrowserStore((s) => s.settings);
  const patchSettings = useBrowserStore((s) => s.patchSettings);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  return (
    <div className="grid gap-2 rounded-xl border border-border bg-surface p-3 sm:grid-cols-[1fr_1fr_auto]">
      <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <Input placeholder="https://example/search?q=%s" value={url} onChange={(e) => setUrl(e.target.value)} />
      <Button
        variant="secondary"
        onClick={() => {
          if (!name.trim() || !url.includes("%s")) {
            toast.error("Need a name and a URL containing %s.");
            return;
          }
          patchSettings({
            searchEngines: [...settings.searchEngines, { id: uid("se"), name: name.trim(), url: url.trim() }],
          });
          setName("");
          setUrl("");
          toast.success("Search engine added.");
        }}
      >
        Add
      </Button>
    </div>
  );
}

function ExtraHeaders() {
  const nginx = useBrowserStore((s) => s.settings.nginx);
  const patchSettings = useBrowserStore((s) => s.patchSettings);
  const [k, setK] = useState("");
  const [v, setV] = useState("");
  const entries = Object.entries(nginx.extraRequestHeaders);
  return (
    <Field label="Extra request headers">
      {entries.map(([key, val]) => (
        <div key={key} className="mb-1 flex items-center justify-between rounded-md bg-surface-2 px-3 py-2 text-xs">
          <span className="font-mono">
            {key}: {val}
          </span>
          <button
            type="button"
            className="text-muted hover:text-foreground"
            onClick={() => {
              const next = { ...nginx.extraRequestHeaders };
              delete next[key];
              patchSettings({ nginx: { ...nginx, extraRequestHeaders: next } });
            }}
          >
            Remove
          </button>
        </div>
      ))}
      <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <Input placeholder="Header" value={k} onChange={(e) => setK(e.target.value)} />
        <Input placeholder="Value" value={v} onChange={(e) => setV(e.target.value)} />
        <Button
          variant="secondary"
          onClick={() => {
            if (!k.trim()) return;
            patchSettings({
              nginx: { ...nginx, extraRequestHeaders: { ...nginx.extraRequestHeaders, [k.trim()]: v } },
            });
            setK("");
            setV("");
          }}
        >
          Add
        </Button>
      </div>
    </Field>
  );
}

function PasswordForm({
  onSave,
}: {
  onSave: (p: { origin: string; username: string; password: string }) => void;
}) {
  const [origin, setOrigin] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      <Input placeholder="https://site.example" value={origin} onChange={(e) => setOrigin(e.target.value)} />
      <Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <div className="flex gap-2">
        <Input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          variant="secondary"
          onClick={() => {
            if (!origin || !username) return;
            onSave({ origin, username, password });
            setOrigin("");
            setUsername("");
            setPassword("");
            toast.success("Saved locally.");
          }}
        >
          Save
        </Button>
      </div>
    </div>
  );
}

function LogsViewer() {
  const logs = useBrowserStore((s) => s.logs);
  const clearLogs = useBrowserStore((s) => s.clearLogs);
  return (
    <div>
      <div className="mb-2 flex justify-end">
        <Button variant="ghost" size="sm" onClick={clearLogs}>
          Clear logs
        </Button>
      </div>
      <ul className="max-h-64 overflow-auto rounded-xl border border-border bg-surface font-mono text-xs veil-scroll">
        {logs.length === 0 ? (
          <li className="px-3 py-6 text-center text-muted">Nothing recorded.</li>
        ) : (
          logs
            .slice()
            .reverse()
            .map((l) => (
              <li key={l.id} className="border-b border-border px-3 py-2">
                <span className="text-muted">{new Date(l.at).toLocaleTimeString()} · {l.kind}</span>
                <div>{l.message}</div>
              </li>
            ))
        )}
      </ul>
    </div>
  );
}

function LockSection() {
  const settings = useBrowserStore((s) => s.settings);
  const patchSettings = useBrowserStore((s) => s.patchSettings);
  const setLocked = useBrowserStore((s) => s.setLocked);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  return (
    <Block title="Password protection" desc="Lock the entire proxy UI. Hash is stored locally — there is no recovery.">
      <Row
        label="Require password"
        checked={settings.lockEnabled}
        onChange={(v) => {
          if (!v) {
            patchSettings({ lockEnabled: false, lockHash: "" });
            setLocked(false);
          } else if (!settings.lockHash) {
            toast.error("Set a password first.");
          } else patchSettings({ lockEnabled: true });
        }}
      />
      <Field label="New password">
        <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
      </Field>
      <Field label="Confirm">
        <Input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} />
      </Field>
      <Button
        onClick={async () => {
          if (pw.length < 4) {
            toast.error("Use at least 4 characters.");
            return;
          }
          if (pw !== pw2) {
            toast.error("Passwords don’t match.");
            return;
          }
          const hash = await sha256(pw);
          patchSettings({ lockEnabled: true, lockHash: hash });
          setPw("");
          setPw2("");
          toast.success("Password saved. Veil will ask for it next visit.");
        }}
      >
        Set password
      </Button>
      {settings.lockEnabled ? (
        <Button variant="secondary" onClick={() => setLocked(true)}>
          Lock now
        </Button>
      ) : null}
    </Block>
  );
}
