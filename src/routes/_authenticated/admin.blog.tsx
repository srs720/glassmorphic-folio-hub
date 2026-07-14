import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, X, Upload, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile, deleteFile } from "@/lib/portfolio";
import { SignedImage } from "@/components/SignedImage";

export const Route = createFileRoute("/_authenticated/admin/blog")({
  component: BlogAdmin,
});

type Post = {
  id: string; title: string; slug: string; excerpt: string; content: string;
  cover_path: string | null; status: string; seo_title: string; seo_description: string;
  published_at: string | null; created_at: string;
};

function BlogAdmin() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Post | null>(null);
  const [showForm, setShowForm] = useState(false);

  const list = useQuery({
    queryKey: ["admin_blog"],
    queryFn: async () => {
      const { data, error } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Post[];
    },
  });

  const del = useMutation({
    mutationFn: async (p: Post) => {
      await deleteFile(p.cover_path);
      const { error } = await supabase.from("blog_posts").delete().eq("id", p.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin_blog"] });
      qc.invalidateQueries({ queryKey: ["blog_posts_public"] });
    },
  });

  return (
    <div className="grid gap-4">
      <div className="glass-strong flex items-center justify-between p-6">
        <div>
          <h2 className="text-xl font-bold">Blog</h2>
          <p className="text-sm text-muted-foreground">Write, draft, and publish posts.</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary inline-flex items-center gap-2">
          <Plus className="h-4 w-4" /> New post
        </button>
      </div>

      {showForm && (
        <PostForm
          initial={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => {
            setShowForm(false); setEditing(null);
            qc.invalidateQueries({ queryKey: ["admin_blog"] });
            qc.invalidateQueries({ queryKey: ["blog_posts_public"] });
          }}
        />
      )}

      {list.isLoading ? (
        <div className="glass p-6 text-muted-foreground">Loading…</div>
      ) : list.data?.length === 0 ? (
        <div className="glass p-6 text-muted-foreground">No posts yet.</div>
      ) : (
        <div className="grid gap-3">
          {list.data?.map((p) => (
            <div key={p.id} className="glass flex items-center gap-4 p-3">
              <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-mint/30 to-emerald-soft/30">
                {p.cover_path
                  ? <SignedImage path={p.cover_path} alt={p.title} className="h-full w-full object-cover" />
                  : <div className="h-full w-full flex items-center justify-center text-muted-foreground"><FileText className="h-4 w-4" /></div>}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate">{p.title}
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded ${p.status === "published" ? "bg-primary/15 text-primary" : "bg-white/60 text-muted-foreground"}`}>
                    {p.status}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground truncate">/{p.slug}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditing(p); setShowForm(true); }} className="btn-ghost inline-flex items-center gap-1 text-sm">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button onClick={() => confirm("Delete this post?") && del.mutate(p)}
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

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 80);
}

function PostForm({ initial, onClose, onSaved }: { initial: Post | null; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [status, setStatus] = useState<string>(initial?.status ?? "draft");
  const [seoTitle, setSeoTitle] = useState(initial?.seo_title ?? "");
  const [seoDesc, setSeoDesc] = useState(initial?.seo_description ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return toast.error("Title required");
    setSaving(true);
    try {
      let cover_path = initial?.cover_path ?? null;
      if (file) {
        if (initial?.cover_path) await deleteFile(initial.cover_path);
        cover_path = await uploadFile(file, "blog");
      }
      const finalSlug = (slug || slugify(title)).trim();
      const payload = {
        title: title.trim(), slug: finalSlug, excerpt: excerpt.trim(),
        content: content.trim(), status,
        seo_title: seoTitle.trim(), seo_description: seoDesc.trim(),
        cover_path,
        published_at: status === "published" ? (initial?.published_at ?? new Date().toISOString()) : null,
      };
      if (initial) {
        const { error } = await supabase.from("blog_posts").update(payload).eq("id", initial.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("blog_posts").insert(payload);
        if (error) throw error;
      }
      toast.success("Saved");
      onSaved();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Save failed");
    } finally { setSaving(false); }
  }

  return (
    <form onSubmit={onSubmit} className="glass-strong p-6 grid gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">{initial ? "Edit post" : "New post"}</h3>
        <button type="button" onClick={onClose}><X className="h-4 w-4" /></button>
      </div>
      <input className="glass-input px-4 py-2.5 text-sm" placeholder="Title"
        value={title} onChange={(e) => { setTitle(e.target.value); if (!initial && !slug) setSlug(slugify(e.target.value)); }} />
      <input className="glass-input px-4 py-2.5 text-sm" placeholder="url-slug" value={slug} onChange={(e) => setSlug(slugify(e.target.value))} />
      <textarea className="glass-input px-4 py-2.5 text-sm min-h-16" placeholder="Excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
      <textarea className="glass-input px-4 py-2.5 text-sm min-h-60 font-mono" placeholder="Content (markdown / plain text)" value={content} onChange={(e) => setContent(e.target.value)} />
      <label className="glass-input flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer">
        <Upload className="h-4 w-4 text-primary" />
        <span className="text-muted-foreground truncate">
          {file ? file.name : initial?.cover_path ? "Replace cover" : "Upload cover image"}
        </span>
        <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </label>
      <div className="grid gap-3 md:grid-cols-2">
        <select className="glass-input px-4 py-2.5 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mt-2">SEO</p>
      <input className="glass-input px-4 py-2.5 text-sm" placeholder="SEO title" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
      <textarea className="glass-input px-4 py-2.5 text-sm min-h-16" placeholder="SEO description" value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} />
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving…" : "Save"}</button>
      </div>
    </form>
  );
}
