import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBrowserStore } from "@/lib/browser-store";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { startAccountSync } from "@/lib/account-sync";
import { toast } from "sonner";

export function LoginScreen() {
  const setSession = useBrowserStore((s) => s.setSession);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const configured = isSupabaseConfigured();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!configured) {
      setError("Add your Supabase URL and publishable key in supabase/config.json.");
      return;
    }
    const sb = getSupabase();
    if (!sb) return;
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error: err } = await sb.auth.signUp({ email, password });
        if (err) throw err;
        if (data.user) {
          setSession({ kind: "user", userId: data.user.id, email: data.user.email || email });
          void startAccountSync(data.user.id);
        } else {
          toast.success("Check your email to confirm the account.");
        }
      } else {
        const { data, error: err } = await sb.auth.signInWithPassword({ email, password });
        if (err) throw err;
        if (data.user) {
          setSession({ kind: "user", userId: data.user.id, email: data.user.email || email });
          void startAccountSync(data.user.id);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-5">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-[var(--shadow-panel)]">
        <header className="mb-8 flex flex-col items-center text-center">
          <h1 className="flex items-center gap-3 text-2xl font-semibold tracking-tight">
            <img src="/hacker114.png" alt="" width={40} height={40} className="size-10 rounded-lg" />
            Hacker114
          </h1>
          <p className="mt-2 text-sm text-muted">Sign in to sync Veil across devices, or continue as a guest.</p>
        </header>

        <form className="flex flex-col gap-3" onSubmit={submit}>
          <Input
            type="email"
            autoComplete="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            required
            minLength={6}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <Button type="submit" className="h-11" disabled={busy}>
            {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
          </Button>
        </form>

        <button
          type="button"
          className="mt-3 w-full text-center text-sm text-muted hover:text-foreground"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        >
          {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>

        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.14em] text-muted">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>

        <Button
          type="button"
          variant="secondary"
          className="h-11 w-full"
          onClick={() => setSession({ kind: "guest" })}
        >
          Use as guest
        </Button>
        <p className="mt-3 text-center text-xs text-muted">
          Guest mode is the proxy only — history, passwords, and files are not saved to an account.
        </p>
      </div>
    </div>
  );
}
