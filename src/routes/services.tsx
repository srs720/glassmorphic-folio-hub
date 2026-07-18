import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Code, Palette, Video, Database, MessageCircle, PencilRuler, Rocket, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Shoibur Rahman" },
      { name: "description", content: "Freelance services from Shoibur Rahman — web development, logo design, and promotional video editing." },
      { property: "og:title", content: "Services — Shoibur Rahman" },
      { property: "og:description", content: "Freelance services from Shoibur Rahman — web development, logo design, and promotional video editing." },
      { property: "og:url", content: "https://glassmorphic-folio-hub.lovable.app/services" },
    ],
    links: [{ rel: "canonical", href: "https://glassmorphic-folio-hub.lovable.app/services" }],
  }),
  component: ServicesPage,
});

const ICONS: Record<string, typeof Sparkles> = { code: Code, palette: Palette, video: Video, database: Database, sparkles: Sparkles };

const STEPS = [
  { icon: MessageCircle, title: "Brief", body: "We talk shot list — goals, audience, constraints." },
  { icon: PencilRuler, title: "Storyboard", body: "Wireframes, mood-boards, clean prototypes." },
  { icon: Rocket, title: "Production", body: "Fast, reliable builds with iterative dailies." },
  { icon: CheckCircle2, title: "Final Cut", body: "Ship, measure, and iterate for impact." },
];

function ServicesPage() {
  const services = useQuery({
    queryKey: ["services"],
    queryFn: async () => (await supabase.from("services").select("*").order("sort_order")).data ?? [],
  });

  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-4 md:px-6 pt-12">
        <p className="mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">// SCENE_04 · Services</p>
        <h1 className="mt-4 font-display text-5xl md:text-7xl uppercase leading-[0.9]">
          What I <span className="text-accent">Ship.</span>
        </h1>
        <p className="mt-4 text-muted-foreground max-w-xl">Purpose-built work across code, design, and video.</p>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {(services.data ?? []).map((s, i) => {
            const Icon = ICONS[s.icon_name] ?? Sparkles;
            return (
              <div key={s.id} className="surface p-6 hover:border-accent/60 transition">
                <div className="flex items-center justify-between">
                  <div className="border border-accent/60 text-accent p-2.5 w-fit"><Icon className="h-5 w-5" /></div>
                  <span className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">SVC_{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h2 className="mt-5 font-display text-xl uppercase">{s.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 md:px-6 mt-20 pb-24">
        <div className="surface p-6 md:p-10">
          <p className="mono text-[11px] uppercase tracking-[0.22em] text-teal">// WORKFLOW</p>
          <h2 className="mt-2 font-display text-3xl md:text-5xl uppercase">How The Edit Works</h2>
          <div className="mt-8 grid gap-0 md:grid-cols-4 border-t border-border">
            {STEPS.map((s, i) => (
              <div key={s.title} className="p-5 border-b md:border-b-0 md:border-r border-border last:border-r-0">
                <p className="mono text-[10px] uppercase tracking-[0.22em] text-accent">STEP {String(i + 1).padStart(2, "0")}</p>
                <div className="mt-3"><s.icon className="h-5 w-5 text-accent" /></div>
                <h3 className="mt-3 font-display uppercase text-lg">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
