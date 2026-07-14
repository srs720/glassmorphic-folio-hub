import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/testimonials")({
  component: TestimonialsAdmin,
});

type T = { id: string; author_name: string; author_role: string; content: string; sort_order: number };

function TestimonialsAdmin() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<T | null>(null);
  const [show, setShow] = useState(false);
  const list = useQuery({
    queryKey: ["admin_testimonials"],
    queryFn: async () => {
      const { data } = await supabase.from("testimonials").select("*").order("sort_order");
      return (data ?? []) as T[];
    },
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("testimonials").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Removed"); qc.invalidateQueries({ queryKey: ["admin_testimonials"] }); qc.invalidateQueries({ queryKey: ["testimonials"] }); },
  });

  return (
    <div className="grid gap-4">
      <div className="glass-strong flex items-center justify-between p-6">
        <div><h2 className="text-xl font-bold">Testimonials</h2><p className="text-sm text-muted-foreground">Client and colleague quotes.</p></div>
        <button onClick={() => { setEditing(null); setShow(true); }} className="btn-primary inline-flex items-center gap-2"><Plus className="h-4 w-4" /> Add</button>
      </div>
      {show && (
        <TestimonialForm initial={editing}
          onClose={() => { setShow(false); setEditing(null); }}
          onSaved={() => { setShow(false); setEditing(null); qc.invalidateQueries({ queryKey: ["admin_testimonials"] }); qc.invalidateQueries({ queryKey: ["testimonials"] }); }} />
      )}
      <div className="grid gap-3">
        {list.data?.map((t) => (
          <div key={t.id} className="glass p-4">
            <p className="text-sm">"{t.content}"</p>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{t.author_name}</p>
                <p className="text-xs text-muted-foreground">{t.author_role}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditing(t); setShow(true); }} className="btn-ghost text-sm"><Pencil className="h-3.5 w-3.5" /></button>
                <button onClick={() => confirm("Delete?") && del.mutate(t.id)} className="btn-ghost text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TestimonialForm({ initial, onClose, onSaved }: { initial: T | null; onClose: () => void; onSaved: () => void }) {
  const [author_name, setName] = useState(initial?.author_name ?? "");
  const [author_role, setRole] = useState(initial?.author_role ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [sort_order, setSort] = useState(initial?.sort_order ?? 0);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!author_name.trim() || !content.trim()) return toast.error("Name & content required");
    setSaving(true);
    const payload = { author_name: author_name.trim(), author_role: author_role.trim(), content: content.trim(), sort_order };
    const { error } = initial
      ? await supabase.from("testimonials").update(payload).eq("id", initial.id)
      : await supabase.from("testimonials").insert(payload);
    setSaving(false);
    if (error) return toast.error("Save failed");
    toast.success("Saved"); onSaved();
  }
  return (
    <form onSubmit={onSubmit} className="glass p-4 grid gap-3">
      <div className="flex items-center justify-between"><h3 className="font-bold">{initial ? "Edit testimonial" : "New testimonial"}</h3><button type="button" onClick={onClose}><X className="h-4 w-4" /></button></div>
      <textarea className="glass-input px-4 py-2.5 text-sm min-h-24" placeholder="Quote / content" value={content} onChange={(e) => setContent(e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <input className="glass-input px-4 py-2.5 text-sm" placeholder="Author name" value={author_name} onChange={(e) => setName(e.target.value)} />
        <input className="glass-input px-4 py-2.5 text-sm" placeholder="Role / company" value={author_role} onChange={(e) => setRole(e.target.value)} />
      </div>
      <input type="number" className="glass-input px-4 py-2.5 text-sm" placeholder="Sort order" value={sort_order} onChange={(e) => setSort(Number(e.target.value))} />
      <div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={onClose}>Cancel</button><button type="submit" disabled={saving} className="btn-primary">{saving ? "…" : "Save"}</button></div>
    </form>
  );
}
