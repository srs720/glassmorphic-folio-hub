import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Github, Linkedin, Twitter, Instagram, Youtube, Globe, Mail, Link as LinkIcon, Menu, X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/lib/i18n";
import { SignedImage } from "@/components/SignedImage";

const ICON_MAP: Record<string, typeof Github> = {
  github: Github, linkedin: Linkedin, twitter: Twitter, x: Twitter,
  instagram: Instagram, youtube: Youtube, globe: Globe, website: Globe,
  mail: Mail, email: Mail, link: LinkIcon,
};

export function SocialIcon({ name }: { name: string }) {
  const Icon = ICON_MAP[name.toLowerCase()] ?? LinkIcon;
  return <Icon className="h-4 w-4" />;
}

const SECTIONS = [
  { id: "home", key: "nav_home" as const },
  { id: "journey", key: "nav_journey" as const },
  { id: "people", key: "nav_people" as const },
  { id: "memories", key: "nav_memories" as const },
  { id: "certificates", key: "nav_certificates" as const },
  { id: "thoughts", key: "nav_thoughts" as const },
  { id: "posts", key: "nav_posts" as const },
  { id: "contact", key: "nav_contact" as const },
];

function LangToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLang();
  return (
    <div className={`inline-flex items-center rounded-full border border-border bg-white p-0.5 text-xs font-mono shadow-sm ${className}`}>
      <button
        onClick={() => setLang("en")}
        className={"px-2.5 py-1 rounded-full transition " + (lang === "en" ? "bg-foreground text-background" : "text-foreground/60 hover:text-foreground")}
        aria-pressed={lang === "en"}
      >EN</button>
      <button
        onClick={() => setLang("bn")}
        className={"px-2.5 py-1 rounded-full transition " + (lang === "bn" ? "bg-foreground text-background" : "text-foreground/60 hover:text-foreground")}
        aria-pressed={lang === "bn"}
      >BN</button>
    </div>
  );
}

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - 72;
  window.scrollTo({ top: y, behavior: "smooth" });
}

function TopNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { t } = useLang();
  const settings = useSettings();
  const onHome = pathname === "/";

  useEffect(() => { setOpen(false); }, [pathname]);

  // Handle deep-link hash after landing on home
  useEffect(() => {
    if (!onHome) return;
    if (typeof window === "undefined") return;
    const hash = window.location.hash?.replace("#", "");
    if (hash) {
      setTimeout(() => scrollToId(hash), 200);
    }
  }, [onHome]);

  function goTo(id: string) {
    setOpen(false);
    if (onHome) {
      scrollToId(id);
      history.replaceState(null, "", id === "home" ? "/" : `/#${id}`);
    } else {
      navigate({ to: "/", hash: id }).then(() => setTimeout(() => scrollToId(id), 200));
    }
  }

  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-background/85 border-b border-border">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex items-center gap-3 h-16">
          <button
            onClick={() => { if (onHome) scrollToId("home"); else navigate({ to: "/" }); }}
            className="flex items-center gap-2.5 min-w-0"
            aria-label={t("fullName")}
          >
            <div className="h-10 w-10 rounded-2xl overflow-hidden shrink-0 bg-white ring-1 ring-border shadow-sm flex items-center justify-center">
              {settings.data?.logo_path ? (
                <SignedImage path={settings.data.logo_path} alt={`${t("fullName")} logo`} className="h-full w-full object-cover" />
              ) : (
                <span className="font-display text-sm font-bold text-[#0E2A3F]">SR</span>
              )}
            </div>
            <span className="min-w-0 truncate font-display text-lg sm:text-xl tracking-tight text-foreground">
              {t("fullName")}
            </span>
          </button>

          <div className="ml-auto flex items-center gap-2 shrink-0">
            <LangToggle />
            <button
              onClick={() => setOpen((v) => !v)}
              className="p-2.5 rounded-full border border-border bg-white shadow-sm hover:bg-surface-2 transition"
              aria-label={t("menu")}
              aria-expanded={open}
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="absolute inset-x-0 top-16 border-b border-border bg-background/95 backdrop-blur shadow-lg"
          >
            <nav className="mx-auto max-w-7xl px-4 md:px-6 py-4 grid gap-1 sm:grid-cols-2 md:grid-cols-3">
              {SECTIONS.map((s, i) => (
                <motion.button
                  key={s.id}
                  onClick={() => goTo(s.id)}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.03 * i }}
                  className="text-left px-4 py-3 rounded-2xl font-display text-lg text-foreground hover:bg-surface-2 transition"
                >
                  <span className="font-mono text-[10px] text-primary mr-2 align-middle">
                    {String(i).padStart(2, "0")}
                  </span>
                  {t(s.key)}
                </motion.button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  const socials = useSocials();
  const { t } = useLang();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <TopNav />
      <main className="flex-1">{children}</main>
      <footer className="mt-24 border-t border-border bg-surface-2/40">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-10 grid gap-8 md:grid-cols-3 items-start">
          <div>
            <p className="font-display text-2xl">{t("fullName")}</p>
            <p className="text-sm text-muted-foreground mt-1">{t("tagline")}</p>
          </div>
          <div>
            <p className="label-mono">{t("find_me_at")}</p>
            <ContactLinks className="mt-2" />
          </div>
          <div className="md:text-right">
            <p className="label-mono">© {new Date().getFullYear()}</p>
            <p className="text-sm mt-2 text-muted-foreground">{t("footer_note")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function useSettings() {
  return useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();
      return data as any;
    },
  });
}

export function useSocials() {
  return useQuery({
    queryKey: ["social_links"],
    queryFn: async () => {
      const { data } = await supabase.from("social_links").select("*").order("sort_order");
      return data ?? [];
    },
  });
}
