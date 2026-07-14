import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Download, GraduationCap, Briefcase, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getSignedUrl } from "@/lib/portfolio";
import { SignedImage } from "@/components/SignedImage";
import { SiteLayout, useSettings } from "@/components/SiteLayout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Shoibur Rahman" },
      { name: "description", content: "About Shoibur Rahman: education, experience, and skills." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const settings = useSettings();
  const skills = useQuery({
    queryKey: ["skills"],
    queryFn: async () => {
      const { data } = await supabase.from("skills").select("*").order("sort_order");
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
      <section className="mx-auto max-w-5xl px-4 pt-12 pb-20">
        <div className="glass-strong p-8 md:p-12 grid gap-8 md:grid-cols-[auto_1fr]">
          <div className="mx-auto md:mx-0 h-36 w-36 rounded-full overflow-hidden ring-4 ring-white/70 shadow-lg bg-gradient-to-br from-mint to-emerald-soft flex items-center justify-center">
            {settings.data?.avatar_path ? (
              <SignedImage path={settings.data.avatar_path} alt={settings.data.name} className="h-full w-full object-cover" />
            ) : (
              <span className="text-4xl font-bold text-white/90">
                {(settings.data?.name ?? "S").charAt(0)}
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-primary">About Me</p>
            <h1 className="text-4xl font-bold mt-1">{settings.data?.name}</h1>
            <p className="text-muted-foreground">{settings.data?.tagline}</p>
            <p className="mt-6 text-lg leading-relaxed">{settings.data?.bio}</p>
            {settings.data?.resume_path && (
              <button onClick={downloadResume} className="btn-primary mt-6 inline-flex items-center gap-2">
                <Download className="h-4 w-4" /> Download Resume
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <InfoCard icon={GraduationCap} title="Education" body={settings.data?.education} />
          <InfoCard icon={Briefcase} title="Experience" body={settings.data?.experience} />
          <InfoCard icon={MapPin} title="Location" body={settings.data?.location} />
        </div>

        <div className="mt-6 glass p-8">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">Skills</p>
          <h2 className="text-2xl font-bold">Tools & Expertise</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {(skills.data ?? []).map((s) => (
              <span key={s.id} className="glass px-4 py-2 text-sm font-medium">{s.name}</span>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function InfoCard({ icon: Icon, title, body }: { icon: typeof GraduationCap; title: string; body?: string | null }) {
  return (
    <div className="glass p-6">
      <div className="rounded-xl bg-primary/15 text-primary p-2.5 w-fit"><Icon className="h-5 w-5" /></div>
      <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">{title}</p>
      <p className="mt-1 font-semibold leading-snug">{body || "—"}</p>
    </div>
  );
}
