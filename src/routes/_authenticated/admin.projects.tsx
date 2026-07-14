import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, X, Upload, GripVertical, ArrowUp, ArrowDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile, deleteFile } from "@/lib/portfolio";
import { SignedImage } from "@/components/SignedImage";

export const Route = createFileRoute("/_authenticated/admin/projects")({
  component: ProjectsAdmin,
});

type Project = {
  id: string; title: string; description: string;
  image_path: string | null; live_url: string | null; created_at: string;
  tags: string[]; images: string[]; detail_content: string;
  sort_order: number; featured: boolean;
};

function ProjectsAdmin() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Project | null>(null);
  const [showForm, setShowForm] = useState(false);

  const list = useQuery({
    queryKey: ["admin_projects"],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*")
        .order("sort_order").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Project[];
    },
  });

  const del = useMutation({
    mutationFn: async (p: Project) => {
      await deleteFile(p.image_path);
      for (const path of p.images ?? []) await deleteFile(path);
      const { error } = await supabase.from("projects").delete().eq("id", p.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin_projects"] });
      qc.invalidateQueries({ queryKey: ["projects_all"] });
      qc.invalidateQueries({ queryKey: ["projects_featured"] });
    },
  });

  const reorder = useMutation({
    mutationFn: async ({ id, direction }: { id: string; direction: -1 | 1 }) => {
      const items = list.data ?? [];
      const idx = items.findIndex((i) => i.id === id);
      const swap = idx + direction;
      if (idx < 0 || swap < 0 || swap >= items.length) return;
      const a = items[idx], b = items[swap];
      await supabase.from("projects").update({ sort_order: b.sort_order }).eq("id", a.id);
      await supabase.from("projects").update({ sort_order: a.sort_order }).eq("id", b.id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin_projects"] }),
  });

  return (
    <div className="grid gap-4">
      <div className="glass-strong flex items-center justify-between p-6">
        <div>
          <h2 className="text-xl font-bold">Projects</h2>
          <p className="text-sm text-muted-foreground">Create, edit, reorder, and remove your work.</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary inline-flex items-center gap-2">
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
            qc.invalidateQueries({ queryKey: ["projects_all"] });
            qc.invalidateQueries({ queryKey: ["projects_featured"] });
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
              <div className="flex flex-col gap-0.5 text-muted-foreground">
                <button className="hover:text-primary" onClick={() => reorder.mutate({ id: p.id, direction: -1 })}><ArrowUp className="h-3.5 w-3.5" /></button>
                <GripVertical className="h-3.5 w-3.5 opacity-50" />
                <button className="hover:text-primary" onClick={() => reorder.mutate({ id: p.id, direction: 1 })}><ArrowDown className="h-3.5 w-3.5" /></button>
              </div>
              <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg">
                <SignedImage path={p.image_path} alt={p.title} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate">{p.title} {p.featured && <span className="ml-2 text-xs bg-primary/15 text-primary px-2 py-0.5 rounded">Featured</span>}</p>
                <p className="text-sm text-muted-foreground line-clamp-1">{p.description}</p>
                {p.tags?.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {p.tags.map((t) => <span key={t} className="text-xs bg-white/60 rounded px-1.5 py-0.5">{t}</span>)}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditing(p); setShowForm(true); }} className="btn-ghost inline-flex items-center gap-1 text-sm">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button onClick={() => confirm("Delete this project?") && del.mutate(p)}
                  className="btn-ghost inline-flex items-center gap-1 text-sm text-destructive">
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

function ProjectForm({ initial, onClose, onSaved }: { initial: Project | null; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [detail, setDetail] = useState(initial?.detail_content ?? "");
  const [liveUrl, setLiveUrl] = useState(initial?.live_url ?? "");
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
  const [featured, setFeatured] = useState(initial?.featured ?? true);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<FileList | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return toast.error("Title required");
    setSaving(true);
    try {
      let image_path = initial?.image_path ?? null;
      if (coverFile) {
        if (initial?.image_path) await deleteFile(initial.image_path);
        image_path = await uploadFile(coverFile, "projects");
      }
      let images = initial?.images ?? [];
      if (galleryFiles) {
        const uploaded: string[] = [];
        for (const f of Array.from(galleryFiles)) uploaded.push(await uploadFile(f, "projects/gallery"));
        images = [...images, ...uploaded];
      }
      const payload = {
        title: title.trim(),
        description: description.trim(),
        detail_content: detail.trim(),
        live_url: liveUrl.trim() || null,
        image_path, images,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        featured,
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
    } finally { setSaving(false); }
  }

  async function removeGalleryImage(path: string) {
    if (!initial) return;
    await deleteFile(path);
    const next = (initial.images ?? []).filter((p) => p !== path);
    await supabase.from("projects").update({ images: next }).eq("id", initial.id);
    onSaved();
  }

  return (
    <form onSubmit={onSubmit} className="glass-strong p-6 grid gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">{initial ? "Edit project" : "New project"}</h3>
        <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-white/60"><X className="h-4 w-4" /></button>
      </div>
      <input className="glass-input px-4 py-2.5 text-sm" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea className="glass-input px-4 py-2.5 text-sm min-h-20" placeholder="Short description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <textarea className="glass-input px-4 py-2.5 text-sm min-h-32" placeholder="Detail content (shown on project page)" value={detail} onChange={(e) => setDetail(e.target.value)} />
      <input className="glass-input px-4 py-2.5 text-sm" placeholder="Live URL (https://…)" value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} />
      <input className="glass-input px-4 py-2.5 text-sm" placeholder="Tags (comma separated)" value={tags} onChange={(e) => setTags(e.target.value)} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} /> Featured on home
      </label>
      <label className="glass-input flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer">
        <Upload className="h-4 w-4 text-primary" />
        <span className="text-muted-foreground truncate">
          {coverFile ? coverFile.name : initial?.image_path ? "Replace cover image" : "Upload cover image"}
        </span>
        <input type="file" accept="image/*" className="hidden" onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)} />
      </label>
      <label className="glass-input flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer">
        <Upload className="h-4 w-4 text-primary" />
        <span className="text-muted-foreground truncate">
          {galleryFiles ? `${galleryFiles.length} file(s) selected` : "Upload gallery images (multi-select)"}
        </span>
        <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => setGalleryFiles(e.target.files)} />
      </label>
      {initial && (initial.images ?? []).length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {initial.images.map((path) => (
            <div key={path} className="relative aspect-video overflow-hidden rounded-lg glass">
              <SignedImage path={path} alt="gallery" className="h-full w-full object-cover" />
              <button type="button" onClick={() => removeGalleryImage(path)}
                className="absolute top-1 right-1 rounded-md bg-white/80 p-1 hover:bg-white text-destructive">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving…" : "Save"}</button>
      </div>
    </form>
  );
}
