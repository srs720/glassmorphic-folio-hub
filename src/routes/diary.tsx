import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";
import { SignedImage } from "@/components/SignedImage";
import { Star } from "lucide-react";
import { useLang } from "@/lib/i18n";

const CANONICAL = "https://shoiburrahman.com";

export const Route = createFileRoute("/diary")({
  head: () => ({
    meta: [
      { title: "Food Diary — Shoibur Rahman" },
      { name: "description", content: "Shoibur Rahman's favorite foods — pizza, pasta, Indian cuisine — with personal reviews and ratings." },
      { property: "og:title", content: "Food Diary — Shoibur Rahman" },
      { property: "og:description", content: "Favorite foods with personal reviews and ratings." },
      { property: "og:url", content: `${CANONICAL}/diary` },
    ],
    links: [{ rel: "canonical", href: `${CANONICAL}/diary` }],
  }),
  component: DiaryPage,
});

function Stars({ n }: { n: number | null }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={"h-4 w-4 " + (i <= (n ?? 0) ? "fill-yellow text-yellow" : "text-foreground/20")} />
      ))}
    </div>
  );
}

function DiaryPage() {
  const { t } = useLang();
  const q = useQuery({
    queryKey: ["foods"],
    queryFn: async () => (await supabase.from("foods").select("*").order("sort_order")).data ?? [],
  });

  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-4 md:px-6 pt-10 md:pt-16">
        <p className="label-mono">{t("chapter_four")}</p>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl md:text-6xl">{t("diary_title")}</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{t("diary_intro")}</p>


        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(q.data ?? []).map((f: any) => (
            <div key={f.id} className="bento overflow-hidden">
              <div className="h-44 w-full bg-surface-2">
                {f.image_path ? (
                  <SignedImage path={f.image_path} alt={f.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-[#FFF6DD] to-[#EAF5FE] flex items-center justify-center font-display text-4xl text-foreground/40">
                    {f.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-xl">{f.name}</p>
                    {f.cuisine && <p className="label-mono mt-0.5">{f.cuisine}</p>}
                  </div>
                  <Stars n={f.rating} />
                </div>
                {f.review && <p className="text-sm mt-3 text-foreground/80">{f.review}</p>}
              </div>
            </div>
          ))}
          {(q.data ?? []).length === 0 && (
            <div className="bento p-8 col-span-full text-center text-muted-foreground">{t("still_tasting")}</div>
          )}

        </div>
      </section>
    </SiteLayout>
  );
}
