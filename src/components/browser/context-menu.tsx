import { useEffect } from "react";

export type MenuItem =
  | { kind: "item"; label: string; shortcut?: string; danger?: boolean; disabled?: boolean; onSelect: () => void }
  | { kind: "sep" };

export function ContextMenu({
  x,
  y,
  items,
  onClose,
}: {
  x: number;
  y: number;
  items: MenuItem[];
  onClose: () => void;
}) {
  useEffect(() => {
    const close = () => onClose();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("mousedown", close);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const left = Math.min(x, (typeof window !== "undefined" ? window.innerWidth : 400) - 240);
  const top = Math.min(y, (typeof window !== "undefined" ? window.innerHeight : 400) - 320);

  return (
    <div
      className="fixed z-[80] min-w-52 overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-[var(--shadow-panel)]"
      style={{ left, top }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {items.map((item, i) =>
        item.kind === "sep" ? (
          <div key={i} className="my-1 h-px bg-border" />
        ) : (
          <button
            key={i}
            type="button"
            disabled={item.disabled}
            className={`flex h-9 w-full items-center justify-between gap-6 px-3 text-left text-sm disabled:opacity-40 ${item.danger ? "text-danger" : "hover:bg-surface-2"}`}
            onClick={() => {
              item.onSelect();
              onClose();
            }}
          >
            <span>{item.label}</span>
            {item.shortcut ? <span className="text-xs text-muted">{item.shortcut}</span> : null}
          </button>
        ),
      )}
    </div>
  );
}
