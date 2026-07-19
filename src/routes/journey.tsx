import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";
import { GraduationCap, BookOpen, Sparkles, Award } from "lucide-react";

const CANONICAL = "https://shoiburrahman.com";

export const Route = createFileRoute("/journey")({
  head: () => ({
    meta: [
      { title: "Journey — Shoibur Rahman" },
      { name: "description", content: "Shoibur Rahman's education journey — from 9th grade to 10th grade at General Jim (Batch 2026), plans for higher secondary, and technical certificates." },
      { property: "og:title", content: "Journey — Shoibur Rahman" },
      { property: "og:description", content: "Education timeline, current studies, and future academic plans." },
      { property: "og:url", content: `${CANONICAL}/journey` },
    ],
    links: [{ rel: "canonical", href: `${CANONICAL}/journey` }],
  }),
  component: JourneyPage,
});

const ORDER = ["current", "past", "future", "certificate"] as const;
const META: Record<string, { title: string; icon: typeof GraduationCap; tone: string }> = {
  current: { title: "Right now", icon: GraduationCap, tone: "bento-blue" },
  past: { title: "Where I've been", icon: BookOpen, tone: "bento" },
  future: { title: "What's next", icon: Sparkles, tone: "bento-yellow" },
  certificate: { title: "Certificates & self-study", icon: Award, tone: "bento-cream" },
};

function JourneyPage() {
  const q = useQuery({
    queryKey: ["education_entries"],
    queryFn: async () => (await supabase.from("education_entries").select("*").order("sort_order")).data ?? [],
  });

  const grouped = (q.data ?? []).reduce<Record<string, typeof q.data extends (infer T)[] | undefined ? T[] : never>>(
    (acc, e) => { (acc[e.kind] ||= [] as any).push(e); return acc; }, {} as any
  );

  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-4 md:px-6 pt-10 md:pt-16">
        <p className="label-mono">Chapter one</p>
        <h1 className="mt-3 font-display text-5xl md:text-6xl">My education journey.</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          A running log of where I've studied, what I'm learning now, and where I'd like to go next.
        </p>

        <div className="mt-10 grid gap-6">
          {ORDER.map((kind) => {
            const list = grouped[kind] ?? [];
            if (list.length === 0) return null;
            const m = META[kind];
            const Icon = m.icon;
            return (
              <div key={kind} className={`${m.tone} p-6 md:p-8`}>
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5" />
                  <h2 className="font-display text-2xl">{m.title}</h2>
                </div>
                <ol className="mt-6 relative border-l border-foreground/15 pl-6 grid gap-6">
                  {list.map((e: any) => (
                    <li key={e.id} className="relative">
                      <span className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full bg-foreground" />
                      <p className="label-mono">{e.period}</p>
                      <p className="font-display text-xl mt-1">{e.title}</p>
                      {e.institution && <p className="text-sm text-foreground/70">{e.institution}</p>}
                      {e.description && <p className="text-sm mt-2 text-foreground/80">{e.description}</p>}
                    </li>
                  ))}
                </ol>
              </div>
            );
          })}
          {(q.data ?? []).length === 0 && (
            <div className="bento p-8 text-center text-muted-foreground">Timeline is being written.</div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
