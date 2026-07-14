import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SignedImage } from "@/components/SignedImage";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog — Shoibur Rahman" },
      { name: "description", content: "Articles and updates." },
    ],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const posts = useQuery({
    queryKey: ["blog_posts_public"],
    queryFn: async () => {
      const { data } = await supabase.from("blog_posts")
        .select("*").eq("status", "published").order("published_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-4 pt-12 pb-20">
        <div className="glass-strong p-8">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">Blog</p>
          <h1 className="text-4xl font-bold">Writing</h1>
          <p className="mt-2 text-muted-foreground">Thoughts and updates from the studio.</p>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {(posts.data ?? []).map((p) => (
            <Link key={p.id} to="/blog/$slug" params={{ slug: p.slug }} className="glass overflow-hidden group">
              <div className="aspect-video overflow-hidden bg-gradient-to-br from-mint/30 to-emerald-soft/30">
                <SignedImage path={p.cover_path} alt={p.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-5">
                <h2 className="font-semibold">{p.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{p.excerpt}</p>
                {p.published_at && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    {new Date(p.published_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </Link>
          ))}
          {(posts.data ?? []).length === 0 && !posts.isLoading && (
            <div className="glass p-8 text-center text-muted-foreground md:col-span-2">
              No posts yet.
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
