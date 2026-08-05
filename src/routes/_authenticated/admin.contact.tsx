import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/contact")({
  component: ContactAdmin,
});

const FIELDS = [
  { key: "phone", label: "Phone number", placeholder: "+8801XXXXXXXXX", type: "tel" },
  { key: "contact_email", label: "Public email", placeholder: "hello@shoiburrahman.com", type: "email" },
  { key: "facebook_url", label: "Facebook URL", placeholder: "https://facebook.com/...", type: "url" },
  { key: "youtube_url", label: "YouTube URL", placeholder: "https://youtube.com/@...", type: "url" },
  { key: "linkedin_url", label: "LinkedIn URL", placeholder: "https://linkedin.com/in/...", type: "url" },
  { key: "github_url", label: "GitHub URL", placeholder: "https://github.com/...", type: "url" },
] as const;

function ContactAdmin() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["site_settings_contact"],
    queryFn: async () => (await supabase.from("site_settings").select("*").limit(1).maybeSingle()).data as any,
  });

  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!q.data) return;
    const next: Record<string, string> = {};
    for (const f of FIELDS) next[f.key] = q.data[f.key] ?? "";
    setValues(next);
  }, [q.data]);

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!q.data?.id) { toast.error("Site settings row not found."); return; }
    for (const f of FIELDS) {
      const v = (values[f.key] ?? "").trim();
      if (f.type === "url" && v && !/^https?:\/\//i.test(v)) {
        toast.error(`${f.label} must start with http:// or https://`);
        return;
      }
      if (v.length > 300) { toast.error(`${f.label} is too long.`); return; }
    }
    setSaving(true);
    const payload: Record<string, string | null> = {};
    for (const f of FIELDS) payload[f.key] = (values[f.key] ?? "").trim() || null;
    const { error } = await supabase.from("site_settings").update(payload as any).eq("id", q.data.id);
    setSaving(false);
    if (error) { toast.error("Couldn't save contact details."); return; }
    toast.success("Contact & socials saved");
    qc.invalidateQueries({ queryKey: ["site_settings_contact"] });
    qc.invalidateQueries({ queryKey: ["site_settings"] });
  }

  return (
    <form onSubmit={save} className="bento p-5 md:p-7 grid gap-4 max-w-2xl">
      <div>
        <h2 className="font-display text-2xl">Contact &amp; Socials</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Anything you fill in here appears in the “Find me at” section and the footer. Leave a field empty to hide it.
        </p>
      </div>
      {FIELDS.map((f) => (
        <div key={f.key}>
          <label className="label-mono" htmlFor={f.key}>{f.label}</label>
          <input
            id={f.key}
            type={f.type}
            maxLength={300}
            className="field mt-2"
            placeholder={f.placeholder}
            value={values[f.key] ?? ""}
            onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
          />
        </div>
      ))}
      <div>
        <button disabled={saving} className="btn-primary">
          {saving ? "Saving..." : (<>Save <Save className="h-4 w-4" /></>)}
        </button>
      </div>
    </form>
  );
}
