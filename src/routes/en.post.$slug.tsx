import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { PostView, postHead } from "@/components/PostView";
import { loadPostWithRelated } from "@/lib/posts-load";
import { T } from "@/lib/i18n";

export const Route = createFileRoute("/en/post/$slug")({
  loader: async ({ params }) => {
    const result = await loadPostWithRelated(params.slug);
    if (!result) throw notFound();
    return result;
  },
  head: ({ params, loaderData }) => postHead(loaderData?.post, params.slug, "en", "en"),
  errorComponent: () => <Fallback />,
  notFoundComponent: () => <Fallback />,
  component: EnglishPost,
});

function Fallback() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-4 md:px-6 py-24 text-center">
        <h1 className="font-display text-3xl">{T.post_not_found.en}</h1>
        <Link to="/" className="btn-primary mt-6 inline-flex">{T.back_home.en}</Link>
      </section>
    </SiteLayout>
  );
}

function EnglishPost() {
  const { post, related } = Route.useLoaderData();
  return <PostView post={post} related={related} lang="en" locale="en" />;
}
