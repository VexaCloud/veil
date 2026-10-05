import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import appCss from "../styles.css?url";

const APP_NAME = "Veil";

const THEME_BOOT = `(function(){try{var raw=localStorage.getItem('veil-browser');if(!raw)return;var s=JSON.parse(raw).state;if(!s)return;var theme=s.settings&&s.settings.theme;var mode=theme&&theme.mode;var light=false;if(mode==='light')light=true;else if(mode==='system'&&window.matchMedia('(prefers-color-scheme: light)').matches)light=true;if(light)document.documentElement.dataset.theme='light';if(theme){if(theme.bg)document.documentElement.style.setProperty('--veil-bg',theme.bg);if(theme.fg)document.documentElement.style.setProperty('--veil-fg',theme.fg);if(theme.accent)document.documentElement.style.setProperty('--veil-accent',theme.accent);if(theme.font)document.documentElement.style.setProperty('--veil-font',theme.font);if(theme.mono)document.documentElement.style.setProperty('--veil-mono',theme.mono);if(typeof theme.radius==='number')document.documentElement.style.setProperty('--veil-radius',theme.radius+'px');}if(s.settings&&s.settings.lockEnabled)document.documentElement.dataset.locked='1';}catch(e){}})();`;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: APP_NAME },
      { name: "theme-color", content: "#0b0c0e" },
      {
        name: "description",
        content: "Veil is a private window on the web — a fully customizable browser-in-browser proxy.",
      },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Newsreader:ital,opsz,wght@0,6..72,500;1,6..72,500&family=Outfit:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  component: () => (
    <html lang="en" suppressHydrationWarning className="antialiased">
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
