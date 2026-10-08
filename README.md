# Veil (Made by Hacker114)

A private, browser-in-browser web proxy.
Features: Built-in ad blocker (Ghostery engine + EasyList), dev tools, per-account encrypted storage, confined cookies, and a cloud file system.

## Run

```bash
npm install
npm start        # http://localhost:8080
```

`npm start` runs the Vite server on port 8080. The proxy's WebSocket and
escaped-path layer (`scripts/veil-ws-plugin.mjs`) hooks that server, so use
`npm start` to run Veil.

## Supabase (optional)

1. Put your project URL and publishable key in [`supabase/config.json`](supabase/config.json).
   Set `encryptionKey` to a long encryption key.
2. Run [`supabase/full.sql`](supabase/full.sql) in the Supabase SQL editor
   (tables, RLS, storage buckets). It is safe to re-run.

   The current URL in config.json is the official Veil database and will sync user data.

## Internal pages

`veil://settings` · `veil://history` · `veil://downloads` · `veil://files` ·
`veil://bookmarks` · `veil://shortcuts` · `veil://passwords` · `veil://about`
