import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function serverPublicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export type PublicContent = {
  settings: any | null;
  socials: any[];
  people: any[];
  education: any[];
  hobbies: any[];
  certificates: any[];
  posts: any[];
  quotes: any[];
};

/** Public, read-only site content. Runs on the server so crawlers get real HTML. */
export const getPublicContent = createServerFn({ method: "GET" }).handler(async (): Promise<PublicContent> => {
  const sb = serverPublicClient();
  const [settings, socials, people, education, hobbies, certificates, posts, quotes] = await Promise.all([
    sb.from("site_settings").select("*").limit(1).maybeSingle(),
    sb.from("social_links").select("*").order("sort_order"),
    sb.from("people").select("*").order("sort_order"),
    sb.from("education_entries").select("*").order("sort_order"),
    sb.from("hobbies").select("*").order("sort_order"),
    sb.from("certificates").select("*").order("sort_order"),
    sb.from("blog_posts").select("*").in("status", ["published", "scheduled"]).order("published_at", { ascending: false }),
    sb.from("quotes").select("*").order("sort_order"),
  ]);

  return {
    settings: settings.data ?? null,
    socials: socials.data ?? [],
    people: people.data ?? [],
    education: education.data ?? [],
    hobbies: hobbies.data ?? [],
    certificates: certificates.data ?? [],
    posts: posts.data ?? [],
    quotes: quotes.data ?? [],
  };
});
