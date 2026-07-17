import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SignedImage } from "@/components/SignedImage";
import { SiteLayout } from "@/components/SiteLayout";

const BASE_URL = "https://glassmorphic-folio-hub.lovable.app";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const { data } = await supabase.from("blog_posts")
      .select("title, excerpt, seo_title, seo_description, published_at")
      .eq("slug", params.slug).eq("status", "published").maybeSingle();
    return { post: data };
  },
  head: ({ params, loaderData }) => {
    const p = loaderData?.post;
    const title = p ? `${p.seo_title || p.title} — Shoibur Rahman` : "Post — Shoibur Rahman";
    const desc = (p?.seo_description || p?.excerpt || "An article by Shoibur Rahman.").slice(0, 160);
    const url = `${BASE_URL}/blog/${params.slug}`;
    const scripts = p ? [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        headline: p.title,
        description: p.excerpt,
        datePublished: p.published_at,
        author: { "@type": "Person", name: "Shoibur Rahman" },
        mainEntityOfPage: url,
      }),
    }] : undefined;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
      ...(scripts ? { scripts } : {}),
    };
  },
  component: BlogDetail,
});

function BlogDetail() {
  const { slug } = useParams({ from: "/blog/$slug" });
  const q = useQuery({
    queryKey: ["blog_post", slug],
    queryFn: async () => {
      const { data } = await supabase.from("blog_posts").select("*")
        .eq("slug", slug).eq("status", "published").maybeSingle();
      return data;
    },
  });
  const p = q.data;

  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-4 pt-12 pb-20">
        <Link to="/blog" className="text-sm text-primary hover:underline inline-flex items-center gap-1 mb-4">
          <ArrowLeft className="h-4 w-4" /> All posts
        </Link>
        {q.isLoading ? (
          <div className="glass h-96 animate-pulse" />
        ) : !p ? (
          <div className="glass p-10 text-center text-muted-foreground">Post not found.</div>
        ) : (
          <article className="glass-strong overflow-hidden">
            {p.cover_path && (
              <div className="aspect-video overflow-hidden">
                <SignedImage path={p.cover_path} alt={p.title} className="h-full w-full object-cover" />
              </div>
            )}
            <div className="p-8">
              <h1 className="text-3xl font-bold">{p.title}</h1>
              {p.published_at && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(p.published_at).toLocaleDateString()}
                </p>
              )}
              <p className="mt-4 text-lg text-muted-foreground">{p.excerpt}</p>
              <div className="mt-6 whitespace-pre-wrap leading-relaxed">{p.content}</div>
            </div>
          </article>
        )}
      </section>
    </SiteLayout>
  );
}
