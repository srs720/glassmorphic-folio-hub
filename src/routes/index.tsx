import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Download, ArrowRight, Mail, Sparkles, Code, Palette, Video, Database, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getSignedUrl } from "@/lib/portfolio";
import { SignedImage } from "@/components/SignedImage";
import { SiteLayout, useSettings } from "@/components/SiteLayout";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Shoibur Rahman — Developer, Designer & Video Editor" },
      { name: "description", content: "Personal portfolio of Shoibur Rahman — web development, logo design, and promotional video editing." },
      { property: "og:title", content: "Shoibur Rahman — Developer, Designer & Video Editor" },
      { property: "og:description", content: "Personal portfolio of Shoibur Rahman — web development, logo design, and promotional video editing." },
    ],
  }),
  component: HomePage,
});

const ICONS: Record<string, typeof Sparkles> = {
  code: Code, palette: Palette, video: Video, database: Database, sparkles: Sparkles,
};

function HomePage() {
  const settings = useSettings();
  const projects = useQuery({
    queryKey: ["projects_featured"],
    queryFn: async () => {
      const { data } = await supabase.from("projects").select("*").eq("featured", true).order("sort_order").limit(4);
      return data ?? [];
    },
  });
  const skills = useQuery({
    queryKey: ["skills"],
    queryFn: async () => {
      const { data } = await supabase.from("skills").select("*").order("sort_order");
      return data ?? [];
    },
  });
  const services = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data } = await supabase.from("services").select("*").order("sort_order").limit(4);
      return data ?? [];
    },
  });
  const testimonials = useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const { data } = await supabase.from("testimonials").select("*").order("sort_order");
      return data ?? [];
    },
  });

  async function downloadResume() {
    if (!settings.data?.resume_path) return;
    const url = await getSignedUrl(settings.data.resume_path, 300);
    if (url) window.open(url, "_blank");
  }

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-12 pb-20">
        <div className="glass-strong p-8 md:p-14 grid gap-10 md:grid-cols-[auto_1fr] items-center">
          <div className="mx-auto md:mx-0 h-40 w-40 md:h-52 md:w-52 rounded-full overflow-hidden ring-4 ring-white/70 shadow-xl bg-gradient-to-br from-mint to-emerald-soft flex items-center justify-center">
            {settings.data?.avatar_path ? (
              <SignedImage path={settings.data.avatar_path} alt={settings.data.name} className="h-full w-full object-cover" />
            ) : (
              <span className="text-5xl font-bold text-white/90">
                {(settings.data?.name ?? "S").charAt(0)}
              </span>
            )}
          </div>
          <div>
            <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
              {settings.data?.tagline || "Portfolio"}
            </p>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Hi, I'm {settings.data?.name ?? "Shoibur Rahman"}
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              {settings.data?.bio}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/projects" className="btn-primary inline-flex items-center gap-2">
                View my work <ArrowRight className="h-4 w-4" />
              </Link>
              {settings.data?.resume_path && (
                <button onClick={downloadResume} className="btn-ghost inline-flex items-center gap-2">
                  <Download className="h-4 w-4" /> Resume
                </button>
              )}
              <Link to="/contact" className="btn-ghost inline-flex items-center gap-2">
                <Mail className="h-4 w-4" /> Contact
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About preview */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="glass p-8 md:p-10 grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <p className="text-sm font-medium uppercase tracking-widest text-primary">About</p>
            <h2 className="mt-1 text-3xl font-bold">A little about me</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">{settings.data?.bio}</p>
            <Link to="/about" className="mt-6 inline-flex items-center gap-1 text-primary font-medium hover:underline">
              Learn more <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-3">
            <div className="glass p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Education</p>
              <p className="mt-1 font-semibold">{settings.data?.education}</p>
            </div>
            <div className="glass p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Location</p>
              <p className="mt-1 font-semibold">{settings.data?.location}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-primary">Work</p>
            <h2 className="text-3xl font-bold">Featured Projects</h2>
          </div>
          <Link to="/projects" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
            All projects <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {(projects.data ?? []).map((p) => (
            <Link key={p.id} to="/projects/$id" params={{ id: p.id }} className="glass overflow-hidden group">
              <div className="aspect-video overflow-hidden bg-gradient-to-br from-mint/30 to-emerald-soft/30">
                <SignedImage path={p.image_path} alt={p.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                {p.tags?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.tags.map((t: string) => (
                      <span key={t} className="text-xs bg-primary/10 text-primary rounded-md px-2 py-0.5">{t}</span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="glass-strong p-8 md:p-10">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">Skills</p>
          <h2 className="text-3xl font-bold">What I do</h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {(skills.data ?? []).map((s) => (
              <span key={s.id} className="glass px-4 py-2 text-sm font-medium">
                {s.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Services preview */}
      {(services.data ?? []).length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-20">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-widest text-primary">Services</p>
              <h2 className="text-3xl font-bold">How I can help</h2>
            </div>
            <Link to="/services" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
              See all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.data!.map((s) => {
              const Icon = ICONS[s.icon_name] ?? Sparkles;
              return (
                <div key={s.id} className="glass p-5">
                  <div className="rounded-xl bg-primary/15 text-primary p-2.5 w-fit"><Icon className="h-5 w-5" /></div>
                  <h3 className="mt-3 font-semibold">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-3">{s.description}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Testimonials */}
      {(testimonials.data ?? []).length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-20">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">Testimonials</p>
          <h2 className="text-3xl font-bold">Kind words</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.data!.map((t) => (
              <div key={t.id} className="glass p-6">
                <p className="text-sm leading-relaxed">"{t.content}"</p>
                <p className="mt-4 text-sm font-semibold">{t.author_name}</p>
                <p className="text-xs text-muted-foreground">{t.author_role}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 pb-20">
        <div className="glass-strong p-10 text-center">
          <h2 className="text-3xl font-bold">Have a project in mind?</h2>
          <p className="mt-3 text-muted-foreground">Let's build something great together.</p>
          <Link to="/contact" className="btn-primary mt-6 inline-flex items-center gap-2">
            Get in touch <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
