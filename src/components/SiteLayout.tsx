import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
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

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/projects", label: "Projects" },
  { to: "/services", label: "Services" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteLayout({ children }: { children: ReactNode }) {
  const settings = useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();
      return data;
    },
  });
  const socials = useQuery({
    queryKey: ["social_links"],
    queryFn: async () => {
      const { data } = await supabase.from("social_links").select("*").order("sort_order");
      return data ?? [];
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-4 z-40 mx-auto w-full max-w-6xl px-4">
        <nav className="glass flex items-center justify-between gap-4 px-5 py-3">
          <Link to="/" className="font-semibold tracking-tight shrink-0">
            <span className="text-primary">●</span> {settings.data?.name ?? "Portfolio"}
          </Link>
          <div className="hidden md:flex items-center gap-1 text-sm">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.to === "/" }}
                className="rounded-lg px-3 py-1.5 hover:bg-white/60 transition"
                activeProps={{ className: "rounded-lg px-3 py-1.5 bg-white/80 text-primary font-medium" }}
              >
                {n.label}
              </Link>
            ))}
          </div>
          <Link to="/admin" className="btn-ghost text-sm">Admin</Link>
        </nav>
        {/* Mobile nav */}
        <div className="md:hidden mt-2 glass flex flex-wrap gap-1 px-3 py-2 text-xs">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }}
              className="rounded-md px-2 py-1 hover:bg-white/60"
              activeProps={{ className: "rounded-md px-2 py-1 bg-white/80 text-primary font-medium" }}>
              {n.label}
            </Link>
          ))}
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mx-auto w-full max-w-6xl px-4 pb-10 pt-16">
        <div className="glass p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold">{settings.data?.name ?? "Portfolio"}</p>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} — {settings.data?.tagline || "Personal portfolio"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(socials.data ?? []).map((s) => (
              <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
                aria-label={s.platform_name}
                className="glass inline-flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-white/70 transition">
                <SocialIcon name={s.icon_name} />
                <span>{s.platform_name}</span>
              </a>
            ))}
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
