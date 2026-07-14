import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Code, Palette, Video, Database, MessageCircle, PencilRuler, Rocket, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Shoibur Rahman" },
      { name: "description", content: "Web development, logo design, video editing, and database services." },
    ],
  }),
  component: ServicesPage,
});

const ICONS: Record<string, typeof Sparkles> = { code: Code, palette: Palette, video: Video, database: Database, sparkles: Sparkles };

const STEPS = [
  { icon: MessageCircle, title: "Discovery", body: "We talk about your goals, audience, and constraints." },
  { icon: PencilRuler, title: "Design", body: "Wireframes, mood-boards, and clean prototypes." },
  { icon: Rocket, title: "Build", body: "Fast, reliable delivery with iterative previews." },
  { icon: CheckCircle2, title: "Launch", body: "Ship, measure, and iterate for impact." },
];

function ServicesPage() {
  const services = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data } = await supabase.from("services").select("*").order("sort_order");
      return data ?? [];
    },
  });

  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-4 pt-12 pb-16">
        <div className="glass-strong p-8">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">Services</p>
          <h1 className="text-4xl font-bold">What I offer</h1>
          <p className="mt-2 text-muted-foreground">Purpose-built solutions across code, design, and video.</p>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {(services.data ?? []).map((s) => {
            const Icon = ICONS[s.icon_name] ?? Sparkles;
            return (
              <div key={s.id} className="glass p-6">
                <div className="rounded-xl bg-primary/15 text-primary p-2.5 w-fit"><Icon className="h-5 w-5" /></div>
                <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="glass-strong p-8">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">Process</p>
          <h2 className="text-3xl font-bold">How I work</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {STEPS.map((s, i) => (
              <div key={s.title} className="glass p-5">
                <div className="rounded-xl bg-primary/15 text-primary p-2.5 w-fit"><s.icon className="h-5 w-5" /></div>
                <p className="mt-3 text-xs text-primary font-semibold">Step {i + 1}</p>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
