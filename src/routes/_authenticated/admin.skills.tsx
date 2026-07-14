import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Plus, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/skills")({
  component: SkillsAdmin,
});

type Skill = { id: string; name: string; category: string; sort_order: number };

function SkillsAdmin() {
  const qc = useQueryClient();
  const [show, setShow] = useState(false);
  const list = useQuery({
    queryKey: ["admin_skills"],
    queryFn: async () => {
      const { data } = await supabase.from("skills").select("*").order("sort_order");
      return (data ?? []) as Skill[];
    },
  });
  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("skills").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Removed"); qc.invalidateQueries({ queryKey: ["admin_skills"] }); qc.invalidateQueries({ queryKey: ["skills"] }); },
  });

  return (
    <div className="grid gap-4">
      <div className="glass-strong flex items-center justify-between p-6">
        <div>
          <h2 className="text-xl font-bold">Skills</h2>
          <p className="text-sm text-muted-foreground">Tools & technologies displayed on your site.</p>
        </div>
        <button onClick={() => setShow(true)} className="btn-primary inline-flex items-center gap-2"><Plus className="h-4 w-4" /> Add</button>
      </div>
      {show && <SkillForm onClose={() => setShow(false)} onSaved={() => { setShow(false); qc.invalidateQueries({ queryKey: ["admin_skills"] }); qc.invalidateQueries({ queryKey: ["skills"] }); }} />}
      <div className="grid gap-2">
        {list.data?.map((s) => (
          <div key={s.id} className="glass flex items-center gap-3 p-3">
            <span className="text-xs bg-primary/15 text-primary rounded px-2 py-0.5">{s.category}</span>
            <p className="flex-1 font-medium">{s.name}</p>
            <span className="text-xs text-muted-foreground">#{s.sort_order}</span>
            <button onClick={() => confirm("Delete?") && del.mutate(s.id)} className="btn-ghost text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkillForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("General");
  const [sort_order, setSort] = useState(0);
  const [saving, setSaving] = useState(false);
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return toast.error("Name required");
    setSaving(true);
    const { error } = await supabase.from("skills").insert({ name: name.trim(), category: category.trim(), sort_order });
    setSaving(false);
    if (error) return toast.error("Save failed");
    toast.success("Added"); onSaved();
  }
  return (
    <form onSubmit={onSubmit} className="glass p-4 grid gap-3">
      <div className="flex items-center justify-between"><h3 className="font-bold">New skill</h3><button type="button" onClick={onClose}><X className="h-4 w-4" /></button></div>
      <input className="glass-input px-4 py-2.5 text-sm" placeholder="Skill name" value={name} onChange={(e) => setName(e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <input className="glass-input px-4 py-2.5 text-sm" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
        <input type="number" className="glass-input px-4 py-2.5 text-sm" placeholder="Sort order" value={sort_order} onChange={(e) => setSort(Number(e.target.value))} />
      </div>
      <div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={onClose}>Cancel</button><button type="submit" disabled={saving} className="btn-primary">{saving ? "…" : "Save"}</button></div>
    </form>
  );
}
