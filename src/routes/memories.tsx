import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";
import { SignedImage } from "@/components/SignedImage";
import { MapPin, X } from "lucide-react";
import { useLang } from "@/lib/i18n";

const CANONICAL = "https://shoiburrahman.com";

export const Route = createFileRoute("/memories")({
  head: () => ({
    meta: [
      { title: "Memories — Shoibur Rahman" },
      { name: "description", content: "Hobbies, PC-building notes, and travel memories from Shoibur Rahman, including his trip to Gazipur Safari Park." },
      { property: "og:title", content: "Memories — Shoibur Rahman" },
      { property: "og:description", content: "Hobbies, personal stories, and travel snapshots." },
      { property: "og:url", content: `${CANONICAL}/memories` },
    ],
    links: [{ rel: "canonical", href: `${CANONICAL}/memories` }],
  }),
  component: MemoriesPage,
});

function MemoriesPage() {
  const memories = useQuery({
    queryKey: ["memories"],
    queryFn: async () => (await supabase.from("memories").select("*").order("sort_order")).data ?? [],
  });
  const hobbies = useQuery({
    queryKey: ["hobbies"],
    queryFn: async () => (await supabase.from("hobbies").select("*").order("sort_order")).data ?? [],
  });
  const [open, setOpen] = useState<{ path: string | null; title: string } | null>(null);

  const { t } = useLang();
  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-4 md:px-6 pt-10 md:pt-16">
        <p className="label-mono">{t("chapter_three")}</p>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl md:text-6xl">{t("memories_title")}</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{t("memories_intro")}</p>

        <h2 className="mt-12 font-display text-2xl">{t("hobbies")}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(hobbies.data ?? []).map((h: any) => (
            <div key={h.id} className="bento p-5">
              <div className="h-40 w-full rounded-2xl overflow-hidden bg-surface-2 mb-4">
                {h.image_path ? (
                  <SignedImage path={h.image_path} alt={h.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-[#EAF5FE] to-[#FFF6DD]" />
                )}
              </div>
              <p className="font-display text-xl">{h.title}</p>
              {h.description && <p className="text-sm mt-2 text-muted-foreground">{h.description}</p>}
            </div>
          ))}
        </div>

        <h2 className="mt-12 font-display text-2xl">{t("travel_memories")}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(memories.data ?? []).map((m: any) => (
            <button
              key={m.id}
              onClick={() => setOpen({ path: m.image_path, title: m.title })}
              className="bento overflow-hidden text-left group"
            >
              <div className="h-48 w-full relative bg-surface-2">
                {m.image_path ? (
                  <SignedImage path={m.image_path} alt={m.title} className="h-full w-full object-cover group-hover:scale-105 transition duration-500" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-[#DCEEFB] to-[#FFF6DD]" />
                )}
              </div>
              <div className="p-5">
                <p className="font-display text-xl">{m.title}</p>
                {m.location && (
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {m.location}
                  </p>
                )}
                {m.story && <p className="text-sm mt-3 text-foreground/80 line-clamp-3">{m.story}</p>}
              </div>
            </button>
          ))}
        </div>

        {(memories.data ?? []).length === 0 && (hobbies.data ?? []).length === 0 && (
          <div className="bento p-8 mt-8 text-center text-muted-foreground">{t("memory_book_empty")}</div>
        )}
      </section>


      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpen(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 rounded-full bg-white/90 text-foreground"
            onClick={() => setOpen(null)}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="bento overflow-hidden">
              <div className="h-[70vh] bg-black">
                {open.path ? (
                  <SignedImage path={open.path} alt={open.title} className="h-full w-full object-contain" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-[#DCEEFB] to-[#FFF6DD]" />
                )}
              </div>
              <p className="p-4 font-display text-xl">{open.title}</p>
            </div>
          </div>
        </div>
      )}
    </SiteLayout>
  );
}
