import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { PostView, postHead } from "@/components/PostView";
import { loadPostWithRelated } from "@/lib/posts-load";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/post/$slug")({
  loader: async ({ params }) => {
    const result = await loadPostWithRelated(params.slug);
    if (!result) throw notFound();
    return result;
  },
  head: ({ params, loaderData }) => postHead(loaderData?.post, params.slug, "en"),
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
  const { post, related } = Route.useLoaderData();
  const { lang } = useLang();
  return <PostView post={post} related={related} lang={lang} />;
}
