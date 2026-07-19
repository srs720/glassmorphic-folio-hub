import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";
import { SignedImage } from "@/components/SignedImage";

const CANONICAL = "https://shoiburrahman.com";

export const Route = createFileRoute("/people")({
  head: () => ({
    meta: [
      { title: "People — Shoibur Rahman" },
      { name: "description", content: "The people who shape Shoibur Rahman's world — his father Rafiqul Islam, younger brother, favorite teachers, and close friends." },
      { property: "og:title", content: "People — Shoibur Rahman" },
      { property: "og:description", content: "Family, teachers, and close friends." },
      { property: "og:url", content: `${CANONICAL}/people` },
    ],
    links: [{ rel: "canonical", href: `${CANONICAL}/people` }],
  }),
  component: PeoplePage,
});

const GROUPS: { key: "family" | "teacher" | "friend"; title: string; tone: string }[] = [
  { key: "family", title: "Family", tone: "bento-yellow" },
  { key: "teacher", title: "Teachers", tone: "bento-blue" },
  { key: "friend", title: "Close friends", tone: "bento" },
];

function PeoplePage() {
  const q = useQuery({
    queryKey: ["people"],
    queryFn: async () => (await supabase.from("people").select("*").order("sort_order")).data ?? [],
  });

  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-4 md:px-6 pt-10 md:pt-16">
        <p className="label-mono">Chapter two</p>
        <h1 className="mt-3 font-display text-5xl md:text-6xl">The people in my story.</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          The ones who cheer me on, teach me, and keep the days warm.
        </p>

        <div className="mt-10 grid gap-8">
          {GROUPS.map((g) => {
            const list = (q.data ?? []).filter((p: any) => p.category === g.key);
            if (list.length === 0) return null;
            return (
              <div key={g.key}>
                <h2 className="font-display text-2xl mb-4">{g.title}</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((p: any) => (
                    <div key={p.id} className={`${g.tone} p-5 flex gap-4 items-start`}>
                      <div className="h-20 w-20 rounded-2xl overflow-hidden flex-shrink-0 bg-white border border-border">
                        {p.image_path ? (
                          <SignedImage path={p.image_path} alt={p.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center font-display text-3xl text-foreground/50">
                            {p.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-display text-xl leading-tight">{p.name}</p>
                        {p.relation && <p className="label-mono mt-0.5">{p.relation}</p>}
                        {p.note && <p className="text-sm mt-2 text-foreground/80">{p.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {(q.data ?? []).length === 0 && (
            <div className="bento p-8 text-center text-muted-foreground">This chapter is being written.</div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
