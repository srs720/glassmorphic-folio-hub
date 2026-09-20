import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SignedImage } from "@/components/SignedImage";

export const Route = createFileRoute("/cv/viewer")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Private CV | Shoibur Rahman" },
      { name: "description", content: "Private, approved-access view of the CV of Shoibur Rahman." },
      { property: "og:title", content: "Private CV | Shoibur Rahman" },
      { property: "og:description", content: "Private, approved-access view of the CV of Shoibur Rahman." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
  }),
  component: CvViewer,
});

type CvData = {
  viewerEmail: string;
  viewerName: string;
  cv: {
    professional_summary: string;
    skills: unknown;
    languages: unknown;
    contact_phone: string;
    contact_address: string;
  } | null;
  profile: {
    name: string;
    tagline: string;
    bio: string;
    contact_email: string | null;
    phone: string | null;
    location: string | null;
    linkedin_url: string | null;
    github_url: string | null;
    avatar_path: string | null;
  } | null;
  education: Array<{
    id: string;
    kind: string;
    title: string;
    institution: string | null;
    period: string | null;
    description: string | null;
  }>;
};

function toList(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

function CvViewer() {
  const navigate = useNavigate();
  const [data, setData] = useState<CvData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/public/cv-access", { method: "POST" });
        const json = await res.json();
        if (!active) return;
        if (!res.ok || !json?.ok) {
          navigate({ to: "/cv/request", replace: true });
          return;
        }
        setData(json as CvData);
      } catch {
        if (active) navigate({ to: "/cv/request", replace: true });
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [navigate]);

  if (loading || !data) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-200">
        <p className="font-mono text-xs uppercase tracking-widest text-slate-600">Checking access…</p>
      </div>
    );
  }

  const cv = data.cv;
  const profile = data.profile;
  const skills = toList(cv?.skills);
  const languages = toList(cv?.languages);
  const education = data.education.filter((e) => e.kind !== "experience");
  const experience = data.education.filter((e) => e.kind === "experience");

  return (
    <div
      className="min-h-screen bg-slate-200 py-8 px-3 flex justify-center"
      onContextMenu={(e) => e.preventDefault()}
    >
      <style>{`@media print { body { display: none !important; } }`}</style>

      <div className="relative">
        <article
          className="relative overflow-hidden select-none bg-white shadow-2xl w-full max-w-[210mm] md:w-[210mm] min-h-[297mm] p-[14mm] md:p-[18mm] text-[#0F172A]"
          onCopy={(e) => e.preventDefault()}
          onCut={(e) => e.preventDefault()}
        >
          {/* Watermark */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-50 opacity-10 overflow-hidden"
          >
            <div className="absolute inset-[-40%] rotate-[-30deg] grid grid-cols-3 gap-y-16">
              {Array.from({ length: 60 }).map((_, i) => (
                <span key={i} className="font-mono text-[11px] whitespace-nowrap text-[#14304D] text-center">
                  {data.viewerEmail}
                </span>
              ))}
            </div>
          </div>

          <header className="relative flex items-start gap-6 border-b border-slate-200 pb-6">
            {profile?.avatar_path && (
              <div className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl ring-1 ring-slate-200">
                <SignedImage
                  path={profile.avatar_path}
                  alt={`${profile?.name ?? "Shoibur Rahman"} - portrait`}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div className="min-w-0">
              <h1 className="font-display text-4xl tracking-tight text-[#14304D]">
                {profile?.name ?? "Shoibur Rahman"}
              </h1>
              {profile?.tagline && <p className="mt-1 text-sm text-slate-600">{profile.tagline}</p>}
              <ul className="mt-3 grid gap-1 text-[13px] text-slate-700">
                {profile?.contact_email && <li>{profile.contact_email}</li>}
                {(cv?.contact_phone || profile?.phone) && <li>{cv?.contact_phone || profile?.phone}</li>}
                {(cv?.contact_address || profile?.location) && <li>{cv?.contact_address || profile?.location}</li>}
                {profile?.linkedin_url && <li>{profile.linkedin_url}</li>}
                {profile?.github_url && <li>{profile.github_url}</li>}
              </ul>
            </div>
          </header>

          {cv?.professional_summary && (
            <Section title="Professional Summary">
              <p className="text-[13.5px] leading-relaxed text-slate-700 whitespace-pre-line">
                {cv.professional_summary}
              </p>
            </Section>
          )}

          {education.length > 0 && (
            <Section title="Education">
              <div className="grid gap-4">
                {education.map((e) => (
                  <Entry key={e.id} {...e} />
                ))}
              </div>
            </Section>
          )}

          {experience.length > 0 && (
            <Section title="Experience">
              <div className="grid gap-4">
                {experience.map((e) => (
                  <Entry key={e.id} {...e} />
                ))}
              </div>
            </Section>
          )}

          {skills.length > 0 && (
            <Section title="Skills">
              <ul className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <li key={s} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[12px] text-slate-700">
                    {s}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {languages.length > 0 && (
            <Section title="Languages">
              <p className="text-[13.5px] text-slate-700">{languages.join(" · ")}</p>
            </Section>
          )}

          <footer className="relative mt-10 border-t border-slate-200 pt-4 text-[11px] font-mono text-slate-400">
            Shared privately with {data.viewerEmail}. Please do not redistribute.
          </footer>
        </article>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="relative mt-7">
      <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#14304D]">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Entry({ title, institution, period, description }: {
  title: string; institution: string | null; period: string | null; description: string | null;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-semibold text-[14px]">{title}</p>
        {period && <p className="font-mono text-[11px] text-slate-500">{period}</p>}
      </div>
      {institution && <p className="text-[13px] text-slate-600">{institution}</p>}
      {description && <p className="mt-1 text-[13px] leading-relaxed text-slate-700">{description}</p>}
    </div>
  );
}
