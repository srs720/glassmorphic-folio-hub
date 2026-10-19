import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Short-link redirector. Static routes (/contact, /cv, ...) always win over this dynamic segment.
export const Route = createFileRoute("/$slug")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const home = new URL("/", request.url).toString();
        const slug = String(params.slug ?? "").toLowerCase().trim();
        if (!/^[a-z0-9-]{1,64}$/.test(slug)) return Response.redirect(home, 302);
        try {
          const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
          const sb = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
            auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
            global: {
              fetch: (input, init) => {
                const h = new Headers(init?.headers);
                if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
                h.set("apikey", key);
                return fetch(input, { ...init, headers: h });
              },
            },
          });
          const { data } = await sb.rpc("resolve_custom_link", { _slug: slug });
          const url = typeof data === "string" ? data : null;
          if (url && /^https?:\/\//i.test(url)) {
            return new Response(null, { status: 302, headers: { Location: url, "Cache-Control": "no-store" } });
          }
        } catch {
          // fall through to home
        }
        return Response.redirect(home, 302);
      },
    },
  },
});
