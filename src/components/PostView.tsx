import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Calendar, Clock, Tag } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { SignedImage } from "@/components/SignedImage";
import { Reveal } from "@/components/Reveal";
import { ShareButton } from "@/components/ShareButton";
import { PostChat } from "@/components/PostChat";
import { pickLang, T, type Lang } from "@/lib/i18n";
import { readingMinutes } from "@/lib/post-utils";
import type { PostRow } from "@/lib/posts-load";

export const CANONICAL = "https://shoiburrahman.com";

/** Path for a post in a given locale. `/post/x` stays as the language-neutral URL. */
export function postPath(slug: string, locale?: Lang) {
  return locale ? `/${locale}/post/${slug}` : `/post/${slug}`;
}

type Props = {
  post: PostRow;
  related: Array<Partial<PostRow> & { id: string; slug: string }>;
  lang: Lang;
  /** When set, in-page links stay inside this locale prefix. */
  locale?: Lang;
};

export function PostView({ post, related, lang, locale }: Props) {
  const tr = (k: keyof typeof T) => T[k][lang];
  const title = pickLang(post, "title", lang);
  const content = pickLang(post, "content", lang);
  const minutes = readingMinutes(content);
  const tags = post.tags ?? [];

  return (
    <SiteLayout>
      <article className="mx-auto max-w-3xl px-4 md:px-6 pt-10 md:pt-16 pb-10">
        <Reveal>
          <Link to="/" hash="posts" className="label-mono inline-flex items-center gap-1.5 hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> {tr("back_home")}
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
            <p className="label-mono inline-flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              {tr("published_on")}{" "}
              {new Date(post.published_at ?? post.created_at).toLocaleDateString(
                lang === "bn" ? "bn-BD" : "en-GB",
                { day: "numeric", month: "long", year: "numeric" },
              )}
            </p>
            <p className="label-mono inline-flex items-center gap-1.5">
              <Clock className="h-3 w-3" /> {minutes} {tr("min_read")}
            </p>
          </div>

          <h1 className="mt-3 font-display text-3xl sm:text-4xl md:text-5xl leading-tight">{title}</h1>

          {pickLang(post, "excerpt", lang) && (
            <p className="mt-4 text-lg text-muted-foreground">{pickLang(post, "excerpt", lang)}</p>
          )}

          {tags.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <li
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-3 py-1 text-xs font-medium text-foreground/80"
                >
                  <Tag className="h-3 w-3 text-primary" aria-hidden />
                  {tag}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-5">
            <ShareButton
              title={title}
              text={pickLang(post, "excerpt", lang)}
              url={`${CANONICAL}${postPath(post.slug, locale)}`}
              label
            />
          </div>
        </Reveal>

        {post.cover_path && (
          <Reveal delay={0.1}>
            <div className="mt-8 overflow-hidden rounded-3xl bg-surface-2">
              <SignedImage path={post.cover_path} alt={title} className="w-full object-cover" loading="eager" />
            </div>
          </Reveal>
        )}

        <Reveal delay={0.15}>
          <div className="post-body mt-10" dangerouslySetInnerHTML={{ __html: content }} />
        </Reveal>

        {related.length > 0 && (
          <Reveal delay={0.2}>
            <section className="mt-14 border-t border-border pt-8">
              <h2 className="font-display text-2xl">{tr("related_posts")}</h2>
              <ul className="mt-5 grid gap-4 sm:grid-cols-3">
                {related.map((r) => (
                  <li key={r.id}>
                    <Link
                      to={locale === "en" ? "/en/post/$slug" : locale === "bn" ? "/bn/post/$slug" : "/post/$slug"}
                      params={{ slug: r.slug }}
                      className="bento block h-full p-4 hover:shadow-md transition"
                    >
                      <p className="font-display text-lg leading-snug">{pickLang(r, "title", lang)}</p>
                      <span className="mt-3 inline-flex items-center gap-1 text-sm text-primary">
                        {tr("read_more")} <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>
        )}
      </article>

      <PostChat slug={post.slug} lang={lang} />
    </SiteLayout>
  );
}

/** Shared <head> data for every locale variant of a post. */
export function postHead(post: PostRow | undefined, slug: string, lang: Lang, locale?: Lang) {
  const url = `${CANONICAL}${postPath(slug, locale)}`;

  if (!post) {
    return {
      meta: [{ title: "Unavailable — Shoibur Rahman" }, { name: "robots", content: "noindex" }],
    };
  }

  const title = (lang === "bn" ? post.seo_title_bn || post.title_bn : post.seo_title) || pickLang(post, "title", lang);
  const desc = (
    (lang === "bn" ? post.seo_description_bn : post.seo_description) ||
    pickLang(post, "excerpt", lang) ||
    ""
  ).slice(0, 158);

  return {
    meta: [
      { title: `${title} — Shoibur Rahman` },
      { name: "description", content: desc },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:type", content: "article" },
      { property: "og:url", content: url },
      { property: "og:locale", content: lang === "bn" ? "bn_BD" : "en_US" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: url },
      { rel: "alternate", hrefLang: "en", href: `${CANONICAL}/en/post/${slug}` },
      { rel: "alternate", hrefLang: "bn", href: `${CANONICAL}/bn/post/${slug}` },
      { rel: "alternate", hrefLang: "x-default", href: `${CANONICAL}/post/${slug}` },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: pickLang(post, "title", lang),
          description: desc,
          keywords: (post.tags ?? []).join(", ") || undefined,
          datePublished: post.published_at ?? post.created_at,
          dateModified: post.updated_at ?? post.created_at,
          inLanguage: lang === "bn" ? "bn" : "en",
          wordCount: undefined,
          mainEntityOfPage: { "@type": "WebPage", "@id": url },
          author: { "@type": "Person", name: "Shoibur Rahman", url: CANONICAL },
          publisher: { "@type": "Person", name: "Shoibur Rahman", url: CANONICAL },
        }),
      },
    ],
  };
}
