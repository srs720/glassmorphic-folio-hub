import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  Github, Linkedin, Twitter, Instagram, Youtube, Globe, Mail, Link as LinkIcon,
  Download, Send, ExternalLink,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getSignedUrl } from "@/lib/portfolio";
import { SignedImage } from "@/components/SignedImage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Portfolio — Home" },
      { name: "description", content: "Personal portfolio: about, projects, and contact." },
    ],
  }),
  component: HomePage,
});

const ICON_MAP: Record<string, typeof Github> = {
  github: Github, linkedin: Linkedin, twitter: Twitter, x: Twitter,
  instagram: Instagram, youtube: Youtube, globe: Globe, website: Globe,
  mail: Mail, email: Mail, link: LinkIcon,
};

function SocialIcon({ name }: { name: string }) {
  const Icon = ICON_MAP[name.toLowerCase()] ?? LinkIcon;
  return <Icon className="h-5 w-5" />;
}

function HomePage() {
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
  const projects = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  async function handleResumeDownload() {
    if (!settings.data?.resume_path) return;
    const url = await getSignedUrl(settings.data.resume_path, 300);
    if (url) window.open(url, "_blank");
  }

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="sticky top-4 z-40 mx-auto max-w-5xl px-4">
        <nav className="glass flex items-center justify-between px-5 py-3">
          <a href="#top" className="font-semibold tracking-tight">
            <span className="text-primary">●</span> {settings.data?.name ?? "Portfolio"}
          </a>
          <div className="flex items-center gap-1 text-sm">
            <a href="#about" className="rounded-lg px-3 py-1.5 hover:bg-white/50">About</a>
            <a href="#projects" className="rounded-lg px-3 py-1.5 hover:bg-white/50">Projects</a>
            <a href="#contact" className="rounded-lg px-3 py-1.5 hover:bg-white/50">Contact</a>
            <Link to="/admin" className="btn-ghost ml-2 text-sm">Admin</Link>
          </div>
        </nav>
      </header>

      {/* Hero / About */}
      <section id="about" className="mx-auto max-w-5xl px-4 pt-16 pb-24">
        <div className="glass-strong p-10 md:p-14">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">Portfolio</p>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
            {settings.data?.name ?? "Your Name"}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            {settings.data?.bio ?? "Loading…"}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {settings.data?.resume_path && (
              <button onClick={handleResumeDownload} className="btn-primary inline-flex items-center gap-2">
                <Download className="h-4 w-4" /> Download Resume
              </button>
            )}
            <a href="#contact" className="btn-ghost inline-flex items-center gap-2">
              <Mail className="h-4 w-4" /> Get in touch
            </a>
          </div>

          {socials.data && socials.data.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {socials.data.map((s) => (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass inline-flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/70 transition"
                  aria-label={s.platform_name}
                >
                  <SocialIcon name={s.icon_name} />
                  <span>{s.platform_name}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="mx-auto max-w-5xl px-4 pb-24">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-primary">Work</p>
            <h2 className="text-3xl font-bold tracking-tight">Selected Projects</h2>
          </div>
        </div>

        {projects.isLoading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="glass h-72 animate-pulse" />
            ))}
          </div>
        ) : projects.data?.length === 0 ? (
          <div className="glass p-10 text-center text-muted-foreground">
            No projects yet. Add some from the admin panel.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {projects.data?.map((p) => (
              <article key={p.id} className="glass overflow-hidden group">
                <div className="aspect-video overflow-hidden">
                  <SignedImage
                    path={p.image_path}
                    alt={p.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold">{p.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{p.description}</p>
                  {p.live_url && (
                    <a
                      href={p.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                    >
                      Visit live <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Contact */}
      <section id="contact" className="mx-auto max-w-3xl px-4 pb-24">
        <div className="glass-strong p-8 md:p-10">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">Contact</p>
          <h2 className="mt-1 text-3xl font-bold tracking-tight">Let's talk</h2>
          <p className="mt-2 text-muted-foreground">Have a project in mind? Send a message.</p>
          <ContactForm />
        </div>
      </section>

      <footer className="pb-10 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {settings.data?.name ?? "Portfolio"}
      </footer>
    </div>
  );
}

function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in every field.");
      return;
    }
    if (name.length > 100 || email.length > 255 || message.length > 2000) {
      toast.error("Input too long.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("messages").insert({
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
    });
    setLoading(false);
    if (error) {
      toast.error("Failed to send. Try again.");
      return;
    }
    toast.success("Message sent — thanks!");
    setName(""); setEmail(""); setMessage("");
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <input
          className="glass-input px-4 py-2.5 text-sm"
          placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)}
          maxLength={100}
        />
        <input
          className="glass-input px-4 py-2.5 text-sm"
          placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          maxLength={255}
        />
      </div>
      <textarea
        className="glass-input px-4 py-2.5 text-sm min-h-32"
        placeholder="Your message" value={message} onChange={(e) => setMessage(e.target.value)}
        maxLength={2000}
      />
      <button type="submit" disabled={loading} className="btn-primary inline-flex items-center justify-center gap-2 self-start">
        <Send className="h-4 w-4" /> {loading ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
