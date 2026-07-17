import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SignedImage } from "@/components/SignedImage";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { title: "Projects — Shoibur Rahman" },
      { name: "description", content: "Selected projects by Shoibur Rahman across web development, logo design, and promotional video editing — including SRS Digital Shop and Zero To Decor." },
      { property: "og:title", content: "Projects — Shoibur Rahman" },
      { property: "og:description", content: "Selected projects by Shoibur Rahman across web development, logo design, and promotional video editing — including SRS Digital Shop and Zero To Decor." },
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
    queryFn: async () => {
      const { data } = await supabase.from("projects").select("*").order("sort_order").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const tags = useMemo(() => {
    const set = new Set<string>();
    (projects.data ?? []).forEach((p) => (p.tags ?? []).forEach((t: string) => set.add(t)));
    return ["All", ...Array.from(set)];
  }, [projects.data]);

  const visible = (projects.data ?? []).filter((p) => filter === "All" || (p.tags ?? []).includes(filter));

  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-4 pt-12 pb-20">
        <div className="glass-strong p-8">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">Portfolio</p>
          <h1 className="text-4xl font-bold">Projects</h1>
          <p className="mt-2 text-muted-foreground">A collection of work across web, design, and video.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {tags.map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={
                  filter === t
                    ? "rounded-full px-4 py-1.5 text-sm bg-primary text-primary-foreground font-medium"
                    : "glass rounded-full px-4 py-1.5 text-sm hover:bg-white/70"
                }
              >{t}</button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((p) => (
            <Link key={p.id} to="/projects/$id" params={{ id: p.id }} className="glass overflow-hidden group">
              <div className="aspect-video overflow-hidden bg-gradient-to-br from-mint/30 to-emerald-soft/30">
                <SignedImage path={p.image_path} alt={p.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-5">
                <h2 className="font-semibold">{p.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                {p.tags?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.tags.map((t: string) => (
                      <span key={t} className="text-xs bg-primary/10 text-primary rounded-md px-2 py-0.5">{t}</span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
          {visible.length === 0 && !projects.isLoading && (
            <div className="glass p-8 text-center text-muted-foreground md:col-span-2 lg:col-span-3">
              No projects in this category yet.
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
