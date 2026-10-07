import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useBrowserStore } from "@/lib/browser-store";

export function DevtoolsDock() {
  const nets = useBrowserStore((s) => s.nets);
  const consoles = useBrowserStore((s) => s.consoles);
  const inspect = useBrowserStore((s) => s.inspect);
  const inspectOn = useBrowserStore((s) => s.inspectOn);
  const pageSource = useBrowserStore((s) => s.pageSource);
  const setInspectOn = useBrowserStore((s) => s.setInspectOn);
  const setDevtoolsOpen = useBrowserStore((s) => s.setDevtoolsOpen);
  const [tab, setTab] = useState<"elements" | "console" | "network" | "sources" | "application">("elements");
  const [code, setCode] = useState("");
  const [source, setSource] = useState(pageSource);

  useEffect(() => {
    if (tab === "sources") {
      window.dispatchEvent(new Event("veil:source"));
      const t = window.setTimeout(() => setSource(useBrowserStore.getState().pageSource), 80);
      return () => window.clearTimeout(t);
    }
  }, [tab, pageSource]);

  const tabs = ["elements", "console", "network", "sources", "application"] as const;

  return (
    <div className="flex h-80 flex-col border-t border-border bg-[#202124] text-[#e8eaed]">
      <div className="flex h-10 items-center gap-1 border-b border-white/10 px-2">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`h-8 rounded-md px-2.5 text-xs capitalize ${tab === t ? "bg-white/10 font-medium" : "text-[#9aa0a6] hover:bg-white/5"}`}
          >
            {t}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setInspectOn(!inspectOn)}
          className={`ml-auto h-8 rounded-md px-2.5 text-xs ${inspectOn ? "bg-[#8ab4f8] text-[#202124]" : "text-[#9aa0a6]"}`}
        >
          Inspect
        </button>
        <button
          type="button"
          aria-label="Close developer tools"
          className="grid size-8 place-items-center rounded-md hover:bg-white/10"
          onClick={() => {
            setDevtoolsOpen(false);
            setInspectOn(false);
          }}
        >
          <X className="size-4" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-auto font-mono text-xs veil-scroll">
        {tab === "network"
          ? (nets.length ? nets.slice().reverse().map((n) => (
              <div key={n.id} className="grid grid-cols-[56px_1fr_52px_64px] gap-2 border-b border-white/5 px-3 py-1.5">
                <span className="text-[#9aa0a6]">{n.method}</span>
                <span className="truncate">{n.url}</span>
                <span className="tabular-nums">{n.status ?? n.phase}</span>
                <span className="tabular-nums text-[#9aa0a6]">{n.ms ? `${n.ms}ms` : ""}</span>
              </div>
            )) : <p className="p-4 text-[#9aa0a6]">No requests yet.</p>)
          : null}
        {tab === "console"
          ? (consoles.length ? consoles.slice().reverse().map((c) => (
              <div key={c.id} className="border-b border-white/5 px-3 py-1.5">
                <span className={`mr-2 uppercase ${c.level === "error" ? "text-[#f28b82]" : "text-[#9aa0a6]"}`}>{c.level}</span>
                {c.args.join(" ")}
              </div>
            )) : <p className="p-4 text-[#9aa0a6]">Console is empty.</p>)
          : null}
        {tab === "elements" ? (
          <div className="p-3">
            <p className="mb-2 font-sans text-[#9aa0a6]">
              {inspectOn ? "Click an element in the page." : "Turn on Inspect, or right-click the page and choose Inspect."}
            </p>
            {inspect ? (
              <>
                <p className="mb-2 text-[#8ab4f8]">{inspect.tag}</p>
                {inspect.styles ? (
                  <pre className="mb-2 whitespace-pre-wrap text-[#9aa0a6]">
                    {Object.entries(inspect.styles).map(([k, v]) => `${k}: ${v}`).join("\n")}
                  </pre>
                ) : null}
                <textarea
                  className="h-32 w-full rounded-lg border border-white/10 bg-[#2d2e31] p-2"
                  defaultValue={inspect.html}
                  onBlur={(e) => {
                    window.dispatchEvent(new CustomEvent("veil:edit-html", { detail: e.target.value }));
                  }}
                />
              </>
            ) : null}
          </div>
        ) : null}
        {tab === "sources" ? (
          <div className="flex h-full flex-col">
            <textarea
              className="min-h-0 flex-1 bg-[#2d2e31] p-3 outline-none"
              value={source || pageSource}
              onChange={(e) => setSource(e.target.value)}
            />
            <div className="border-t border-white/10 p-2">
              <button
                type="button"
                className="h-8 rounded-md bg-[#8ab4f8] px-3 text-xs text-[#202124]"
                onClick={() => window.dispatchEvent(new CustomEvent("veil:apply-html", { detail: source || pageSource }))}
              >
                Apply to page
              </button>
            </div>
          </div>
        ) : null}
        {tab === "application" ? (
          <div className="p-4 font-sans text-sm text-[#9aa0a6]">
            <p className="mb-2">Cookies are isolated per Veil account and encrypted at rest in Supabase.</p>
            <p className="mb-2">Incognito tabs use a private jar and never write history.</p>
            <p>Open veil://files for the download library. Downloads save inside Veil, not the host browser.</p>
          </div>
        ) : null}
      </div>
      {tab === "console" ? (
        <form
          className="flex border-t border-white/10"
          onSubmit={(e) => {
            e.preventDefault();
            window.dispatchEvent(new CustomEvent("veil:eval", { detail: code }));
            setCode("");
          }}
        >
          <span className="grid size-9 place-items-center text-[#9aa0a6]">›</span>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="h-9 flex-1 bg-transparent font-mono text-xs outline-none"
            placeholder="Evaluate in page"
          />
        </form>
      ) : null}
    </div>
  );
}
