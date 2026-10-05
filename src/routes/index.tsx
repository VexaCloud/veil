import { createFileRoute } from "@tanstack/react-router";
import { BrowserShell } from "@/components/browser/shell";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <BrowserShell />;
}
