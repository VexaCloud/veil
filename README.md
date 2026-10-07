# Veil (Hacker114)

A private, browser-in-browser web proxy: tabs, omnibox, `veil://` pages, stealth mode,
incognito, built-in ad blocker (Ghostery engine + EasyList), dev tools, per-account
encrypted storage, and a cloud file system.

## Run

```bash
npm install
npm start        # http://localhost:8080
```

`npm start` runs the Vite server on port 8080. The proxy's WebSocket and
escaped-path layer (`scripts/veil-ws-plugin.mjs`) hooks that server, so use
`npm start` to run Veil.

## Supabase (optional — guests can use the proxy without it)

1. Put your project URL and publishable key in [`supabase/config.json`](supabase/config.json).
   Set `encryptionKey` to a long random string.
2. Run [`supabase/full.sql`](supabase/full.sql) in the Supabase SQL editor
   (tables, RLS, storage buckets). It is safe to re-run.

## Internal pages

`veil://settings` · `veil://history` · `veil://downloads` · `veil://files` ·
`veil://bookmarks` · `veil://shortcuts` · `veil://passwords` · `veil://about`
