import { useQuery } from "@tanstack/react-query";
import {
  Facebook, Github, Linkedin, Youtube, Mail, Phone,
  Twitter, Instagram, Globe, Link as LinkIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ICON_MAP: Record<string, typeof Github> = {
  github: Github, linkedin: Linkedin, twitter: Twitter, x: Twitter,
  instagram: Instagram, youtube: Youtube, globe: Globe, website: Globe,
  facebook: Facebook, mail: Mail, email: Mail, phone: Phone, link: LinkIcon,
};

export type ContactLink = { key: string; label: string; href: string; icon: string };

export function useContactLinks() {
  const settings = useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => (await supabase.from("site_settings").select("*").limit(1).maybeSingle()).data as any,
  });
  const socials = useQuery({
    queryKey: ["social_links"],
    queryFn: async () => (await supabase.from("social_links").select("*").order("sort_order")).data ?? [],
  });

  const s = settings.data ?? {};
  const links: ContactLink[] = [];
  if (s.phone) links.push({ key: "phone", label: s.phone, href: `tel:${String(s.phone).replace(/\s+/g, "")}`, icon: "phone" });
  if (s.contact_email) links.push({ key: "email", label: s.contact_email, href: `mailto:${s.contact_email}`, icon: "mail" });
  if (s.facebook_url) links.push({ key: "facebook", label: "Facebook", href: s.facebook_url, icon: "facebook" });
  if (s.youtube_url) links.push({ key: "youtube", label: "YouTube", href: s.youtube_url, icon: "youtube" });
  if (s.linkedin_url) links.push({ key: "linkedin", label: "LinkedIn", href: s.linkedin_url, icon: "linkedin" });
  if (s.github_url) links.push({ key: "github", label: "GitHub", href: s.github_url, icon: "github" });
  for (const row of (socials.data ?? []) as any[]) {
    links.push({ key: row.id, label: row.platform_name, href: row.url, icon: row.icon_name });
  }
  return links;
}

export function ContactIcon({ name }: { name: string }) {
  const Icon = ICON_MAP[(name || "link").toLowerCase()] ?? LinkIcon;
  return <Icon className="h-4 w-4" />;
}

/**
 * Minimal contact list.
 * variant="list"  → icon + label rows (used in the contact section)
 * variant="icons" → bare icons only (used in the footer)
 */
export function ContactLinks({
  className = "",
  variant = "list",
}: {
  className?: string;
  variant?: "list" | "icons";
}) {
  const links = useContactLinks();
  if (links.length === 0) return null;

  if (variant === "icons") {
    return (
      <div className={`flex flex-wrap items-center gap-4 ${className}`}>
        {links.map((l) => {
          const external = l.href.startsWith("http");
          return (
            <a
              key={l.key}
              href={l.href}
              aria-label={l.label}
              title={l.label}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="text-foreground/50 hover:text-primary transition"
            >
              <ContactIcon name={l.icon} />
            </a>
          );
        })}
      </div>
    );
  }

  return (
    <ul className={`grid gap-2.5 ${className}`}>
      {links.map((l) => {
        const external = l.href.startsWith("http");
        return (
          <li key={l.key}>
            <a
              href={l.href}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="inline-flex items-center gap-2.5 text-sm text-foreground/75 hover:text-primary transition"
            >
              <ContactIcon name={l.icon} />
              <span className="truncate">{l.label}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

