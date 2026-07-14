import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Upload, Save, Plus, Trash2, Pencil, X, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile, deleteFile, getSignedUrl } from "@/lib/portfolio";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: SettingsAdmin,
});

const ICON_OPTIONS = [
  "github", "linkedin", "twitter", "instagram", "youtube", "globe", "mail", "link",
];

function SettingsAdmin() {
  return (
    <div className="grid gap-6">
      <SettingsForm />
      <SocialsManager />
    </div>
  );
}

function SettingsForm() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["site_settings_admin"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();
      return data;
    },
  });

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (q.data) {
      setName(q.data.name);
      setBio(q.data.bio);
      getSignedUrl(q.data.resume_path).then(setResumeUrl);
    }
  }, [q.data]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!q.data) return;
    setSaving(true);
    try {
      let resume_path = q.data.resume_path;
      if (file) {
        if (q.data.resume_path) await deleteFile(q.data.resume_path);
        resume_path = await uploadFile(file, "resume");
      }
      const { error } = await supabase.from("site_settings")
        .update({ name: name.trim(), bio: bio.trim(), resume_path })
        .eq("id", q.data.id);
      if (error) throw error;
      toast.success("Settings saved");
      qc.invalidateQueries({ queryKey: ["site_settings_admin"] });
      qc.invalidateQueries({ queryKey: ["site_settings"] });
      setFile(null);
    } catch (err) {
      console.error(err);
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="glass-strong p-6 grid gap-3">
      <div>
        <h2 className="text-xl font-bold">Site settings</h2>
        <p className="text-sm text-muted-foreground">Your name, bio, and resume.</p>
      </div>
      <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Name</label>
      <input className="glass-input px-4 py-2.5 text-sm" value={name} onChange={(e) => setName(e.target.value)} />
      <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Bio</label>
      <textarea className="glass-input px-4 py-2.5 text-sm min-h-32" value={bio} onChange={(e) => setBio(e.target.value)} />
      <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Resume / CV</label>
      <label className="glass-input flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer">
        <Upload className="h-4 w-4 text-primary" />
        <span className="text-muted-foreground truncate">
          {file ? file.name : q.data?.resume_path ? "Replace resume" : "Upload resume (PDF)"}
        </span>
        <input type="file" accept=".pdf,application/pdf" className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </label>
      {resumeUrl && (
        <a href={resumeUrl} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <FileText className="h-3.5 w-3.5" /> View current resume
        </a>
      )}
      <button type="submit" disabled={saving} className="btn-primary self-start mt-2 inline-flex items-center gap-2">
        <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}

type Social = { id: string; platform_name: string; url: string; icon_name: string; sort_order: number };

function SocialsManager() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Social | null>(null);
  const [showForm, setShowForm] = useState(false);

  const list = useQuery({
    queryKey: ["admin_socials"],
    queryFn: async () => {
      const { data, error } = await supabase.from("social_links").select("*").order("sort_order");
      if (error) throw error;
      return (data ?? []) as Social[];
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("social_links").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Removed");
      qc.invalidateQueries({ queryKey: ["admin_socials"] });
      qc.invalidateQueries({ queryKey: ["social_links"] });
    },
  });

  return (
    <div className="glass-strong p-6 grid gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Social links</h2>
          <p className="text-sm text-muted-foreground">Displayed on your homepage.</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary inline-flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      {showForm && (
        <SocialForm
          initial={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => {
            setShowForm(false); setEditing(null);
            qc.invalidateQueries({ queryKey: ["admin_socials"] });
            qc.invalidateQueries({ queryKey: ["social_links"] });
          }}
        />
      )}

      <div className="grid gap-2">
        {list.data?.length === 0 && (
          <p className="text-sm text-muted-foreground">No links yet.</p>
        )}
        {list.data?.map((s) => (
          <div key={s.id} className="glass flex items-center gap-3 p-3">
            <span className="text-xs uppercase tracking-wide bg-primary/15 text-primary rounded-md px-2 py-1">
              {s.icon_name}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{s.platform_name}</p>
              <p className="text-xs text-muted-foreground truncate">{s.url}</p>
            </div>
            <button onClick={() => { setEditing(s); setShowForm(true); }} className="btn-ghost inline-flex items-center gap-1 text-sm">
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => confirm("Remove this link?") && del.mutate(s.id)}
              className="btn-ghost inline-flex items-center gap-1 text-sm text-destructive">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SocialForm({
  initial, onClose, onSaved,
}: { initial: Social | null; onClose: () => void; onSaved: () => void }) {
  const [platform_name, setPlatform] = useState(initial?.platform_name ?? "");
  const [url, setUrl] = useState(initial?.url ?? "");
  const [icon_name, setIcon] = useState(initial?.icon_name ?? "link");
  const [sort_order, setSort] = useState(initial?.sort_order ?? 0);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!platform_name.trim() || !url.trim()) return toast.error("Fields required");
    setSaving(true);
    const payload = { platform_name: platform_name.trim(), url: url.trim(), icon_name, sort_order };
    const { error } = initial
      ? await supabase.from("social_links").update(payload).eq("id", initial.id)
      : await supabase.from("social_links").insert(payload);
    setSaving(false);
    if (error) return toast.error("Save failed");
    toast.success("Saved");
    onSaved();
  }

  return (
    <form onSubmit={onSubmit} className="glass p-4 grid gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">{initial ? "Edit link" : "New link"}</h3>
        <button type="button" onClick={onClose}><X className="h-4 w-4" /></button>
      </div>
      <input className="glass-input px-4 py-2.5 text-sm" placeholder="Platform name (e.g. GitHub)" value={platform_name} onChange={(e) => setPlatform(e.target.value)} />
      <input className="glass-input px-4 py-2.5 text-sm" placeholder="https://…" value={url} onChange={(e) => setUrl(e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <select className="glass-input px-4 py-2.5 text-sm" value={icon_name} onChange={(e) => setIcon(e.target.value)}>
          {ICON_OPTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
        <input type="number" className="glass-input px-4 py-2.5 text-sm" placeholder="Sort order" value={sort_order} onChange={(e) => setSort(Number(e.target.value))} />
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary">{saving ? "…" : "Save"}</button>
      </div>
    </form>
  );
}
