import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, X, Upload, FileText, Sparkles, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile, deleteFile } from "@/lib/portfolio";
import { SignedImage } from "@/components/SignedImage";
import { RichTextEditor } from "@/components/RichTextEditor";
import { generateSeoMeta } from "@/lib/ai.functions";
import { parseTags, readingMinutes } from "@/lib/post-utils";

export const Route = createFileRoute("/_authenticated/admin/posts")({
  component: PostsAdmin,
});

type Post = {
  id: string; title: string; title_bn: string | null; slug: string;
  excerpt: string; excerpt_bn: string | null;
  content: string; content_bn: string | null;
  cover_path: string | null; status: string;
  tags: string[] | null;
  seo_title: string; seo_title_bn: string | null;
  seo_description: string; seo_description_bn: string | null;
  published_at: string | null; created_at: string;
};


function PostsAdmin() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Post | null>(null);
  const [showForm, setShowForm] = useState(false);

  const list = useQuery({
    queryKey: ["admin_posts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Post[];
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
      qc.invalidateQueries({ queryKey: ["admin_posts"] });
      qc.invalidateQueries({ queryKey: ["posts_feed"] });
    },
    onError: () => toast.error("Delete failed"),
  });

  return (
    <div className="grid gap-4">
      <div className="glass-strong flex flex-wrap items-center justify-between gap-3 p-5 sm:p-6">
        <div className="min-w-0">
          <h2 className="text-xl font-bold">Research &amp; Posts</h2>
          <p className="text-sm text-muted-foreground">Write in English and Bengali, then publish.</p>
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
            qc.invalidateQueries({ queryKey: ["admin_posts"] });
            qc.invalidateQueries({ queryKey: ["posts_feed"] });
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
            <div key={p.id} className="glass flex flex-wrap items-center gap-3 p-3">
              <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                {p.cover_path
                  ? <SignedImage path={p.cover_path} alt={p.title} className="h-full w-full object-cover" />
                  : <div className="h-full w-full flex items-center justify-center text-muted-foreground"><FileText className="h-4 w-4" /></div>}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate">
                  {p.title}
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded ${p.status === "published" ? "bg-primary/15 text-primary" : "bg-white/60 text-muted-foreground"}`}>
                    {p.status}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground truncate">/post/{p.slug}</p>
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

/** ISO timestamp -> value for <input type="datetime-local"> in the admin's timezone. */
function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 80);
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function PostForm({ initial, onClose, onSaved }: { initial: Post | null; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [titleBn, setTitleBn] = useState(initial?.title_bn ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [excerptBn, setExcerptBn] = useState(initial?.excerpt_bn ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [contentBn, setContentBn] = useState(initial?.content_bn ?? "");
  const [status, setStatus] = useState<string>(initial?.status ?? "draft");
  const [seoTitle, setSeoTitle] = useState(initial?.seo_title ?? "");
  const [seoTitleBn, setSeoTitleBn] = useState(initial?.seo_title_bn ?? "");
  const [seoDesc, setSeoDesc] = useState(initial?.seo_description ?? "");
  const [seoDescBn, setSeoDescBn] = useState(initial?.seo_description_bn ?? "");
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
  const [publishAt, setPublishAt] = useState(
    initial?.published_at ? toLocalInput(initial.published_at) : "",
  );
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [aiBusy, setAiBusy] = useState<"en" | "bn" | null>(null);
  const suggestMeta = useServerFn(generateSeoMeta);

  async function generateMeta(locale: "en" | "bn") {
    const body = locale === "bn" ? contentBn : content;
    const heading = locale === "bn" ? titleBn || title : title;
    if (!body?.trim()) return toast.error("Write the article content first.");
    setAiBusy(locale);
    try {
      const { suggestion } = await suggestMeta({ data: { title: heading, body, locale } });
      if (locale === "bn") setSeoDescBn(suggestion);
      else setSeoDesc(suggestion);
      toast.success("Draft generated — review and edit before saving.");
    } catch (err: any) {
      toast.error(err?.message ?? "Could not generate a description.");
    } finally {
      setAiBusy(null);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return toast.error("English title is required");
    if (status === "scheduled" && !publishAt) return toast.error("Pick a date and time to schedule this post.");
    setSaving(true);
    try {
      let cover_path = initial?.cover_path ?? null;
      if (file) {
        if (initial?.cover_path) await deleteFile(initial.cover_path);
        cover_path = await uploadFile(file, "posts");
      }
      const published_at =
        status === "published"
          ? (initial?.published_at ?? new Date().toISOString())
          : status === "scheduled"
            ? new Date(publishAt).toISOString()
            : null;
      const payload = {
        title: title.trim(),
        title_bn: titleBn.trim() || null,
        slug: (slug || slugify(title)).trim(),
        excerpt: excerpt.trim(),
        excerpt_bn: excerptBn.trim() || null,
        content,
        content_bn: contentBn || null,
        status,
        tags: parseTags(tags),
        seo_title: seoTitle.trim(),
        seo_title_bn: seoTitleBn.trim() || null,
        seo_description: seoDesc.trim(),
        seo_description_bn: seoDescBn.trim() || null,
        cover_path,
        published_at,
      };
      const { error } = initial
        ? await supabase.from("blog_posts").update(payload).eq("id", initial.id)
        : await supabase.from("blog_posts").insert(payload);
      if (error) throw error;
      toast.success("Saved");
      onSaved();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Save failed");
    } finally { setSaving(false); }
  }


  return (
    <form onSubmit={onSubmit} className="glass-strong p-4 sm:p-6 grid gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">{initial ? "Edit post" : "New post"}</h3>
        <button type="button" onClick={onClose} aria-label="Close"><X className="h-4 w-4" /></button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Title (EN)">
          <input className="glass-input px-4 py-2.5 text-sm w-full" value={title}
            onChange={(e) => { setTitle(e.target.value); if (!initial && !slug) setSlug(slugify(e.target.value)); }} />
        </Field>
        <Field label="শিরোনাম (BN)">
          <input className="glass-input px-4 py-2.5 text-sm w-full" value={titleBn} onChange={(e) => setTitleBn(e.target.value)} />
        </Field>
      </div>

      <Field label="URL slug">
        <input className="glass-input px-4 py-2.5 text-sm w-full" value={slug} onChange={(e) => setSlug(slugify(e.target.value))} />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Excerpt (EN)">
          <textarea className="glass-input px-4 py-2.5 text-sm w-full min-h-20" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
        </Field>
        <Field label="সংক্ষিপ্তসার (BN)">
          <textarea className="glass-input px-4 py-2.5 text-sm w-full min-h-20" value={excerptBn} onChange={(e) => setExcerptBn(e.target.value)} />
        </Field>
      </div>

      <Field label="Content (EN)">
        <RichTextEditor value={content} onChange={setContent} placeholder="Write your article — format text and embed images." />
      </Field>
      <Field label="বিষয়বস্তু (BN)">
        <RichTextEditor value={contentBn} onChange={setContentBn} placeholder="বাংলা সংস্করণ লিখুন।" />
      </Field>

      <label className="glass-input flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer">
        <Upload className="h-4 w-4 text-primary" />
        <span className="text-muted-foreground truncate">
          {file ? file.name : initial?.cover_path ? "Replace thumbnail" : "Upload thumbnail"}
        </span>
        <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </label>

      <Field label="Tags (comma separated — used for related posts)">
        <input
          className="glass-input px-4 py-2.5 text-sm w-full"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="web development, study notes, javascript"
        />
      </Field>

      <p className="text-xs text-muted-foreground">
        Estimated reading time: {readingMinutes(content)} min (EN)
        {contentBn ? ` · ${readingMinutes(contentBn)} min (BN)` : ""}
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Status">
          <select className="glass-input px-4 py-2.5 text-sm w-full" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
          </select>
        </Field>
        {status === "scheduled" && (
          <Field label="Goes live at">
            <input
              type="datetime-local"
              className="glass-input px-4 py-2.5 text-sm w-full"
              value={publishAt}
              onChange={(e) => setPublishAt(e.target.value)}
            />
          </Field>
        )}
      </div>

      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mt-2">SEO</p>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="SEO title (EN)">
          <input className="glass-input px-4 py-2.5 text-sm w-full" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
        </Field>
        <Field label="SEO শিরোনাম (BN)">
          <input className="glass-input px-4 py-2.5 text-sm w-full" value={seoTitleBn} onChange={(e) => setSeoTitleBn(e.target.value)} />
        </Field>
        <Field label="SEO description (EN)">
          <textarea className="glass-input px-4 py-2.5 text-sm w-full min-h-16" value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} />
          <button
            type="button"
            onClick={() => generateMeta("en")}
            disabled={aiBusy !== null}
            className="btn-ghost mt-2 inline-flex items-center gap-2 text-sm"
          >
            {aiBusy === "en" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            Generate SEO meta
          </button>
        </Field>
        <Field label="SEO বিবরণ (BN)">
          <textarea className="glass-input px-4 py-2.5 text-sm w-full min-h-16" value={seoDescBn} onChange={(e) => setSeoDescBn(e.target.value)} />
          <button
            type="button"
            onClick={() => generateMeta("bn")}
            disabled={aiBusy !== null}
            className="btn-ghost mt-2 inline-flex items-center gap-2 text-sm"
          >
            {aiBusy === "bn" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            বাংলা SEO বিবরণ তৈরি করুন
          </button>
        </Field>
      </div>
      <p className="text-xs text-muted-foreground -mt-2">
        AI drafts a suggestion into the box — nothing is saved until you review it and press Save.
      </p>


      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving…" : "Save"}</button>
      </div>
    </form>
  );
}
