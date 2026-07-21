import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import {
  Github, Linkedin, Twitter, Instagram, Youtube, Globe, Mail, Link as LinkIcon, Menu, X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/lib/i18n";

const ICON_MAP: Record<string, typeof Github> = {
  github: Github, linkedin: Linkedin, twitter: Twitter, x: Twitter,
  instagram: Instagram, youtube: Youtube, globe: Globe, website: Globe,
  mail: Mail, email: Mail, link: LinkIcon,
};

export function SocialIcon({ name }: { name: string }) {
  const Icon = ICON_MAP[name.toLowerCase()] ?? LinkIcon;
  return <Icon className="h-4 w-4" />;
}

const NAV = [
  { to: "/", key: "nav_home" as const },
  { to: "/journey", key: "nav_journey" as const },
  { to: "/people", key: "nav_people" as const },
  { to: "/memories", key: "nav_memories" as const },
  { to: "/diary", key: "nav_diary" as const },
  { to: "/thoughts", key: "nav_thoughts" as const },
  { to: "/contact", key: "nav_contact" as const },
];

function LangToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLang();
  return (
    <div className={`inline-flex items-center rounded-full border border-border bg-white p-0.5 text-xs font-mono ${className}`}>
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

function TopNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const { t } = useLang();

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-background/85 border-b border-border">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 h-16 lg:flex lg:justify-between">
          <Link to="/" className="min-w-0 truncate font-display text-lg sm:text-xl lg:text-2xl tracking-tight text-foreground">
            {t("fullName")}<span className="text-primary">.</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map((n) => {
              const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={
                    "px-3 py-1.5 rounded-full text-sm transition " +
                    (active
                      ? "bg-foreground text-background"
                      : "text-foreground/70 hover:text-foreground hover:bg-surface-2")
                  }
                >
                  {t(n.key)}
                </Link>
              );
            })}
            <div className="ml-2"><LangToggle /></div>
          </nav>

          <div className="flex items-center gap-2 lg:hidden shrink-0">
            <LangToggle />
            <button
              onClick={() => setOpen((v) => !v)}
              className="p-2 rounded-full border border-border bg-white"
              aria-label={t("menu")}
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden pb-4 grid gap-1">
            {NAV.map((n) => {
              const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className={
                    "px-3 py-2 rounded-xl text-sm " +
                    (active ? "bg-foreground text-background" : "text-foreground/80 hover:bg-surface-2")
                  }
                >
                  {t(n.key)}
                </Link>
              );
            })}
          </div>
        )}
      </div>
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
            <div className="mt-2 flex flex-wrap gap-2">
              {(socials.data ?? []).map((s) => (
                <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
                  aria-label={s.platform_name}
                  className="chip hover:bg-surface-2 transition">
                  <SocialIcon name={s.icon_name} />
                  <span>{s.platform_name}</span>
                </a>
              ))}
              {(socials.data ?? []).length === 0 && (
                <span className="text-sm text-muted-foreground">{t("coming_soon")}</span>
              )}
            </div>
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
      return data;
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
