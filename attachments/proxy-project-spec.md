# Web Proxy Project Specification

Build a fully featured web proxy that functions as a browser-within-a-browser.

## Core Experience

- Home screen with a clean, modern interface that includes:
  - Customizable shortcuts / bookmarks
  - Multi-tab support
  - Visual theming and layout editor (colors, fonts, spacing, dark/light modes, custom CSS)
  - Search engine selector (default: Brave Search; options for DuckDuckGo, Bing, Google, Startpage, and the ability to add custom search engines)
- Built-in ad blocker that is **disabled by default** and can be toggled on/off in settings (with optional filter lists)
- Completely customizable — every major UI element, behavior, and proxy setting must be adjustable from a settings panel and persist across sessions

## Proxy Engine

- Written in Node.js
- Default proxy backend: NGINX (with a simple configuration layer)
- User can switch backends in settings to:
  - Ultraviolet
  - Mercury
  - Other popular open-source proxy engines
- All traffic (pages, assets, redirects, forms, WebSockets, etc.) must go through the proxy with no escape paths
- URL handling designed to minimize proxy detection:
  - Use a clean path structure (e.g. rooted at `.` or a similarly minimal prefix) so the proxy origin is not obvious from the path after the domain
- Address bar behavior must mimic a real browser:
  - When the user navigates to a site (e.g. xbox.com) and is redirected (e.g. to a Microsoft sign-in page), the proxy UI must clearly show the current real destination while also indicating the originating site (“redirected from xbox.com”)
- The proxy must present itself as a normal browser (realistic User-Agent, headers, and fingerprinting resistance where practical)

## Other Features

- Session / cookie isolation per tab
- History and download manager
- Basic developer tools (element inspector, console, network log)
- Password / form autofill (local only)
- Keyboard shortcuts matching common browser behavior using alt/option instead of control so it works in tab.
- Mobile-responsive layout + PWA install support
- Built-in speed / latency tester
- Export / import of settings and themes
- Password protection for the proxy itself
- Logging controls (what gets logged and for how long)
- One-click “stealth mode” that applies the strongest available anti-detection settings

## Delivery Requirements

- Zero configuration beyond:
  ```bash
  npm install
  npm start
  ```
  (or `node server.js`)
- Everything needed to run must be included in the project and make sure you cover every single requirement. I do not want a half done or starting spot, I want it fully functional and complete.
- Final deliverable: a single `.zip` file containing the complete, ready-to-run project
