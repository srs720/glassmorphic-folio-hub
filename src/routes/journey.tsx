import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";
import { GraduationCap, BookOpen, Sparkles, Award } from "lucide-react";
import { useLang } from "@/lib/i18n";

const CANONICAL = "https://shoiburrahman.com";

export const Route = createFileRoute("/journey")({
  head: () => ({
    meta: [
      { title: "Journey — Shoibur Rahman" },
      { name: "description", content: "Shoibur Rahman's education journey — 10th grade (Batch 2026) at Darunnazat Siddikia Kamil Madrasah and self-taught web development." },
      { property: "og:title", content: "Journey — Shoibur Rahman" },
      { property: "og:description", content: "Education timeline, current studies, and future academic plans." },
      { property: "og:url", content: `${CANONICAL}/journey` },
    ],
    links: [{ rel: "canonical", href: `${CANONICAL}/journey` }],
  }),
  component: JourneyPage,
});

const ORDER = ["current", "past", "future", "certificate"] as const;

function JourneyPage() {
  const { t } = useLang();
  const META: Record<string, { title: string; icon: typeof GraduationCap; tone: string }> = {
    current: { title: t("edu_current"), icon: GraduationCap, tone: "bento-blue" },
    past: { title: t("edu_past"), icon: BookOpen, tone: "bento" },
    future: { title: t("edu_future"), icon: Sparkles, tone: "bento-yellow" },
    certificate: { title: t("edu_cert"), icon: Award, tone: "bento-cream" },
  };
  const q = useQuery({
    queryKey: ["education_entries"],
    queryFn: async () => (await supabase.from("education_entries").select("*").order("sort_order")).data ?? [],
  });

  const grouped = (q.data ?? []).reduce<Record<string, any[]>>(
    (acc, e) => { (acc[e.kind] ||= []).push(e); return acc; }, {}
  );

  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-4 md:px-6 pt-10 md:pt-16">
        <p className="label-mono">{t("chapter_one")}</p>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl md:text-6xl">{t("journey_title")}</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{t("journey_intro")}</p>

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
            <div className="bento p-8 text-center text-muted-foreground">{t("timeline_soon")}</div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}

