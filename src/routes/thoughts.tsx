import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";
import { Quote as QuoteIcon } from "lucide-react";

const CANONICAL = "https://shoiburrahman.com";

export const Route = createFileRoute("/thoughts")({
  head: () => ({
    meta: [
      { title: "Thoughts — Shoibur Rahman" },
      { name: "description", content: "Personal quotes, advice, and life reflections from Shoibur Rahman." },
      { property: "og:title", content: "Thoughts — Shoibur Rahman" },
      { property: "og:description", content: "Personal quotes and reflections." },
      { property: "og:url", content: `${CANONICAL}/thoughts` },
    ],
    links: [{ rel: "canonical", href: `${CANONICAL}/thoughts` }],
  }),
  component: ThoughtsPage,
});

const TONES = ["bento", "bento-blue", "bento-yellow", "bento-cream"] as const;

function ThoughtsPage() {
  const q = useQuery({
    queryKey: ["quotes"],
    queryFn: async () => (await supabase.from("quotes").select("*").order("sort_order")).data ?? [],
  });

  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-4 md:px-6 pt-10 md:pt-16">
        <p className="label-mono">Chapter five</p>
        <h1 className="mt-3 font-display text-5xl md:text-6xl">Thoughts I keep close.</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          A small collection of lines that keep me steady.
        </p>

        <div className="mt-10 grid gap-4 md:gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {(q.data ?? []).map((qt: any, i: number) => (
            <div key={qt.id} className={`${TONES[i % TONES.length]} p-6 flex flex-col justify-between min-h-[220px]`}>
              <QuoteIcon className="h-6 w-6 text-foreground/60" />
              <div className="mt-6">
                <p className="font-display text-2xl leading-snug">"{qt.text}"</p>
                <p className="mt-3 label-mono">
                  — {qt.author ?? "Shoibur"}{qt.category ? ` · ${qt.category}` : ""}
                </p>
              </div>
            </div>
          ))}
          {(q.data ?? []).length === 0 && (
            <div className="bento p-8 col-span-full text-center text-muted-foreground">Still thinking.</div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
