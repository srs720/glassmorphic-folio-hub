import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Save, Check, X } from "lucide-react";
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

function CvContentForm() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["cv_content"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cv_content").select("*").limit(1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState("");
  const [languages, setLanguages] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!q.data) return;
    setSummary(q.data.professional_summary ?? "");
    setSkills(toList(q.data.skills).join(", "));
    setLanguages(toList(q.data.languages).join(", "));
    setPhone(q.data.contact_phone ?? "");
    setAddress(q.data.contact_address ?? "");
  }, [q.data]);

  async function save(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      professional_summary: summary.trim().slice(0, 4000),
      skills: splitList(skills),
      languages: splitList(languages),
      contact_phone: phone.trim().slice(0, 60),
      contact_address: address.trim().slice(0, 300),
    };
    const { error } = q.data?.id
      ? await supabase.from("cv_content").update(payload).eq("id", q.data.id)
      : await supabase.from("cv_content").insert(payload);
    setSaving(false);
    if (error) { toast.error("Couldn't save the CV."); return; }
    toast.success("CV content saved");
    qc.invalidateQueries({ queryKey: ["cv_content"] });
  }

  return (
    <form onSubmit={save} className="bento p-5 md:p-7 grid gap-4 max-w-2xl">
      <div>
        <h2 className="font-display text-2xl">CV Manager</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Education is pulled automatically from the Education page. Fill in the rest here.
        </p>
      </div>
      <div>
        <label className="label-mono" htmlFor="summary">Professional summary</label>
        <textarea id="summary" className="field mt-2 min-h-32" value={summary}
          onChange={(e) => setSummary(e.target.value)} maxLength={4000} />
      </div>
      <div>
        <label className="label-mono" htmlFor="skills">Skills (comma separated)</label>
        <input id="skills" className="field mt-2" value={skills} onChange={(e) => setSkills(e.target.value)}
          placeholder="Research writing, Public speaking, Web development" />
      </div>
      <div>
        <label className="label-mono" htmlFor="languages">Languages (comma separated)</label>
        <input id="languages" className="field mt-2" value={languages} onChange={(e) => setLanguages(e.target.value)}
          placeholder="Bangla, English, Arabic" />
      </div>
      <div>
        <label className="label-mono" htmlFor="cv_phone">Phone</label>
        <input id="cv_phone" className="field mt-2" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={60} />
      </div>
      <div>
        <label className="label-mono" htmlFor="cv_address">Address</label>
        <input id="cv_address" className="field mt-2" value={address} onChange={(e) => setAddress(e.target.value)} maxLength={300} />
      </div>
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
