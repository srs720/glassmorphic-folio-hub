import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/services")({
  component: ServicesAdmin,
});

type Service = { id: string; title: string; description: string; icon_name: string; sort_order: number };
const ICONS = ["code", "palette", "video", "database", "sparkles"];

function ServicesAdmin() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Service | null>(null);
  const [show, setShow] = useState(false);
  const list = useQuery({
    queryKey: ["admin_services"],
    queryFn: async () => {
      const { data } = await supabase.from("services").select("*").order("sort_order");
      return (data ?? []) as Service[];
    },
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("services").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Removed"); qc.invalidateQueries({ queryKey: ["admin_services"] }); qc.invalidateQueries({ queryKey: ["services"] }); },
  });

  return (
    <div className="grid gap-4">
      <div className="glass-strong flex items-center justify-between p-6">
        <div><h2 className="text-xl font-bold">Services</h2><p className="text-sm text-muted-foreground">Services you offer.</p></div>
        <button onClick={() => { setEditing(null); setShow(true); }} className="btn-primary inline-flex items-center gap-2"><Plus className="h-4 w-4" /> Add</button>
      </div>
      {show && (
        <ServiceForm initial={editing}
          onClose={() => { setShow(false); setEditing(null); }}
          onSaved={() => { setShow(false); setEditing(null); qc.invalidateQueries({ queryKey: ["admin_services"] }); qc.invalidateQueries({ queryKey: ["services"] }); }} />
      )}
      <div className="grid gap-2">
        {list.data?.map((s) => (
          <div key={s.id} className="glass p-4 flex items-start gap-3">
            <span className="text-xs bg-primary/15 text-primary rounded px-2 py-1">{s.icon_name}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">{s.title}</p>
              <p className="text-sm text-muted-foreground line-clamp-2">{s.description}</p>
            </div>
            <button onClick={() => { setEditing(s); setShow(true); }} className="btn-ghost text-sm"><Pencil className="h-3.5 w-3.5" /></button>
            <button onClick={() => confirm("Delete?") && del.mutate(s.id)} className="btn-ghost text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ServiceForm({ initial, onClose, onSaved }: { initial: Service | null; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [icon_name, setIcon] = useState(initial?.icon_name ?? "sparkles");
  const [sort_order, setSort] = useState(initial?.sort_order ?? 0);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return toast.error("Title required");
    setSaving(true);
    const payload = { title: title.trim(), description: description.trim(), icon_name, sort_order };
    const { error } = initial
      ? await supabase.from("services").update(payload).eq("id", initial.id)
      : await supabase.from("services").insert(payload);
    setSaving(false);
    if (error) return toast.error("Save failed");
    toast.success("Saved"); onSaved();
  }
  return (
    <form onSubmit={onSubmit} className="glass p-4 grid gap-3">
      <div className="flex items-center justify-between"><h3 className="font-bold">{initial ? "Edit service" : "New service"}</h3><button type="button" onClick={onClose}><X className="h-4 w-4" /></button></div>
      <input className="glass-input px-4 py-2.5 text-sm" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea className="glass-input px-4 py-2.5 text-sm min-h-24" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <select className="glass-input px-4 py-2.5 text-sm" value={icon_name} onChange={(e) => setIcon(e.target.value)}>
          {ICONS.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
        <input type="number" className="glass-input px-4 py-2.5 text-sm" placeholder="Sort order" value={sort_order} onChange={(e) => setSort(Number(e.target.value))} />
      </div>
      <div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={onClose}>Cancel</button><button type="submit" disabled={saving} className="btn-primary">{saving ? "…" : "Save"}</button></div>
    </form>
  );
}
