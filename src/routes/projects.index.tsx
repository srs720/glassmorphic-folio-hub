import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SignedImage } from "@/components/SignedImage";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { title: "Projects — Shoibur Rahman" },
      { name: "description", content: "Selected projects from Shoibur Rahman across web, design, and video — including SRS Digital Shop and Zero To Decor." },
      { property: "og:title", content: "Projects — Shoibur Rahman" },
      { property: "og:description", content: "Selected projects from Shoibur Rahman across web, design, and video — including SRS Digital Shop and Zero To Decor." },
      { property: "og:url", content: "https://glassmorphic-folio-hub.lovable.app/projects" },
    ],
    links: [{ rel: "canonical", href: "https://glassmorphic-folio-hub.lovable.app/projects" }],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const [filter, setFilter] = useState<string>("All");
  const projects = useQuery({
    queryKey: ["projects_all"],
    queryFn: async () => (await supabase.from("projects").select("*").order("sort_order").order("created_at", { ascending: false })).data ?? [],
  });

  const tags = useMemo(() => {
    const set = new Set<string>();
    (projects.data ?? []).forEach((p) => (p.tags ?? []).forEach((t: string) => set.add(t)));
    return ["All", ...Array.from(set)];
  }, [projects.data]);

  const visible = (projects.data ?? []).filter((p) => filter === "All" || (p.tags ?? []).includes(filter));

  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-4 md:px-6 pt-12 pb-20">
        <p className="mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">// SCENE_03 · Archive</p>
        <h1 className="mt-4 font-display text-5xl md:text-7xl uppercase leading-[0.9]">
          The <span className="text-accent">Reel.</span>
        </h1>
        <p className="mt-4 text-muted-foreground max-w-xl">A cut of recent work. Filter by tag to jump between chapters.</p>

        <div className="mt-8 flex flex-wrap gap-2 border-y border-border py-3">
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`mono text-[11px] uppercase tracking-[0.18em] px-3 py-1.5 border transition ${
                filter === t
                  ? "border-accent text-accent bg-accent/10"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"
              }`}
            >{t}</button>
          ))}
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((p, i) => {
            const filename = `${(p.title || "PROJECT").replace(/[^A-Z0-9]+/gi, "_").toUpperCase().slice(0, 24)}_${String(i + 1).padStart(2, "0")}.MP4`;
            return (
              <Link key={p.id} to="/projects/$id" params={{ id: p.id }} className="group block surface overflow-hidden hover:border-accent/60 transition">
                <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                  <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{filename}</span>
                  <span className="mono text-[10px] text-teal">01:24</span>
                </div>
                <div className="relative aspect-video bg-[#0f1116] overflow-hidden">
                  <SignedImage path={p.image_path} alt={p.title} className="h-full w-full object-cover transition duration-500 group-hover:brightness-110" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <div className="h-12 w-12 rounded-full bg-accent/90 flex items-center justify-center">
                      <Play className="h-5 w-5 text-background fill-background ml-0.5" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h2 className="font-display uppercase text-lg leading-tight">{p.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                  {p.tags?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {p.tags.slice(0, 4).map((t: string) => (
                        <span key={t} className="tag-mono">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
          {visible.length === 0 && !projects.isLoading && (
            <div className="surface p-8 text-center text-muted-foreground md:col-span-2 lg:col-span-3 mono text-sm uppercase tracking-wider">
              // No takes in this chapter yet
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
