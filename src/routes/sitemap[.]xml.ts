import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

const BASE_URL = "https://glassmorphic-folio-hub.lovable.app";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/about", changefreq: "monthly", priority: "0.8" },
          { path: "/projects", changefreq: "weekly", priority: "0.9" },
          { path: "/services", changefreq: "monthly", priority: "0.8" },
          { path: "/blog", changefreq: "weekly", priority: "0.7" },
          { path: "/contact", changefreq: "yearly", priority: "0.6" },
        ];

        try {
          const [{ data: projects }, { data: posts }] = await Promise.all([
            supabase.from("projects").select("id, updated_at, created_at"),
            supabase.from("blog_posts").select("slug, updated_at, published_at").eq("status", "published"),
          ]);
          (projects ?? []).forEach((p: any) => {
            entries.push({
              path: `/projects/${p.id}`,
              lastmod: (p.updated_at ?? p.created_at)?.slice(0, 10),
              changefreq: "monthly",
              priority: "0.7",
            });
          });
          (posts ?? []).forEach((p: any) => {
            entries.push({
              path: `/blog/${p.slug}`,
              lastmod: (p.updated_at ?? p.published_at)?.slice(0, 10),
              changefreq: "monthly",
              priority: "0.6",
            });
          });
        } catch (e) {
          console.error("sitemap dynamic fetch failed", e);
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
