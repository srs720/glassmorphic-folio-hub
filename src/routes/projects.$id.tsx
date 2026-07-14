import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SignedImage } from "@/components/SignedImage";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/projects/$id")({
  head: () => ({ meta: [{ title: "Project — Shoibur Rahman" }] }),
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
      <section className="mx-auto max-w-4xl px-4 pt-12 pb-20">
        <Link to="/projects" className="text-sm text-primary hover:underline inline-flex items-center gap-1 mb-4">
          <ArrowLeft className="h-4 w-4" /> All projects
        </Link>
        {q.isLoading ? (
          <div className="glass h-96 animate-pulse" />
        ) : !p ? (
          <div className="glass p-10 text-center text-muted-foreground">Project not found.</div>
        ) : (
          <article className="glass-strong overflow-hidden">
            <div className="aspect-video overflow-hidden bg-gradient-to-br from-mint/30 to-emerald-soft/30">
              <SignedImage path={p.image_path} alt={p.title} className="h-full w-full object-cover" />
            </div>
            <div className="p-8">
              <h1 className="text-3xl font-bold">{p.title}</h1>
              {p.tags?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.tags.map((t: string) => (
                    <span key={t} className="text-xs bg-primary/10 text-primary rounded-md px-2 py-0.5">{t}</span>
                  ))}
                </div>
              )}
              <p className="mt-4 text-lg text-muted-foreground">{p.description}</p>
              {p.detail_content && (
                <div className="mt-6 whitespace-pre-wrap leading-relaxed">{p.detail_content}</div>
              )}
              {(p.images ?? []).length > 0 && (
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {p.images.map((path: string) => (
                    <div key={path} className="glass overflow-hidden aspect-video">
                      <SignedImage path={path} alt={p.title} className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
              {p.live_url && (
                <a href={p.live_url} target="_blank" rel="noopener noreferrer"
                  className="btn-primary mt-8 inline-flex items-center gap-2">
                  Visit live <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </article>
        )}
      </section>
    </SiteLayout>
  );
}
