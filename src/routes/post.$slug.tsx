import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";
import { SignedImage } from "@/components/SignedImage";
import { Reveal } from "@/components/Reveal";
import { ShareButton } from "@/components/ShareButton";
import { ArrowLeft, Calendar } from "lucide-react";
import { useLang, pickLang } from "@/lib/i18n";

const CANONICAL = "https://shoiburrahman.com";

export const Route = createFileRoute("/post/$slug")({
  loader: async ({ params }) => {
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", params.slug)
      .eq("status", "published")
      .maybeSingle();
    if (!data) throw notFound();
    return { post: data as any };
  },
  head: ({ params, loaderData }) => {
    const url = `${CANONICAL}/post/${params.slug}`;
    if (!loaderData) {
      return {
        meta: [{ title: "Unavailable — Shoibur Rahman" }, { name: "robots", content: "noindex" }],
      };
    }
    const p = loaderData.post;
    const title = (p.seo_title || p.title) as string;
    const desc = (p.seo_description || p.excerpt || "").slice(0, 158);
    return {
      meta: [
        { title: `${title} — Shoibur Rahman` },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: p.title,
            description: desc,
            datePublished: p.published_at ?? p.created_at,
            dateModified: p.updated_at ?? p.created_at,
            inLanguage: ["en", "bn"],
            mainEntityOfPage: { "@type": "WebPage", "@id": url },
            author: { "@type": "Person", name: "Shoibur Rahman", url: CANONICAL },
            publisher: { "@type": "Person", name: "Shoibur Rahman", url: CANONICAL },
          }),
        },
      ],
    };
  },
  errorComponent: () => <PostFallback />,
  notFoundComponent: () => <PostFallback />,
  component: PostPage,
});

function PostFallback() {
  const { t } = useLang();
  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-4 md:px-6 py-24 text-center">
        <h1 className="font-display text-3xl">{t("post_not_found")}</h1>
        <Link to="/" className="btn-primary mt-6 inline-flex">{t("back_home")}</Link>
      </section>
    </SiteLayout>
  );
}

function PostPage() {
  const { post } = Route.useLoaderData();
  const { t, lang } = useLang();
  const title = pickLang(post, "title", lang);
  const content = pickLang(post, "content", lang);

  return (
    <SiteLayout>
      <article className="mx-auto max-w-3xl px-4 md:px-6 pt-10 md:pt-16 pb-10">
        <Reveal>
          <Link to="/" hash="posts" className="label-mono inline-flex items-center gap-1.5 hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> {t("back_home")}
          </Link>
          <p className="label-mono mt-6 inline-flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            {t("published_on")}{" "}
            {new Date(post.published_at ?? post.created_at).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB", {
              day: "numeric", month: "long", year: "numeric",
            })}
          </p>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl md:text-5xl leading-tight">{title}</h1>
          {pickLang(post, "excerpt", lang) && (
            <p className="mt-4 text-lg text-muted-foreground">{pickLang(post, "excerpt", lang)}</p>
          )}
          <div className="mt-5">
            <ShareButton
              title={title}
              text={pickLang(post, "excerpt", lang)}
              url={`${CANONICAL}/post/${post.slug}`}
              label
            />
          </div>
        </Reveal>

        {post.cover_path && (
          <Reveal delay={0.1}>
            <div className="mt-8 overflow-hidden rounded-3xl bg-surface-2">
              <SignedImage path={post.cover_path} alt={title} className="w-full object-cover" />
            </div>
          </Reveal>
        )}

        <Reveal delay={0.15}>
          <div
            className="post-body mt-10"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </Reveal>
      </article>
    </SiteLayout>
  );
}
