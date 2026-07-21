import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout, useSettings } from "@/components/SiteLayout";
import { SignedImage } from "@/components/SignedImage";
import { ArrowRight, GraduationCap, Users, Camera, Utensils, Quote as QuoteIcon, Sparkles } from "lucide-react";
import { useLang } from "@/lib/i18n";

const CANONICAL = "https://shoiburrahman.com";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Shoibur Rahman - Student & Web Developer" },
      { name: "description", content: "Shoibur Rahman — student of Darunnazat Siddikia Kamil Madrasah and passionate full-stack web developer. A personal digital diary." },
      { property: "og:title", content: "Shoibur Rahman - Student & Web Developer" },
      { property: "og:description", content: "Personal digital diary — journey, people, memories, food and thoughts by Shoibur Rahman." },
      { property: "og:url", content: `${CANONICAL}/` },
    ],
    links: [{ rel: "canonical", href: `${CANONICAL}/` }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Person",
        name: "Shoibur Rahman",
        url: CANONICAL,
        description: "Student of Darunnazat Siddikia Kamil Madrasah and full-stack web developer.",
      }),
    }],
  }),
  component: HomePage,
});

function HomePage() {
  const settings = useSettings();
  const { t, lang } = useLang();
  const quotes = useQuery({
    queryKey: ["quotes_home"],
    queryFn: async () => (await supabase.from("quotes").select("*").order("sort_order").limit(1)).data ?? [],
  });
  const memories = useQuery({
    queryKey: ["memories_home"],
    queryFn: async () => (await supabase.from("memories").select("*").order("sort_order").limit(2)).data ?? [],
  });

  const greeting = t("home_greeting");
  const bio = t("home_bio");

  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-4 md:px-6 pt-10 md:pt-16">
        <div className="grid gap-4 md:gap-5 md:grid-cols-6 md:grid-rows-2">
          <div className="bento p-6 md:p-10 md:col-span-4 md:row-span-2 flex flex-col justify-between min-h-[360px]">
            <div>
              <p className="label-mono">{t("home_kicker")}</p>
              <h1 className="mt-4 font-display text-4xl sm:text-5xl md:text-7xl leading-[1.02] tracking-tight">
                {greeting}
              </h1>
              <p className="mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
                {bio}
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/journey" className="btn-primary">
                {t("home_cta_journey")} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/memories" className="btn-ghost">{t("home_cta_memories")}</Link>
            </div>
          </div>

          <div className="bento md:col-span-2 md:row-span-2 overflow-hidden relative min-h-[280px]">
            {settings.data?.hero_image_path || settings.data?.avatar_path ? (
              <SignedImage
                path={settings.data.hero_image_path || settings.data.avatar_path}
                alt={t("fullName")}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#EAF5FE] via-white to-[#FFF6DD] flex items-center justify-center">
                <div className="text-center px-6">
                  <div className="mx-auto h-24 w-24 rounded-full bg-white shadow-md flex items-center justify-center text-4xl font-display">
                    {lang === "bn" ? "শো" : "S"}
                  </div>
                  <p className="mt-4 label-mono">{t("profile_picture")}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:gap-5 grid-cols-2 md:grid-cols-4">
          <TileLink to="/journey" tone="blue" icon={GraduationCap} label={t("nav_journey")} caption={t("tile_journey_caption")} openLabel={t("open")} />
          <TileLink to="/people" tone="white" icon={Users} label={t("nav_people")} caption={t("tile_people_caption")} openLabel={t("open")} />
          <TileLink to="/memories" tone="yellow" icon={Camera} label={t("nav_memories")} caption={t("tile_memories_caption")} openLabel={t("open")} />
          <TileLink to="/diary" tone="cream" icon={Utensils} label={t("nav_diary")} caption={t("tile_diary_caption")} openLabel={t("open")} />
        </div>

        <div className="mt-5 grid gap-4 md:gap-5 md:grid-cols-3">
          <div className="bento-yellow p-6 md:col-span-1 flex flex-col justify-between min-h-[220px]">
            <QuoteIcon className="h-6 w-6 text-foreground/70" />
            <div className="mt-6">
              <p className="font-display text-2xl leading-snug">
                "{quotes.data?.[0]?.text ?? (lang === "bn" ? "কাগজে নিখুঁত পরিকল্পনার চেয়ে প্রতিদিনের ছোট পদক্ষেপই এগিয়ে।" : "Small steps every day beat perfect plans on paper.")}"
              </p>
              <p className="mt-3 label-mono">— {quotes.data?.[0]?.author ?? t("fullName")}</p>
            </div>
          </div>

          {(memories.data ?? []).slice(0, 2).map((m) => (
            <Link key={m.id} to="/memories" className="bento overflow-hidden md:col-span-1 group relative min-h-[220px]">
              {m.image_path ? (
                <SignedImage path={m.image_path} alt={m.title} className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition duration-500" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#DCEEFB] to-[#FFF6DD]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <p className="label-mono text-white/80">{t("featured_memory")}</p>
                <p className="font-display text-xl mt-1">{m.title}</p>
                {m.location && <p className="text-sm text-white/80">{m.location}</p>}
              </div>
            </Link>
          ))}

          {(memories.data ?? []).length === 0 && (
            <div className="bento-blue p-6 md:col-span-2 flex items-center gap-4">
              <Sparkles className="h-6 w-6" />
              <p className="text-lg">{t("more_soon")}</p>
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}

function TileLink({
  to, tone, icon: Icon, label, caption, openLabel,
}: {
  to: string; tone: "blue" | "white" | "yellow" | "cream";
  icon: typeof GraduationCap; label: string; caption: string; openLabel: string;
}) {
  const cls =
    tone === "blue" ? "bento-blue" :
    tone === "yellow" ? "bento-yellow" :
    tone === "cream" ? "bento-cream" : "bento";
  return (
    <Link to={to} className={`${cls} p-5 group transition hover:-translate-y-0.5`}>
      <Icon className="h-6 w-6" />
      <p className="mt-4 font-display text-2xl">{label}</p>
      <p className="text-sm text-muted-foreground mt-1">{caption}</p>
      <p className="mt-4 label-mono inline-flex items-center gap-1 group-hover:gap-2 transition-all">
        {openLabel} <ArrowRight className="h-3 w-3" />
      </p>
    </Link>
  );
}
