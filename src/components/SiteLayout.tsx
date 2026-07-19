import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import {
  Github, Linkedin, Twitter, Instagram, Youtube, Globe, Mail, Link as LinkIcon, Menu, X,
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

const NAV = [
  { to: "/", label: "Home" },
  { to: "/journey", label: "Journey" },
  { to: "/people", label: "People" },
  { to: "/memories", label: "Memories" },
  { to: "/diary", label: "Food Diary" },
  { to: "/thoughts", label: "Thoughts" },
] as const;

function TopNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-background/85 border-b border-border">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="font-display text-xl md:text-2xl tracking-tight text-foreground">
            Shoibur<span className="text-primary">.</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
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
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden p-2 rounded-full border border-border bg-white"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-4 grid gap-1">
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
                  {n.label}
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
  const settings = useSettings();
  const socials = useSocials();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <TopNav />
      <main className="flex-1">{children}</main>
      <footer className="mt-24 border-t border-border bg-surface-2/40">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-10 grid gap-8 md:grid-cols-3 items-start">
          <div>
            <p className="font-display text-2xl">{settings.data?.name ?? "Shoibur Rahman"}</p>
            <p className="text-sm text-muted-foreground mt-1">{settings.data?.identity_line || settings.data?.tagline || "Student · Web developer · Curious mind"}</p>
          </div>
          <div>
            <p className="label-mono">find me at</p>
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
                <span className="text-sm text-muted-foreground">Coming soon.</span>
              )}
            </div>
          </div>
          <div className="md:text-right">
            <p className="label-mono">© {new Date().getFullYear()}</p>
            <p className="text-sm mt-2 text-muted-foreground">Written from Bangladesh, with care.</p>
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
