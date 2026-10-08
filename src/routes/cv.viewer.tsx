import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { readCvAccessEmail } from "@/lib/cv-access";

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

type Obj = Record<string, any>;
type CvData = {
  viewerEmail: string;
  cv: Obj | null;
  profile: Obj | null;
  education: Array<{ id: string; kind: string; title: string; institution: string | null; period: string | null; description: string | null }>;
};

const list = (v: unknown): string[] => (Array.isArray(v) ? v.map(String).map((s) => s.trim()).filter(Boolean) : []);
const rows = (v: unknown): Obj[] => (Array.isArray(v) ? v.filter((x) => x && typeof x === "object") : []);
const lines = (v: unknown): string[] =>
  Array.isArray(v) ? list(v) : String(v ?? "").split("\n").map((s) => s.replace(/^[-•*]\s*/, "").trim()).filter(Boolean);

function prettyUrl(url: string) {
  return url.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/+$/, "");
}
function href(url: string) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function CvViewer() {
  const navigate = useNavigate();
  const [data, setData] = useState<CvData | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const email = readCvAccessEmail();
        if (!email) { navigate({ to: "/cv", replace: true }); return; }
        const { data: result, error } = await (supabase as any).rpc("get_cv_for_email", { _email: email });
        if (!active) return;
        if (error || !result?.ok) { navigate({ to: "/cv", replace: true }); return; }
        setData(result as CvData);
      } catch {
        if (active) navigate({ to: "/cv", replace: true });
      }
    })();
    return () => { active = false; };
  }, [navigate]);

  if (!data) {
    return (
      <div className="min-h-screen grid place-items-center bg-muted">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Checking access…</p>
      </div>
    );
  }

  const cv = data.cv ?? {};
  const p = data.profile ?? {};
  const email = cv.contact_email || p.contact_email;
  const phone = cv.contact_phone || p.phone;
  const location = cv.contact_address || p.location;
  const linkedin = cv.linkedin_url || p.linkedin_url;
  const github = cv.github_url || p.github_url;
  const groups = rows(cv.skill_groups).filter((g) => g.group || g.items);
  const flatSkills = list(cv.skills);
  const languages = list(cv.languages);
  const experience = rows(cv.experience);
  const projects = rows(cv.projects);
  const awards = rows(cv.achievements_awards);
  const education = data.education.filter((e) => e.kind !== "experience");
  const legacyExp = data.education.filter((e) => e.kind === "experience");

  const contacts: React.ReactNode[] = [];
  if (phone) contacts.push(phone);
  if (email) contacts.push(<a href={`mailto:${email}`}>{email}</a>);
  if (location) contacts.push(location);
  if (linkedin) contacts.push(<a href={href(linkedin)} target="_blank" rel="noreferrer" className="underline">{prettyUrl(linkedin)}</a>);
  if (github) contacts.push(<a href={href(github)} target="_blank" rel="noreferrer" className="underline">{prettyUrl(github)}</a>);

  return (
    <div className="min-h-screen bg-muted py-8 px-3 flex justify-center overflow-x-auto" onContextMenu={(e) => e.preventDefault()}>
      <style>{`@media print { body { display: none !important; } }`}</style>
      <article
        className="relative overflow-hidden select-none bg-white shadow-2xl w-full max-w-[210mm] md:w-[210mm] min-h-[297mm] px-[12mm] py-[14mm] md:px-[18mm] md:py-[16mm] text-neutral-900"
        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        onCopy={(e) => e.preventDefault()}
        onCut={(e) => e.preventDefault()}
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 z-50 opacity-10 overflow-hidden">
          <div className="absolute inset-[-40%] rotate-[-30deg] grid grid-cols-3 gap-y-16">
            {Array.from({ length: 60 }).map((_, i) => (
              <span key={i} className="font-mono text-[11px] whitespace-nowrap text-neutral-900 text-center">{data.viewerEmail}</span>
            ))}
          </div>
        </div>

        <header className="text-center">
          <h1 className="text-[28px] font-bold tracking-wide uppercase">{p.name ?? "Shoibur Rahman"}</h1>
          {contacts.length > 0 && (
            <p className="mt-2 text-[12px] text-neutral-700 flex flex-wrap justify-center gap-x-2">
              {contacts.map((c, i) => (
                <span key={i}>{i > 0 && <span className="mr-2">|</span>}{c}</span>
              ))}
            </p>
          )}
        </header>

        {cv.professional_summary && (
          <Section title="Professional Summary">
            <p className="text-[12.5px] leading-relaxed text-justify whitespace-pre-line">{cv.professional_summary}</p>
          </Section>
        )}

        {(groups.length > 0 || flatSkills.length > 0 || languages.length > 0) && (
          <Section title="Skills">
            <div className="grid gap-1 text-[12.5px]">
              {groups.map((g, i) => (
                <p key={i}><span className="font-bold">{g.group}{g.group && ":"}</span> {list(Array.isArray(g.items) ? g.items : String(g.items ?? "").split(",")).join(", ")}</p>
              ))}
              {flatSkills.length > 0 && <p>{groups.length > 0 && <span className="font-bold">Other: </span>}{flatSkills.join(", ")}</p>}
              {languages.length > 0 && <p><span className="font-bold">Languages:</span> {languages.join(", ")}</p>}
            </div>
          </Section>
        )}

        {(experience.length > 0 || legacyExp.length > 0) && (
          <Section title="Experience">
            <div className="grid gap-3">
              {experience.map((x, i) => (
                <Item key={i} left={x.role} right={x.date} sub={x.organization} points={lines(x.points)} />
              ))}
              {legacyExp.map((x) => (
                <Item key={x.id} left={x.title} right={x.period} sub={x.institution} points={lines(x.description)} />
              ))}
            </div>
          </Section>
        )}

        {projects.length > 0 && (
          <Section title="Projects">
            <div className="grid gap-3">
              {projects.map((x, i) => (
                <div key={i}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2 text-[12.5px]">
                    <p>
                      <span className="font-bold">{x.title}</span>
                      {x.tech && <span className="italic text-neutral-700"> | {x.tech}</span>}
                    </p>
                    {x.link && <a href={href(x.link)} target="_blank" rel="noreferrer" className="text-[11.5px] underline">{prettyUrl(x.link)}</a>}
                  </div>
                  <Bullets points={lines(x.description)} />
                </div>
              ))}
            </div>
          </Section>
        )}

        {education.length > 0 && (
          <Section title="Education">
            <div className="grid gap-2">
              {education.map((e) => (
                <Item key={e.id} left={e.title} right={e.period} sub={e.institution} points={[]} />
              ))}
            </div>
          </Section>
        )}

        {awards.length > 0 && (
          <Section title="Awards & Achievements">
            <ul className="grid gap-1 text-[12.5px] list-disc pl-5">
              {awards.map((a, i) => (
                <li key={i}>
                  <span className="font-bold">{a.title}</span>
                  {a.date && <span className="text-neutral-700"> ({a.date})</span>}
                  {a.description && <span> — {a.description}</span>}
                </li>
              ))}
            </ul>
          </Section>
        )}
      </article>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] border-b border-neutral-800 pb-0.5">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function Bullets({ points }: { points: string[] }) {
  if (!points.length) return null;
  return (
    <ul className="mt-1 list-disc pl-5 text-[12.5px] leading-relaxed">
      {points.map((pt, i) => <li key={i}>{pt}</li>)}
    </ul>
  );
}

function Item({ left, right, sub, points }: { left?: string; right?: string | null; sub?: string | null; points: string[] }) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2 text-[12.5px]">
        <p><span className="font-bold">{left}</span>{sub && <span>, {sub}</span>}</p>
        {right && <p className="italic text-neutral-700">{right}</p>}
      </div>
      <Bullets points={points} />
    </div>
  );
}
