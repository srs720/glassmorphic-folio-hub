import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://shoiburrahman.com";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
  lastmod?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/journey", changefreq: "monthly", priority: "0.8" },
          { path: "/people", changefreq: "monthly", priority: "0.7" },
          { path: "/thoughts", changefreq: "weekly", priority: "0.7" },
          { path: "/contact", changefreq: "yearly", priority: "0.5" },
        ];

        try {
          const { createClient } = await import("@supabase/supabase-js");
          const client = createClient(
            process.env["SUPABASE_URL"]!,
            process.env["SUPABASE_PUBLISHABLE_KEY"]!,
            { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
          );
          const { data, error } = await client
            .from("blog_posts")
            .select("slug, updated_at, published_at")
            .in("status", ["published", "scheduled"]);
          if (error) throw error;
          for (const row of data ?? []) {
            const lastmod = (row.updated_at ?? row.published_at)
              ? new Date(row.updated_at ?? row.published_at).toISOString()
              : undefined;
            for (const prefix of ["", "/en", "/bn"]) {
              entries.push({
                path: `${prefix}/post/${row.slug}`,
                changefreq: "monthly",
                priority: "0.9",
                ...(lastmod ? { lastmod } : {}),
              });
            }
          }

        } catch (err) {
          // Never serve a partial sitemap — crawlers would drop the missing URLs.
          console.error("sitemap: failed to load posts", err);
          return new Response("Sitemap temporarily unavailable", {
            status: 503,
            headers: { "Cache-Control": "no-store" },
          });
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ].filter(Boolean).join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
