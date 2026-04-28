import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { getSubdomain, MAIN_DOMAIN } from "@/lib/domain";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
  loader: async ({ request }) => {
    const url = new URL(request.url);
    const subdomain = getSubdomain(url.hostname, MAIN_DOMAIN);
    
    let pageData = null;
    if (subdomain) {
      const { data } = await supabase
        .from("pages")
        .select("*")
        .eq("id", subdomain)
        .maybeSingle();
      pageData = data;
    }
    
    return {
      subdomain,
      pageData,
      hostname: url.hostname
    };
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Aryan AI Studio — Websites in Seconds" },
      { name: "description", content: "Build beautiful websites in seconds with AI" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  const { subdomain, pageData } = Route.useLoaderData();

  if (subdomain && pageData) {
    return (
      <iframe
        title="Live Site"
        srcDoc={pageData.html}
        className="h-screen w-full border-0"
        sandbox="allow-scripts allow-same-origin allow-popups"
      />
    );
  }

  return <Outlet />;
}
