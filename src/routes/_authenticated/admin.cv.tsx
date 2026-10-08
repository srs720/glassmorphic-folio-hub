import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Save, Check, X, Plus, Trash2, ArrowUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/cv")({
  component: CvAdmin,
});

function CvAdmin() {
  const [tab, setTab] = useState<"content" | "requests">("content");
  return (
    <div className="grid gap-4">
      <div className="flex gap-2">
        {(["content", "requests"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={tab === t ? "btn-primary text-sm" : "btn-ghost text-sm"}
          >
            {t === "content" ? "CV Content" : "CV Requests"}
          </button>
        ))}
      </div>
      {tab === "content" ? <CvContentForm /> : <CvRequests />}
    </div>
  );
}

type Field = { key: string; label: string; multiline?: boolean; hint?: string };
type Row = Record<string, string>;

const SECTIONS: { key: "skill_groups" | "experience" | "projects" | "achievements_awards"; title: string; fields: Field[] }[] = [
  { key: "skill_groups", title: "Skill groups", fields: [
    { key: "group", label: "Group (e.g. Frontend)" },
    { key: "items", label: "Skills (comma separated)" },
  ] },
  { key: "experience", title: "Experience", fields: [
    { key: "role", label: "Role" },
    { key: "organization", label: "Organization" },
    { key: "date", label: "Date (e.g. 2024 - Present)" },
    { key: "points", label: "Description points (one per line)", multiline: true },
  ] },
  { key: "projects", title: "Projects", fields: [
    { key: "title", label: "Title" },
    { key: "tech", label: "Tech stack" },
    { key: "link", label: "Link (optional)" },
    { key: "description", label: "Description points (one per line)", multiline: true },
  ] },
  { key: "achievements_awards", title: "Achievements & Awards", fields: [
    { key: "title", label: "Title" },
    { key: "date", label: "Date" },
    { key: "description", label: "Description", multiline: true },
  ] },
];

function toRows(v: unknown): Row[] {
  return Array.isArray(v) ? v.filter((x) => x && typeof x === "object").map((x: any) => {
    const r: Row = {};
    for (const [k, val] of Object.entries(x)) r[k] = Array.isArray(val) ? val.join(k === "items" ? ", " : "\n") : String(val ?? "");
    return r;
  }) : [];
}

function cleanRows(rows: Row[]): Row[] {
  return rows
    .map((r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.trim().slice(0, 2000)])))
    .filter((r) => Object.values(r).some(Boolean))
    .slice(0, 40);
}

function CvContentForm() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["cv_content"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cv_content").select("*").limit(1).maybeSingle();
      if (error) throw error;
      return data as any;
    },
  });

  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState("");
  const [languages, setLanguages] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [lists, setLists] = useState<Record<string, Row[]>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!q.data) return;
    const d = q.data;
    setSummary(d.professional_summary ?? "");
    setSkills(toList(d.skills).join(", "));
    setLanguages(toList(d.languages).join(", "));
    setPhone(d.contact_phone ?? "");
    setAddress(d.contact_address ?? "");
    setEmail(d.contact_email ?? "");
    setLinkedin(d.linkedin_url ?? "");
    setGithub(d.github_url ?? "");
    setLists(Object.fromEntries(SECTIONS.map((s) => [s.key, toRows(d[s.key])])));
  }, [q.data]);

  async function save(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload: any = {
      professional_summary: summary.trim().slice(0, 4000),
      skills: splitList(skills),
      languages: splitList(languages),
      contact_phone: phone.trim().slice(0, 60),
      contact_address: address.trim().slice(0, 300),
      contact_email: email.trim().slice(0, 200),
      linkedin_url: linkedin.trim().slice(0, 300),
      github_url: github.trim().slice(0, 300),
    };
    for (const s of SECTIONS) payload[s.key] = cleanRows(lists[s.key] ?? []);
    const { error } = q.data?.id
      ? await supabase.from("cv_content").update(payload).eq("id", q.data.id)
      : await supabase.from("cv_content").insert(payload);
    setSaving(false);
    if (error) { toast.error("Couldn't save the CV."); return; }
    toast.success("CV content saved");
    qc.invalidateQueries({ queryKey: ["cv_content"] });
  }

  const input = (id: string, label: string, value: string, set: (v: string) => void, placeholder?: string) => (
    <div>
      <label className="label-mono" htmlFor={id}>{label}</label>
      <input id={id} className="field mt-2" value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder} />
    </div>
  );

  return (
    <form onSubmit={save} className="bento p-5 md:p-7 grid gap-5 max-w-3xl">
      <div>
        <h2 className="font-display text-2xl">CV Manager</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Education is pulled automatically from the Education page. Fill in the rest here.
        </p>
      </div>
      <div>
        <label className="label-mono" htmlFor="summary">Professional summary (2-3 lines)</label>
        <textarea id="summary" className="field mt-2 min-h-28" value={summary}
          onChange={(e) => setSummary(e.target.value)} maxLength={4000} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {input("cv_email", "Email", email, setEmail)}
        {input("cv_phone", "Phone", phone, setPhone)}
        {input("cv_address", "Location", address, setAddress)}
        {input("cv_languages", "Languages (comma separated)", languages, setLanguages, "Bangla, English")}
        {input("cv_linkedin", "LinkedIn URL", linkedin, setLinkedin, "https://linkedin.com/in/username")}
        {input("cv_github", "GitHub URL", github, setGithub, "https://github.com/username")}
      </div>
      {input("skills", "Other skills (comma separated, used if no groups)", skills, setSkills)}

      {SECTIONS.map((s) => {
        const rows = lists[s.key] ?? [];
        const setRows = (r: Row[]) => setLists((p) => ({ ...p, [s.key]: r }));
        return (
          <div key={s.key} className="grid gap-3 border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg">{s.title}</h3>
              <button type="button" className="btn-ghost text-sm" onClick={() => setRows([...rows, {}])}>
                <Plus className="h-4 w-4" /> Add
              </button>
            </div>
            {rows.length === 0 && <p className="text-sm text-muted-foreground">No entries yet.</p>}
            {rows.map((row, i) => (
              <div key={i} className="rounded-2xl border border-border p-4 grid gap-3 sm:grid-cols-2">
                {s.fields.map((f) => (
                  <div key={f.key} className={f.multiline ? "sm:col-span-2" : ""}>
                    <label className="label-mono">{f.label}</label>
                    {f.multiline ? (
                      <textarea className="field mt-2 min-h-24" value={row[f.key] ?? ""}
                        onChange={(e) => setRows(rows.map((r, j) => j === i ? { ...r, [f.key]: e.target.value } : r))} />
                    ) : (
                      <input className="field mt-2" value={row[f.key] ?? ""}
                        onChange={(e) => setRows(rows.map((r, j) => j === i ? { ...r, [f.key]: e.target.value } : r))} />
                    )}
                  </div>
                ))}
                <div className="sm:col-span-2 flex gap-2 justify-end">
                  <button type="button" disabled={i === 0} className="btn-ghost text-sm"
                    onClick={() => { const r = [...rows]; [r[i - 1], r[i]] = [r[i], r[i - 1]]; setRows(r); }}>
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button type="button" className="btn-ghost text-sm text-destructive"
                    onClick={() => setRows(rows.filter((_, j) => j !== i))}>
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      })}

      <div>
        <button disabled={saving} className="btn-primary">
          {saving ? "Saving..." : (<>Save <Save className="h-4 w-4" /></>)}
        </button>
      </div>
    </form>
  );
}

const DURATIONS = [
  { label: "24 hours", hours: 24 },
  { label: "3 days", hours: 72 },
  { label: "1 week", hours: 168 },
  { label: "30 days", hours: 720 },
];

function CvRequests() {
  const qc = useQueryClient();
  const [openFor, setOpenFor] = useState<string | null>(null);
  const q = useQuery({
    queryKey: ["cv_requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cv_requests")
        .select("id, user_name, user_email, purpose, status, expires_at, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  async function approve(id: string, hours: number) {
    const expires = new Date(Date.now() + hours * 3600 * 1000).toISOString();
    const { error } = await supabase
      .from("cv_requests")
      .update({ status: "approved", expires_at: expires })
      .eq("id", id);
    if (error) { toast.error("Couldn't update the request."); return; }
    setOpenFor(null);
    toast.success("Approved");
    qc.invalidateQueries({ queryKey: ["cv_requests"] });
  }

  async function reject(id: string) {
    const { error } = await supabase
      .from("cv_requests")
      .update({ status: "rejected", expires_at: null })
      .eq("id", id);
    if (error) { toast.error("Couldn't update the request."); return; }
    toast.success("Rejected");
    qc.invalidateQueries({ queryKey: ["cv_requests"] });
  }

  return (
    <div className="bento p-5 md:p-7 grid gap-3">
      <div>
        <h2 className="font-display text-2xl">CV Requests</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Approve who is allowed to open your CV, and for how long.
        </p>
      </div>
      {q.isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
      {q.data?.length === 0 && <p className="text-sm text-muted-foreground">No requests yet.</p>}
      {q.data?.map((r) => (
        <div key={r.id} className="rounded-2xl border border-border p-4 grid gap-3">
          <div className="grid gap-2 sm:flex sm:items-center sm:gap-4">
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{r.user_name} <span className="text-muted-foreground">· {r.user_email}</span></p>
              <p className="text-sm text-muted-foreground">{r.purpose}</p>
              <p className="text-xs uppercase tracking-wide mt-1 text-primary">
                {labelFor(r.status)}
                {r.status === "approved" && r.expires_at
                  ? ` · ${new Date(r.expires_at).getTime() > Date.now() ? "until" : "expired"} ${new Date(r.expires_at).toLocaleString()}`
                  : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setOpenFor(openFor === r.id ? null : r.id)} className="btn-primary text-sm">
                <Check className="h-4 w-4" /> Approve
              </button>
              <button onClick={() => reject(r.id)} className="btn-ghost text-sm text-destructive">
                <X className="h-4 w-4" /> Reject
              </button>
            </div>
          </div>
          {openFor === r.id && (
            <div className="rounded-xl bg-surface-2 p-3 grid gap-2">
              <p className="label-mono">Access valid for</p>
              <div className="flex flex-wrap gap-2">
                {DURATIONS.map((d) => (
                  <button key={d.hours} onClick={() => approve(r.id, d.hours)} className="btn-ghost text-sm">
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function labelFor(status: string) {
  if (status === "pending" || status === "unverified") return "Waiting for approval";
  if (status === "approved") return "Approved";
  return "Rejected";
}

function toList(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

function splitList(value: string): string[] {
  return value.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 60);
}
