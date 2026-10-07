import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";

const APP_NAME = "Veil";

const THEME_BOOT = `(function(){try{var raw=localStorage.getItem('veil-browser');if(!raw)return;var s=JSON.parse(raw).state;if(!s)return;var theme=s.settings&&s.settings.theme;if(!theme)return;var preset=theme.preset||'chrome';var mode=theme.mode||'light';var light=mode==='light';if(mode==='system'&&window.matchMedia('(prefers-color-scheme: light)').matches)light=true;if(preset==='midnight'||preset==='graphite')light=false;document.documentElement.dataset.theme=light?'light':'dark';document.documentElement.dataset.preset=preset;if(theme.density)document.documentElement.dataset.density=theme.density;}catch(e){}})();`;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: APP_NAME },
      { name: "theme-color", content: "#e8eaed" },
      {
        name: "description",
        content: "Veil is a private window on the web — a fully customizable browser-in-browser proxy.",
      },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "apple-touch-icon", href: "/hacker114.png" },
    ],
  }),
  component: () => (
    <html lang="en" suppressHydrationWarning className="antialiased">
      <head>
        <HeadContent />
      </head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
        <Outlet />
        <Scripts />
      </body>
    </html>
  ),
});
