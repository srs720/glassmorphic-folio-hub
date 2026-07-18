import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getSignedUrl } from "@/lib/portfolio";
import { SignedImage } from "@/components/SignedImage";
import { SiteLayout, useSettings } from "@/components/SiteLayout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Shoibur Rahman" },
      { name: "description", content: "About Shoibur Rahman — developer, designer, and promotional video editor. Education, experience, and toolkit." },
      { property: "og:title", content: "About — Shoibur Rahman" },
      { property: "og:description", content: "About Shoibur Rahman — developer, designer, and promotional video editor. Education, experience, and toolkit." },
      { property: "og:url", content: "https://glassmorphic-folio-hub.lovable.app/about" },
      { property: "og:type", content: "profile" },
    ],
    links: [{ rel: "canonical", href: "https://glassmorphic-folio-hub.lovable.app/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  const settings = useSettings();
  const skills = useQuery({
    queryKey: ["skills"],
    queryFn: async () => (await supabase.from("skills").select("*").order("sort_order")).data ?? [],
  });

  async function downloadResume() {
    if (!settings.data?.resume_path) return;
    const url = await getSignedUrl(settings.data.resume_path, 300);
    if (url) window.open(url, "_blank");
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-4 md:px-6 pt-12">
        <p className="mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">// SCENE_02 · Character Sheet</p>
        <h1 className="mt-4 font-display text-5xl md:text-7xl uppercase leading-[0.9]">
          The <span className="text-accent">Editor</span><br/>Behind The Cut
        </h1>

        <div className="mt-10 grid gap-6 md:grid-cols-[280px_1fr]">
          <div className="surface p-2 aspect-[4/5] relative overflow-hidden film-grain">
            {settings.data?.avatar_path ? (
              <SignedImage path={settings.data.avatar_path} alt={settings.data.name} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-[#0f1116] flex items-center justify-center">
                <span className="font-display text-7xl text-accent/70">{(settings.data?.name ?? "S").charAt(0)}</span>
              </div>
            )}
          </div>
          <div className="surface p-6 md:p-8">
            <p className="text-lg leading-relaxed text-foreground/90">{settings.data?.bio}</p>
            {settings.data?.resume_path && (
              <button onClick={downloadResume} className="btn-primary mt-6 inline-flex items-center gap-2">
                <Download className="h-4 w-4" /> Download Resume
              </button>
            )}
            <div className="mt-8 grid gap-4 sm:grid-cols-3 border-t border-border pt-6">
              <Meta label="Education" value={settings.data?.education || "Class Ten (General Jim)"} />
              <Meta label="Experience" value={settings.data?.experience || "Freelance since 2022"} />
              <Meta label="Location" value={settings.data?.location || "Bangladesh"} />
            </div>
          </div>
        </div>

        <div className="mt-10 surface p-6 md:p-8">
          <p className="mono text-[11px] uppercase tracking-[0.22em] text-teal">// TOOLKIT</p>
          <h2 className="mt-2 font-display text-3xl uppercase">Skills On The Timeline</h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {(skills.data ?? []).map((s) => (
              <span key={s.id} className="tag-mono">{s.name}</span>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Meta({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm">{value || "—"}</p>
    </div>
  );
}
