import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import {
  Github, Linkedin, Twitter, Instagram, Youtube, Globe, Mail, Link as LinkIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ICON_MAP: Record<string, typeof Github> = {
  github: Github, linkedin: Linkedin, twitter: Twitter, x: Twitter,
  instagram: Instagram, youtube: Youtube, globe: Globe, website: Globe,
  mail: Mail, email: Mail, link: LinkIcon,
};

export function SocialIcon({ name }: { name: string }) {
  const Icon = ICON_MAP[name.toLowerCase()] ?? LinkIcon;
  return <Icon className="h-4 w-4" />;
}

const TIMELINE = [
  { to: "/", label: "Home", ts: "00:00" },
  { to: "/about", label: "About", ts: "00:24" },
  { to: "/projects", label: "Projects", ts: "01:12" },
  { to: "/services", label: "Services", ts: "02:04" },
  { to: "/contact", label: "Contact", ts: "03:00" },
] as const;

function activeIndex(pathname: string): number {
  if (pathname === "/") return 0;
  const i = TIMELINE.findIndex((t) => t.to !== "/" && pathname.startsWith(t.to));
  return i === -1 ? 0 : i;
}

function TimelineNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const idx = activeIndex(pathname);
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setScroll(h > 0 ? Math.min(1, window.scrollY / h) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  const n = TIMELINE.length - 1;
  const base = idx / n;
  const step = 1 / n;
  const playhead = Math.min(1, base + scroll * step);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[#14161C]/85 border-b border-border">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="mono text-xs tracking-[0.18em] uppercase text-foreground/90 flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-accent animate-pulse" />
            SHOIBUR.REEL
          </Link>
          <Link to="/admin" className="mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground">
            /ADMIN
          </Link>
        </div>

        {/* Timeline scrubber */}
        <div className="relative pb-3 pt-1 select-none">
          <div className="relative h-10">
            {/* base line */}
            <div className="absolute left-0 right-0 top-1/2 h-px bg-border" />
            {/* progress line */}
            <div
              className="absolute left-0 top-1/2 h-px bg-accent transition-[width] duration-150"
              style={{ width: `${playhead * 100}%` }}
            />
            {/* ticks */}
            {TIMELINE.map((t, i) => {
              const pct = (i / n) * 100;
              const active = i === idx;
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  className="absolute -translate-x-1/2 top-0 group"
                  style={{ left: `${pct}%` }}
                >
                  <div
                    className={`h-4 w-px ${active ? "bg-accent" : "bg-muted-foreground/60 group-hover:bg-foreground"}`}
                  />
                  <div className="mt-1 whitespace-nowrap">
                    <div className={`mono text-[10px] leading-none ${active ? "text-accent" : "text-muted-foreground/70"}`}>
                      {t.ts}
                    </div>
                    <div className={`mono text-[11px] leading-none mt-1 tracking-wider uppercase ${active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}>
                      {t.label}
                    </div>
                  </div>
                </Link>
              );
            })}
            {/* playhead */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-[left] duration-150"
              style={{ left: `${playhead * 100}%` }}
              aria-hidden
            >
              <div className="h-0 w-0 border-x-[6px] border-x-transparent border-t-[8px] border-t-accent mx-auto" />
              <div className="h-4 w-px bg-accent mx-auto -mt-px" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  const settings = useSettings();
  const socials = useSocials();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <TimelineNav />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border mt-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-10 grid gap-6 md:grid-cols-3 items-start">
          <div>
            <p className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">EOF / 03:24</p>
            <p className="mt-2 font-display text-xl">{settings.data?.name ?? "Shoibur Rahman"}</p>
            <p className="text-sm text-muted-foreground mt-1">{settings.data?.tagline || "Developer · Designer · Video Editor"}</p>
          </div>
          <div>
            <p className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">CHANNELS</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(socials.data ?? []).map((s) => (
                <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
                  aria-label={s.platform_name}
                  className="mono inline-flex items-center gap-2 border border-border px-3 py-1.5 text-xs hover:border-accent hover:text-accent transition">
                  <SocialIcon name={s.icon_name} />
                  <span className="uppercase tracking-wider">{s.platform_name}</span>
                </a>
              ))}
            </div>
          </div>
          <div className="md:text-right">
            <p className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">© {new Date().getFullYear()}</p>
            <p className="mono text-xs mt-2 text-muted-foreground">FRAMED IN LOVABLE · CUT FOR THE WEB</p>
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
