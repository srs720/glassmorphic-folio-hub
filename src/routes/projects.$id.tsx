import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SignedImage } from "@/components/SignedImage";
import { SiteLayout } from "@/components/SiteLayout";

const BASE_URL = "https://glassmorphic-folio-hub.lovable.app";

export const Route = createFileRoute("/projects/$id")({
  loader: async ({ params }) => {
    const { data } = await supabase.from("projects").select("id, title, description").eq("id", params.id).maybeSingle();
    return { project: data };
  },
  head: ({ params, loaderData }) => {
    const p = loaderData?.project;
    const title = p ? `${p.title} — Shoibur Rahman` : "Project — Shoibur Rahman";
    const desc = p?.description
      ? p.description.slice(0, 160)
      : "A project by Shoibur Rahman — web development, design, and video editing work.";
    const url = `${BASE_URL}/projects/${params.id}`;
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
    };
  },
  component: ProjectDetail,
});

function ProjectDetail() {
  const { id } = useParams({ from: "/projects/$id" });
  const q = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const { data } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
      return data;
    },
  });

  const p = q.data;

  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-4 md:px-6 pt-12 pb-24">
        <Link to="/projects" className="mono text-[11px] uppercase tracking-[0.22em] text-accent hover:underline inline-flex items-center gap-1 mb-6">
          <ArrowLeft className="h-3 w-3" /> Back to reel
        </Link>
        {q.isLoading ? (
          <div className="surface h-96 animate-pulse" />
        ) : !p ? (
          <div className="surface p-10 text-center text-muted-foreground mono text-sm uppercase">// take not found</div>
        ) : (
          <article className="surface overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border">
              <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {(p.title || "PROJECT").replace(/[^A-Z0-9]+/gi, "_").toUpperCase()}.MP4
              </span>
              <span className="mono text-[10px] text-teal">MASTER</span>
            </div>
            <div className="aspect-video overflow-hidden bg-[#0f1116]">
              <SignedImage path={p.image_path} alt={p.title} className="h-full w-full object-cover" />
            </div>
            <div className="p-6 md:p-8">
              <h1 className="font-display text-3xl md:text-5xl uppercase leading-tight">{p.title}</h1>
              {p.tags?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {p.tags.map((t: string) => (<span key={t} className="tag-mono">{t}</span>))}
                </div>
              )}
              <p className="mt-5 text-lg text-muted-foreground">{p.description}</p>
              {p.detail_content && (
                <div className="mt-6 whitespace-pre-wrap leading-relaxed text-foreground/90">{p.detail_content}</div>
              )}
              {(p.images ?? []).length > 0 && (
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {p.images.map((path: string) => (
                    <div key={path} className="surface overflow-hidden aspect-video">
                      <SignedImage path={path} alt={p.title} className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
              {p.live_url && (
                <a href={p.live_url} target="_blank" rel="noopener noreferrer" className="btn-primary mt-8 inline-flex items-center gap-2">
                  Visit Live <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </article>
        )}
      </section>
    </SiteLayout>
  );
}
