import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import config from "../../supabase/config.json";

export type SupabaseAppConfig = {
  url: string;
  publishableKey: string;
  encryptionKey: string;
};

export function getSupabaseConfig(): SupabaseAppConfig {
  return {
    url: (config as SupabaseAppConfig).url?.trim() ?? "",
    publishableKey: (config as SupabaseAppConfig).publishableKey?.trim() ?? "",
    encryptionKey: (config as SupabaseAppConfig).encryptionKey?.trim() ?? "",
  };
}

export function isSupabaseConfigured(): boolean {
  const c = getSupabaseConfig();
  return Boolean(c.url && c.publishableKey);
}

export function encryptionSecret(userId?: string | null): string {
  const c = getSupabaseConfig();
  return `${c.encryptionKey || "veil-local-enc"}:${userId || "guest"}`;
}

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (client) return client;
  const c = getSupabaseConfig();
  client = createClient(c.url, c.publishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return client;
}
