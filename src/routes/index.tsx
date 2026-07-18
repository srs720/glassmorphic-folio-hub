import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Download, ArrowRight, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getSignedUrl } from "@/lib/portfolio";
import { SignedImage } from "@/components/SignedImage";
import { SiteLayout, useSettings } from "@/components/SiteLayout";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Shoibur Rahman — Developer, Designer & Video Editor" },
      { name: "description", content: "Portfolio of Shoibur Rahman — web development, graphic design, and promotional video editing, cut in a cinematic timeline." },
      { property: "og:title", content: "Shoibur Rahman — Developer, Designer & Video Editor" },
      { property: "og:description", content: "Portfolio of Shoibur Rahman — web development, graphic design, and promotional video editing, cut in a cinematic timeline." },
      { property: "og:url", content: "https://glassmorphic-folio-hub.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://glassmorphic-folio-hub.lovable.app/" }],
  }),
  component: HomePage,
});

const PROFICIENCY: Record<string, number> = {
  HTML: 95, CSS: 92, JavaScript: 85, Python: 78,
  "Database Configuration": 82,
  "Graphic Design": 88, "Professional Logo Creation": 90,
  "Promotional Video Editing": 92,
};

const CATEGORY_ORDER = ["Development", "Design", "Video"];
const CATEGORY_MAP: Record<string, string> = {
  HTML: "Development", CSS: "Development", JavaScript: "Development", Python: "Development",
  "Database Configuration": "Development",
  "Graphic Design": "Design", "Professional Logo Creation": "Design",
  "Promotional Video Editing": "Video",
};

function HomePage() {
  const settings = useSettings();
  const projects = useQuery({
    queryKey: ["projects_featured"],
    queryFn: async () => {
      const { data } = await supabase.from("projects").select("*").eq("featured", true).order("sort_order").limit(6);
      return data ?? [];
    },
  });
  const skills = useQuery({
    queryKey: ["skills"],
    queryFn: async () => {
      const { data } = await supabase.from("skills").select("*").order("sort_order");
      return data ?? [];
    },
  });

  async function downloadResume() {
    if (!settings.data?.resume_path) return;
    const url = await getSignedUrl(settings.data.resume_path, 300);
    if (url) window.open(url, "_blank");
  }

  const grouped: Record<string, { name: string; level: number }[]> = {};
  (skills.data ?? []).forEach((s) => {
    const cat = s.category || CATEGORY_MAP[s.name] || "Development";
    (grouped[cat] ||= []).push({ name: s.name, level: PROFICIENCY[s.name] ?? 80 });
  });

  return (
    <SiteLayout>
      {/* HERO — asymmetric split */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 pt-10 md:pt-16">
        <div className="grid gap-10 md:grid-cols-12 items-center">
          <div className="md:col-span-7">
            <div className="flex items-center gap-3 mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              <span className="h-px w-8 bg-accent" /> Scene_01 · Cold Open
            </div>
            <h1 className="mt-6 font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.9] uppercase">
              Frame<br/>By<br/><span className="text-accent">Frame.</span>
            </h1>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="tag-mono">[ DEV / DESIGN / EDIT ]</span>
              <span className="tag-mono">CLASS TEN · GENERAL JIM</span>
            </div>
            <p className="mt-6 max-w-xl text-muted-foreground leading-relaxed">
              I'm <span className="text-foreground font-semibold">{settings.data?.name ?? "Shoibur Rahman"}</span> — I write clean code, cut sharp visuals, and edit promotional video that actually converts. {settings.data?.bio}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/projects" className="btn-primary inline-flex items-center gap-2">
                <Play className="h-4 w-4 fill-current" /> Roll The Reel
              </Link>
              {settings.data?.resume_path && (
                <button onClick={downloadResume} className="btn-ghost inline-flex items-center gap-2">
                  <Download className="h-4 w-4" /> Resume.pdf
                </button>
              )}
            </div>

            {/* Meta strip */}
            <div className="mt-10 grid grid-cols-3 border-t border-border">
              {[
                { k: "ROLE", v: "Full-Stack + Editor" },
                { k: "BASED", v: settings.data?.location || "Bangladesh" },
                { k: "STATUS", v: "Open for work" },
              ].map((m) => (
                <div key={m.k} className="py-4 border-r border-border last:border-r-0 pr-4">
                  <p className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{m.k}</p>
                  <p className="mt-1 text-sm">{m.v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: profile plate */}
          <div className="md:col-span-5">
            <div className="relative surface film-grain overflow-hidden aspect-[4/5]">
              {/* Corner marks */}
              <CornerMarks />
              <div className="absolute top-3 left-3 z-10 mono text-[10px] tracking-[0.2em] text-accent uppercase">● REC</div>
              <div className="absolute top-3 right-3 z-10 mono text-[10px] tracking-[0.2em] text-muted-foreground">01:00:00:00</div>
              <div className="absolute bottom-3 left-3 right-3 z-10 flex items-end justify-between mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                <span>CAM_A · 24FPS</span>
                <span>ISO 400 · f/1.8</span>
              </div>
              <div className="absolute inset-0 duotone-amber">
                {settings.data?.avatar_path ? (
                  <SignedImage path={settings.data.avatar_path} alt={settings.data.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-[#2a1c08] to-[#0f0a03] flex items-center justify-center">
                    <span className="font-display text-9xl text-accent/70">
                      {(settings.data?.name ?? "S").charAt(0)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SKILLS — meters by category */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 mt-28">
        <SectionHeader tag="02" kicker="Track_02" title="Skill Meters" subtitle="Signal levels across the stack." />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {CATEGORY_ORDER.map((cat) => {
            const items = grouped[cat] ?? [];
            if (items.length === 0) return null;
            return (
              <div key={cat} className="surface p-6">
                <div className="flex items-center justify-between">
                  <p className="mono text-[10px] uppercase tracking-[0.22em] text-teal">// {cat}</p>
                  <p className="mono text-[10px] text-muted-foreground">{items.length.toString().padStart(2, "0")} TRACKS</p>
                </div>
                <div className="mt-5 space-y-4">
                  {items.map((s) => (
                    <div key={s.name}>
                      <div className="flex justify-between items-baseline mono text-[11px]">
                        <span className="uppercase tracking-wider">{s.name}</span>
                        <span className="text-accent">{s.level}%</span>
                      </div>
                      <div className="mt-1.5 h-1 bg-[#0f1116] border border-border/60 relative overflow-hidden">
                        <div className="h-full bg-accent" style={{ width: `${s.level}%` }} />
                        {/* tick marks */}
                        <div className="absolute inset-0 flex justify-between opacity-40 pointer-events-none">
                          {Array.from({ length: 10 }).map((_, i) => (
                            <span key={i} className="w-px h-full bg-background" />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* PROJECTS — filmstrip */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 mt-28">
        <div className="flex items-end justify-between">
          <SectionHeader tag="03" kicker="Track_03" title="Selected Work" subtitle="Cuts from the archive." />
          <Link to="/projects" className="mono text-[11px] uppercase tracking-[0.22em] text-accent hover:underline inline-flex items-center gap-1">
            All Reels <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {(projects.data ?? []).map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 mt-28">
        <div className="surface p-10 md:p-16 relative overflow-hidden">
          <CornerMarks />
          <p className="mono text-[10px] uppercase tracking-[0.22em] text-accent">// FINAL FRAME</p>
          <h2 className="mt-3 font-display text-4xl md:text-6xl uppercase leading-[0.95]">
            Got a project?<br/><span className="text-accent">Let's roll tape.</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-lg">Websites, brand marks, and promo edits. Tell me the story you want to cut.</p>
          <Link to="/contact" className="btn-primary mt-8 inline-flex items-center gap-2">
            <Play className="h-4 w-4 fill-current" /> Start The Take
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}

function SectionHeader({ tag, kicker, title, subtitle }: { tag: string; kicker: string; title: string; subtitle?: string }) {
  return (
    <div>
      <div className="flex items-center gap-3 mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
        <span className="text-accent">{tag}.</span>
        <span className="h-px w-8 bg-border" />
        <span>{kicker}</span>
      </div>
      <h2 className="mt-3 font-display text-3xl md:text-5xl uppercase">{title}</h2>
      {subtitle && <p className="mt-2 text-muted-foreground text-sm">{subtitle}</p>}
    </div>
  );
}

function CornerMarks() {
  return (
    <>
      <span className="absolute top-2 left-2 h-3 w-3 border-t border-l border-accent/70 pointer-events-none" />
      <span className="absolute top-2 right-2 h-3 w-3 border-t border-r border-accent/70 pointer-events-none" />
      <span className="absolute bottom-2 left-2 h-3 w-3 border-b border-l border-accent/70 pointer-events-none" />
      <span className="absolute bottom-2 right-2 h-3 w-3 border-b border-r border-accent/70 pointer-events-none" />
    </>
  );
}

function ProjectCard({ project: p, index }: { project: any; index: number }) {
  const filename = `${(p.title || "PROJECT").replace(/[^A-Z0-9]+/gi, "_").toUpperCase().slice(0, 24)}_${String(index + 1).padStart(2, "0")}.MP4`;
  return (
    <Link to="/projects/$id" params={{ id: p.id }} className="group block surface overflow-hidden hover:border-accent/60 transition">
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
        <h3 className="font-display uppercase text-lg leading-tight">{p.title}</h3>
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
}
