import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBrowserStore } from "@/lib/browser-store";
import { sha256 } from "@/lib/utils";
import { VeilMark } from "./icons";

export function LockScreen() {
  const lockHash = useBrowserStore((s) => s.settings.lockHash);
  const setLocked = useBrowserStore((s) => s.setLocked);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 text-foreground">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-6 shadow-[var(--shadow-panel)]">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <VeilMark className="size-10" />
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Veil is locked</h1>
            <p className="mt-1 text-sm text-muted">Enter the proxy password to continue.</p>
          </div>
        </div>
        <form
          className="flex flex-col gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const hash = await sha256(value);
            if (hash === lockHash) {
              setLocked(false);
              setError("");
            } else {
              setError("That password doesn’t match.");
            }
          }}
        >
          <Input
            type="password"
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
          />
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <Button type="submit" className="h-11">
            Unlock
          </Button>
        </form>
      </div>
    </div>
  );
}
