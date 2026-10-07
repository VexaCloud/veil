export type ShortcutAction =
  | "newTab"
  | "closeTab"
  | "reopenTab"
  | "focusAddress"
  | "reload"
  | "back"
  | "forward"
  | "devtools"
  | "history"
  | "downloads"
  | "settings"
  | "stealth"
  | "incognito"
  | "nextTab"
  | "prevTab"
  | "fullscreenProxy";

export type ShortcutBinding = {
  action: ShortcutAction;
  combo: string;
  label: string;
};

export const DEFAULT_SHORTCUTS: ShortcutBinding[] = [
  { action: "newTab", combo: "Alt+T", label: "New tab" },
  { action: "closeTab", combo: "Alt+W", label: "Close tab" },
  { action: "reopenTab", combo: "Alt+Shift+T", label: "Reopen closed tab" },
  { action: "focusAddress", combo: "Alt+L", label: "Focus address bar" },
  { action: "reload", combo: "Alt+R", label: "Reload" },
  { action: "back", combo: "Alt+[", label: "Back" },
  { action: "forward", combo: "Alt+]", label: "Forward" },
  { action: "devtools", combo: "Alt+Shift+I", label: "Developer tools" },
  { action: "history", combo: "Alt+H", label: "History" },
  { action: "downloads", combo: "Alt+J", label: "Downloads" },
  { action: "settings", combo: "Alt+,", label: "Settings" },
  { action: "stealth", combo: "Alt+Shift+N", label: "Toggle stealth" },
  { action: "incognito", combo: "Alt+Shift+P", label: "New incognito tab" },
  { action: "nextTab", combo: "Alt+Tab", label: "Next tab" },
  { action: "prevTab", combo: "Alt+Shift+Tab", label: "Previous tab" },
  { action: "fullscreenProxy", combo: "Alt+Shift+F", label: "Open proxy fullscreen" },
];

export function eventMatchesCombo(e: KeyboardEvent, combo: string): boolean {
  const parts = combo.split("+").map((p) => p.trim().toLowerCase());
  const needAlt = parts.includes("alt");
  const needShift = parts.includes("shift");
  const needMeta = parts.includes("meta") || parts.includes("cmd");
  const needCtrl = parts.includes("ctrl") || parts.includes("control");
  const key = parts[parts.length - 1] ?? "";
  if (!!e.altKey !== needAlt) return false;
  if (!!e.shiftKey !== needShift) return false;
  if (!!e.metaKey !== needMeta) return false;
  if (!!e.ctrlKey !== needCtrl) return false;
  const pressed = e.key.length === 1 ? e.key.toLowerCase() : e.key.toLowerCase();
  if (key === "tab") return e.key === "Tab";
  if (key === ",") return e.key === "," || e.code === "Comma";
  if (key === "[") return e.key === "[" || e.key === "ArrowLeft";
  if (key === "]") return e.key === "]" || e.key === "ArrowRight";
  return pressed === key;
}

export function comboFromEvent(e: KeyboardEvent): string {
  const bits: string[] = [];
  if (e.altKey) bits.push("Alt");
  if (e.ctrlKey) bits.push("Ctrl");
  if (e.metaKey) bits.push("Meta");
  if (e.shiftKey) bits.push("Shift");
  const k = e.key === " " ? "Space" : e.key.length === 1 ? e.key.toUpperCase() : e.key;
  if (!["Alt", "Control", "Shift", "Meta"].includes(e.key)) bits.push(k);
  return bits.join("+");
}
