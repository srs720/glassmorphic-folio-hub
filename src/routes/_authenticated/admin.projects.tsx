import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, X, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile, deleteFile } from "@/lib/portfolio";
import { SignedImage } from "@/components/SignedImage";

export const Route = createFileRoute("/_authenticated/admin/projects")({
  component: ProjectsAdmin,
});

type Project = {
  id: string;
  title: string;
  description: string;
  image_path: string | null;
  live_url: string | null;
  created_at: string;
};

function ProjectsAdmin() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Project | null>(null);
  const [showForm, setShowForm] = useState(false);

  const list = useQuery({
    queryKey: ["admin_projects"],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Project[];
    },
  });

  const del = useMutation({
    mutationFn: async (p: Project) => {
      await deleteFile(p.image_path);
      const { error } = await supabase.from("projects").delete().eq("id", p.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin_projects"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: () => toast.error("Delete failed"),
  });

  return (
    <div className="grid gap-4">
      <div className="glass-strong flex items-center justify-between p-6">
        <div>
          <h2 className="text-xl font-bold">Projects</h2>
          <p className="text-sm text-muted-foreground">Create, edit, and remove your work.</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> New
        </button>
      </div>

      {showForm && (
        <ProjectForm
          initial={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => {
            setShowForm(false); setEditing(null);
            qc.invalidateQueries({ queryKey: ["admin_projects"] });
            qc.invalidateQueries({ queryKey: ["projects"] });
          }}
        />
      )}

      {list.isLoading ? (
        <div className="glass p-6 text-muted-foreground">Loading…</div>
      ) : list.data?.length === 0 ? (
        <div className="glass p-6 text-muted-foreground">No projects yet.</div>
      ) : (
        <div className="grid gap-3">
          {list.data?.map((p) => (
            <div key={p.id} className="glass flex items-center gap-4 p-3">
              <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg">
                <SignedImage path={p.image_path} alt={p.title} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate">{p.title}</p>
                <p className="text-sm text-muted-foreground line-clamp-1">{p.description}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setEditing(p); setShowForm(true); }}
                  className="btn-ghost inline-flex items-center gap-1 text-sm"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  onClick={() => confirm("Delete this project?") && del.mutate(p)}
                  className="btn-ghost inline-flex items-center gap-1 text-sm text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectForm({
  initial, onClose, onSaved,
}: { initial: Project | null; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [liveUrl, setLiveUrl] = useState(initial?.live_url ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return toast.error("Title required");
    setSaving(true);
    try {
      let image_path = initial?.image_path ?? null;
      if (file) {
        if (initial?.image_path) await deleteFile(initial.image_path);
        image_path = await uploadFile(file, "projects");
      }
      const payload = {
        title: title.trim(),
        description: description.trim(),
        live_url: liveUrl.trim() || null,
        image_path,
      };
      if (initial) {
        const { error } = await supabase.from("projects").update(payload).eq("id", initial.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("projects").insert(payload);
        if (error) throw error;
      }
      toast.success("Saved");
      onSaved();
    } catch (err) {
      console.error(err);
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="glass-strong p-6 grid gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">{initial ? "Edit project" : "New project"}</h3>
        <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-white/60">
          <X className="h-4 w-4" />
        </button>
      </div>
      <input className="glass-input px-4 py-2.5 text-sm" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea className="glass-input px-4 py-2.5 text-sm min-h-24" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <input className="glass-input px-4 py-2.5 text-sm" placeholder="Live URL (https://…)" value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} />
      <label className="glass-input flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer">
        <Upload className="h-4 w-4 text-primary" />
        <span className="text-muted-foreground truncate">
          {file ? file.name : initial?.image_path ? "Replace image (optional)" : "Upload cover image"}
        </span>
        <input
          type="file" accept="image/*" className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </label>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving…" : "Save"}</button>
      </div>
    </form>
  );
}
