import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import type { FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout, useSettings } from "@/components/SiteLayout";
import { ContactLinks } from "@/components/ContactLinks";
import { ShareButton } from "@/components/ShareButton";
import { SignedImage } from "@/components/SignedImage";
import { HeroSlider } from "@/components/HeroSlider";
import { Reveal, Stagger, StaggerItem, HoverCard } from "@/components/Reveal";
import {
  GraduationCap, BookOpen, Sparkles, Award, Send, Mail, Quote as QuoteIcon,
  ArrowDown, ArrowRight, Calendar,
} from "lucide-react";
import { useLang, pickLang } from "@/lib/i18n";
import { Lightbox } from "@/components/Lightbox";
import { Link } from "@tanstack/react-router";

const CANONICAL = "https://shoiburrahman.com";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Shoibur Rahman - Student & Web Developer" },
      { name: "description", content: "Shoibur Rahman — student of Darunnazat Siddikia Kamil Madrasah and passionate full-stack web developer. A bilingual personal digital diary." },
      { property: "og:title", content: "Shoibur Rahman - Student & Web Developer" },
      { property: "og:description", content: "Shoibur Rahman — student of Darunnazat Siddikia Kamil Madrasah and passionate full-stack web developer. A bilingual personal digital diary." },
      { property: "og:url", content: `${CANONICAL}/` },
      { property: "og:site_name", content: "Shoibur Rahman" },
    ],
    links: [{ rel: "canonical", href: `${CANONICAL}/` }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org", "@type": "Person",
        name: "Shoibur Rahman", url: CANONICAL,
        description: "Student of Darunnazat Siddikia Kamil Madrasah and full-stack web developer.",
      }),
    }],
  }),
  component: HomePage,
});

function SectionHeader({ chapter, title, intro, id }: { chapter: string; title: string; intro?: string; id?: string }) {
  return (
    <Reveal className="mb-8 md:mb-10" as="header">
      <p className="label-mono">{chapter}</p>
      <h2 className="mt-3 font-display text-3xl sm:text-4xl md:text-5xl tracking-tight" id={id}>{title}</h2>
      {intro && <p className="mt-3 max-w-2xl text-base md:text-lg text-muted-foreground">{intro}</p>}
    </Reveal>
  );
}

function HomePage() {
  const { t, lang } = useLang();
  const settings = useSettings();
  const sliderPaths: string[] = (settings.data?.slider_images ?? []).filter(Boolean);
  const heroFallback = settings.data?.hero_image_path || settings.data?.avatar_path;

  return (
    <SiteLayout>
      {/* ============ HERO with slider ============ */}
      <section id="home" className="relative min-h-[92vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          {sliderPaths.length > 0 ? (
            <HeroSlider paths={sliderPaths} alt={t("fullName")} />
          ) : heroFallback ? (
            <SignedImage path={heroFallback} alt={t("fullName")} className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#EAF5FE] via-white to-[#DCEEFB]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/25 to-background" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 md:px-6 py-20 md:py-28 w-full">
          <div className="max-w-3xl rounded-[28px] border border-white/60 bg-white/60 p-6 sm:p-9 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.45)] backdrop-blur-xl backdrop-saturate-150">
            <Reveal>
              <p className="label-mono">{t("home_kicker")}</p>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="mt-4 font-display text-4xl sm:text-6xl md:text-7xl leading-[1.02] tracking-tight text-foreground drop-shadow-sm">
                {t("home_greeting")}
              </h1>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-6 max-w-2xl text-lg md:text-xl text-foreground/80 leading-relaxed">
                {t("home_bio")}
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#journey" onClick={(e) => { e.preventDefault(); document.getElementById("journey")?.scrollIntoView({ behavior: "smooth" }); }} className="btn-primary">
                  {t("home_cta_journey")} <ArrowDown className="h-4 w-4" />
                </a>
                <a href="#contact" onClick={(e) => { e.preventDefault(); document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }); }} className="btn-ghost">
                  {t("nav_contact")}
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ JOURNEY ============ */}
      <section id="journey" className="mx-auto max-w-6xl px-4 md:px-6 pt-20 md:pt-28 scroll-mt-20">
        <SectionHeader chapter={t("chapter_one")} title={t("journey_title")} intro={t("journey_intro")} />
        <JourneySection />
      </section>

      {/* ============ PEOPLE ============ */}
      <section id="people" className="mx-auto max-w-6xl px-4 md:px-6 pt-20 md:pt-28 scroll-mt-20">
        <SectionHeader chapter={t("chapter_two")} title={t("people_title")} intro={t("people_intro")} />
        <PeopleSection />
      </section>

      {/* ============ HOBBIES ============ */}
      <section id="hobbies" className="mx-auto max-w-6xl px-4 md:px-6 pt-20 md:pt-28 scroll-mt-20">
        <SectionHeader chapter={t("chapter_three")} title={t("hobbies")} intro={t("memories_intro")} />
        <HobbiesSection />
      </section>

      {/* ============ CERTIFICATES ============ */}
      <section id="certificates" className="mx-auto max-w-6xl px-4 md:px-6 pt-20 md:pt-28 scroll-mt-20">
        <SectionHeader chapter={t("chapter_four")} title={t("certificates_title")} intro={t("certificates_intro")} />
        <CertificatesSection />
      </section>

      {/* ============ THOUGHTS ============ */}
      <section id="thoughts" className="mx-auto max-w-6xl px-4 md:px-6 pt-20 md:pt-28 scroll-mt-20">
        <SectionHeader chapter={t("chapter_five")} title={t("thoughts_title")} intro={t("thoughts_intro")} />
        <ThoughtsSection />
      </section>

      {/* ============ RESEARCH & POSTS ============ */}
      <section id="posts" className="mx-auto max-w-6xl px-4 md:px-6 pt-20 md:pt-28 scroll-mt-20">
        <SectionHeader chapter={t("chapter_six")} title={t("posts_title")} intro={t("posts_intro")} />
        <PostsFeed />
      </section>

      {/* ============ CONTACT ============ */}
      <section id="contact" className="mx-auto max-w-6xl px-4 md:px-6 pt-20 md:pt-28 scroll-mt-20">
        <Reveal className="mb-8">
          <p className="label-mono">{t("say_hello")}</p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl md:text-5xl">{t("lets_talk")}</h2>
        </Reveal>
        <ContactSection />
      </section>

      <div className="pb-16" />
    </SiteLayout>
  );
}

/* ------------------ Journey — vertical timeline ------------------ */
function JourneySection() {
  const { t, lang } = useLang();
  const ORDER = ["current", "past", "future", "certificate"] as const;
  const META: Record<string, { title: string; icon: typeof GraduationCap }> = {
    current: { title: t("edu_current"), icon: GraduationCap },
    past: { title: t("edu_past"), icon: BookOpen },
    future: { title: t("edu_future"), icon: Sparkles },
    certificate: { title: t("edu_cert"), icon: Award },
  };
  const q = useQuery({
    queryKey: ["education_entries"],
    queryFn: async () => (await supabase.from("education_entries").select("*").order("sort_order")).data ?? [],
  });
  const entries = (q.data ?? [])
    .slice()
    .sort((a: any, b: any) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind) || a.sort_order - b.sort_order);

  if (entries.length === 0) {
    return <p className="text-muted-foreground">{t("timeline_soon")}</p>;
  }

  return (
    <Stagger className="relative ml-1 border-l border-foreground/12 pl-8 md:pl-10">
      {entries.map((e: any) => {
        const m = META[e.kind] ?? META["past"]!;
        const Icon = m.icon;
        return (
          <StaggerItem key={e.id} className="relative pb-10 last:pb-0">
            <span className="absolute -left-[42px] md:-left-[50px] top-0 grid h-8 w-8 place-items-center rounded-full bg-white ring-1 ring-border shadow-sm">
              <Icon className="h-4 w-4 text-primary" />
            </span>
            <p className="label-mono">{pickLang(e, "period", lang) || m.title}</p>
            <h3 className="mt-1.5 font-display text-2xl md:text-3xl leading-tight">
              {pickLang(e, "title", lang)}
            </h3>
            {pickLang(e, "institution", lang) && (
              <p className="mt-1 text-sm text-foreground/70">{pickLang(e, "institution", lang)}</p>
            )}
            {pickLang(e, "description", lang) && (
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-foreground/80">
                {pickLang(e, "description", lang)}
              </p>
            )}
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}


/* ------------------ People ------------------ */
function PeopleSection() {
  const { t, lang } = useLang();
  const GROUPS: { key: "family" | "teacher" | "friend"; title: string; tone: string }[] = [
    { key: "family", title: t("group_family"), tone: "bento-yellow" },
    { key: "teacher", title: t("group_teachers"), tone: "bento-blue" },
    { key: "friend", title: t("group_friends"), tone: "bento" },
  ];
  const q = useQuery({
    queryKey: ["people"],
    queryFn: async () => (await supabase.from("people").select("*").order("sort_order")).data ?? [],
  });
  return (
    <div className="grid gap-10">
      {GROUPS.map((g) => {
        const list = (q.data ?? []).filter((p: any) => p.category === g.key);
        if (list.length === 0) return null;
        return (
          <div key={g.key}>
            <Reveal><h3 className="font-display text-2xl mb-4">{g.title}</h3></Reveal>
            <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((p: any) => (
                <StaggerItem key={p.id}>
                  <HoverCard className={`${g.tone} p-5 flex gap-4 items-start h-full`}>
                    <div className="h-20 w-20 rounded-2xl overflow-hidden shrink-0 bg-white border border-border">
                      {p.image_path ? (
                        <SignedImage path={p.image_path} alt={pickLang(p, "name", lang)} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center font-display text-3xl text-foreground/50">{pickLang(p, "name", lang).charAt(0)}</div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-display text-xl leading-tight">{pickLang(p, "name", lang)}</p>
                      {pickLang(p, "relation", lang) && <p className="label-mono mt-0.5">{pickLang(p, "relation", lang)}</p>}
                      {pickLang(p, "note", lang) && <p className="text-sm mt-2 text-foreground/80">{pickLang(p, "note", lang)}</p>}
                    </div>
                  </HoverCard>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        );
      })}
      {(q.data ?? []).length === 0 && (
        <div className="bento p-8 text-center text-muted-foreground">{t("people_soon")}</div>
      )}
    </div>
  );
}

/* ------------------ Hobbies ------------------ */
function HobbiesSection() {
  const { t, lang } = useLang();
  const hobbies = useQuery({
    queryKey: ["hobbies"],
    queryFn: async () => (await supabase.from("hobbies").select("*").order("sort_order")).data ?? [],
  });
  const list = hobbies.data ?? [];
  return (
    <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[minmax(0,auto)]">
      {list.map((h: any, idx: number) => (
        <StaggerItem key={h.id} className={idx % 5 === 0 ? "md:col-span-2" : ""}>
          <HoverCard className="bento p-5 h-full">
            <div className={`w-full rounded-2xl overflow-hidden bg-surface-2 mb-4 ${idx % 5 === 0 ? "h-56" : "h-40"}`}>
              {h.image_path ? (
                <SignedImage path={h.image_path} alt={pickLang(h, "title", lang)} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-[#EAF5FE] to-[#FFF6DD]" />
              )}
            </div>
            <p className="font-display text-xl">{pickLang(h, "title", lang)}</p>
            {pickLang(h, "description", lang) && (
              <p className="text-sm text-foreground/80 mt-2">{pickLang(h, "description", lang)}</p>
            )}
          </HoverCard>
        </StaggerItem>
      ))}
      {list.length === 0 && (
        <div className="bento p-8 col-span-full text-center text-muted-foreground">{t("hobbies")}</div>
      )}
    </Stagger>
  );
}

/* ------------------ Certificates ------------------ */
function CertificatesSection() {
  const { t, lang } = useLang();
  const [open, setOpen] = useState<any | null>(null);
  const q = useQuery({
    queryKey: ["certificates"],
    queryFn: async () => (await supabase.from("certificates").select("*").order("sort_order")).data ?? [],
  });
  return (
    <>
      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(q.data ?? []).map((c: any) => {
          const title = pickLang(c, "title", lang);
          return (
            <StaggerItem key={c.id}>
              <HoverCard className="bento overflow-hidden h-full">
                <button type="button" onClick={() => setOpen(c)} className="block w-full text-left">
                  <div className="h-48 w-full bg-surface-2">
                    {c.image_path ? (
                      <SignedImage path={c.image_path} alt={title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-[#EAF5FE] to-[#DCEEFB] flex items-center justify-center">
                        <Award className="h-8 w-8 text-foreground/40" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="font-display text-xl">{title}</p>
                    {pickLang(c, "issuer", lang) && <p className="label-mono mt-1">{pickLang(c, "issuer", lang)}</p>}
                    {pickLang(c, "description", lang) && (
                      <p className="text-sm mt-2 text-foreground/80">{pickLang(c, "description", lang)}</p>
                    )}
                    <span className="mt-3 inline-flex items-center gap-1 text-sm text-primary">
                      {t("view_certificate")} <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </button>
              </HoverCard>
            </StaggerItem>
          );
        })}
        {(q.data ?? []).length === 0 && (
          <div className="bento p-8 col-span-full text-center text-muted-foreground">{t("certificates_empty")}</div>
        )}
      </Stagger>
      <Lightbox
        path={open?.image_path ?? null}
        alt={open ? pickLang(open, "title", lang) : ""}
        caption={open ? pickLang(open, "description", lang) : undefined}
        onClose={() => setOpen(null)}
      />
    </>
  );
}

/* ------------------ Research & Posts feed ------------------ */
function PostsFeed() {
  const { t, lang } = useLang();
  const q = useQuery({
    queryKey: ["posts_feed"],
    queryFn: async () =>
      (await supabase
        .from("blog_posts")
        .select("*")
        .in("status", ["published", "scheduled"])
        .order("published_at", { ascending: false })).data ?? [],
  });

  if (q.isLoading) {
    return (
      <div className="grid gap-5 md:grid-cols-2" aria-busy="true">
        {[0, 1].map((i) => (
          <div key={i} className="bento overflow-hidden">
            <div className="h-52 w-full animate-pulse bg-surface-2" />
            <div className="p-6 space-y-3">
              <div className="h-3 w-24 animate-pulse rounded bg-surface-2" />
              <div className="h-6 w-3/4 animate-pulse rounded bg-surface-2" />
              <div className="h-4 w-full animate-pulse rounded bg-surface-2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Stagger className="grid gap-5 md:grid-cols-2">

      {(q.data ?? []).map((p: any) => (
        <StaggerItem key={p.id}>
          <HoverCard className="bento overflow-hidden h-full">
            <Link to="/post/$slug" params={{ slug: p.slug }} className="block h-full">
              <div className="h-52 w-full bg-surface-2">
                {p.cover_path ? (
                  <SignedImage path={p.cover_path} alt={pickLang(p, "title", lang)} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-[#DCEEFB] to-[#EAF5FE]" />
                )}
              </div>
              <div className="p-6">
                <p className="label-mono inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(p.published_at ?? p.created_at).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </p>
                <h3 className="mt-2 font-display text-2xl leading-snug">{pickLang(p, "title", lang)}</h3>
                {pickLang(p, "excerpt", lang) && (
                  <p className="mt-2 text-sm text-foreground/80 line-clamp-3">{pickLang(p, "excerpt", lang)}</p>
                )}
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1 text-sm text-primary">
                    {t("read_more")} <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                  <ShareButton
                    title={pickLang(p, "title", lang)}
                    text={pickLang(p, "excerpt", lang)}
                    url={`/post/${p.slug}`}
                  />
                </div>
              </div>
            </Link>
          </HoverCard>
        </StaggerItem>
      ))}
      {(q.data ?? []).length === 0 && (
        <div className="bento p-8 md:col-span-2 text-center text-muted-foreground">{t("posts_empty")}</div>
      )}
    </Stagger>
  );
}

/* ------------------ Thoughts ------------------ */
function ThoughtsSection() {
  const { t, lang } = useLang();
  const TONES = ["bento", "bento-blue", "bento-yellow", "bento-cream"] as const;
  const q = useQuery({
    queryKey: ["quotes"],
    queryFn: async () => (await supabase.from("quotes").select("*").order("sort_order")).data ?? [],
  });
  return (
    <Stagger className="grid gap-4 md:gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {(q.data ?? []).map((qt: any, i: number) => (
        <StaggerItem key={qt.id}>
          <HoverCard className={`${TONES[i % TONES.length]} p-6 flex flex-col justify-between min-h-[220px] h-full`}>
            <QuoteIcon className="h-6 w-6 text-foreground/60" />
            <div className="mt-6">
              <p className="font-display text-2xl leading-snug">"{pickLang(qt, "text", lang)}"</p>
              <p className="mt-3 label-mono">— {pickLang(qt, "author", lang) || t("fullName")}{pickLang(qt, "category", lang) ? ` · ${pickLang(qt, "category", lang)}` : ""}</p>
            </div>
          </HoverCard>
        </StaggerItem>
      ))}
      {(q.data ?? []).length === 0 && (
        <div className="bento p-8 col-span-full text-center text-muted-foreground">{t("still_thinking")}</div>
      )}
    </Stagger>
  );
}

/* ------------------ Contact ------------------ */
function ContactSection() {
  const { t } = useLang();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) { toast.error(t("fill_all")); return; }
    setSending(true);
    const { error } = await supabase.from("messages").insert({ name, email, message });
    setSending(false);
    if (error) return toast.error(t("send_error"));
    toast.success(t("send_ok"));
    setName(""); setEmail(""); setMessage("");
  }

  return (
    <div className="grid gap-5 md:grid-cols-5">
      <Reveal className="md:col-span-3">
        <form onSubmit={submit} className="bento p-6 md:p-8 grid gap-4">
          <div>
            <label className="label-mono">{t("your_name")}</label>
            <input className="field mt-2" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("name_placeholder")} />
          </div>
          <div>
            <label className="label-mono">{t("your_email")}</label>
            <input type="email" className="field mt-2" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div>
            <label className="label-mono">{t("message")}</label>
            <textarea className="field mt-2 min-h-[140px]" value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t("msg_placeholder")} />
          </div>
          <div>
            <button disabled={sending} className="btn-primary">
              {sending ? t("sending") : (<>{t("send_message")} <Send className="h-4 w-4" /></>)}
            </button>
          </div>
        </form>
      </Reveal>

      <Reveal delay={0.15} className="md:col-span-2 grid gap-4 content-start">
        <div className="bento-blue p-6">
          <Mail className="h-5 w-5" />
          <p className="mt-3 font-display text-xl">{t("prefer_other")}</p>
          <p className="text-sm text-foreground/80 mt-2">{t("channels_note")}</p>
        </div>
        <div className="bento p-6">
          <p className="label-mono">{t("find_me_at")}</p>
          <ContactLinks className="mt-3" />
        </div>
      </Reveal>
    </div>
  );
}
