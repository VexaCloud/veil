# Veil

A private window on the open web — a fully featured browser-in-browser proxy.

```bash
npm install
npm start
```

Open the app, type a site in the address bar, and Veil fetches it through a Node rewriting proxy. Engines, theming, adblock, stealth, history, downloads, and lock are all in Settings.

Keyboard shortcuts use **Alt / Option** instead of Control so they work inside the host tab.

## What you get

- Multi-tab chrome with a new-tab page, shortcuts, and a real address bar
- Selectable proxy engines: **NGINX** (default path-style reverse proxy), Ultraviolet, Mercury, Scramjet, Rammerhead
- NGINX-style header / SSL configuration layer that applies to every engine
- Per-tab cookie isolation, rewritten pages/assets/forms, and a WebSocket tunnel
- Optional ad blocker (off by default) with EasyList-style filter lists
- One-click stealth mode (Chrome client hints, WebRTC block, fingerprint resistance)
- History, downloads, local password autofill, developer tools, speed test
- Themes, layout, custom CSS, import/export, and a lock screen
- Mobile layout and PWA install support

All traffic goes through `/p/…`. There is no unproxied escape hatch for page loads.

## Shortcuts

| Shortcut | Action |
| --- | --- |
| Alt + T | New tab |
| Alt + W | Close tab |
| Alt + Shift + T | Reopen closed tab |
| Alt + L / Alt + D | Focus address bar |
| Alt + R | Reload |
| Alt + [ / ] | Back / forward |
| Alt + 1–9 | Switch tab |
| Alt + Shift + I | Developer tools |
| Alt + H / J | History / downloads |
| Alt + , | Settings |
| Alt + Shift + N | Stealth mode |

## Notes

- Ad blocking stays **off** until you enable it in Settings → Privacy.
- The lock password is hashed locally. There is no recovery.
- WebSockets tunnel through `/api/ws` while the Node/Vite server is running (`npm start`). Serverless hosts cannot keep a socket open.
