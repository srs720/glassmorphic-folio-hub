import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, X, Upload, GripVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile, deleteFile } from "@/lib/portfolio";
import { SignedImage } from "@/components/SignedImage";

export type FieldDef = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "select" | "number" | "date";
  options?: string[];
  placeholder?: string;
  min?: number;
  max?: number;
};

export type ManagerConfig = {
  table: string;
  queryKey: string;
  singular: string;
  plural: string;
  fields: FieldDef[];
  imageField?: string;      // e.g. "image_path"
  imageFolder?: string;     // storage folder
  titleField: string;       // main display field (e.g. "name" or "title")
  subtitleField?: string;   // secondary display (e.g. "relation")
};

export function AdminManager({ cfg }: { cfg: ManagerConfig }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Record<string, any> | null>(null);
  const [showForm, setShowForm] = useState(false);

  const list = useQuery({
    queryKey: [cfg.queryKey],
    queryFn: async () => {
      const { data, error } = await supabase.from(cfg.table as any).select("*").order("sort_order").order("created_at");
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });

  const del = useMutation({
    mutationFn: async (row: any) => {
      if (cfg.imageField && row[cfg.imageField]) await deleteFile(row[cfg.imageField]);
      const { error } = await supabase.from(cfg.table as any).delete().eq("id", row.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: [cfg.queryKey] });
    },
    onError: () => toast.error("Delete failed"),
  });

  return (
    <div className="glass-strong p-6 grid gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{cfg.plural}</h2>
          <p className="text-sm text-muted-foreground">Add, edit, or remove {cfg.plural.toLowerCase()}.</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary">
          <Plus className="h-4 w-4" /> Add {cfg.singular}
        </button>
      </div>

      {showForm && (
        <ManagerForm
          cfg={cfg}
          initial={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => {
            setShowForm(false); setEditing(null);
            qc.invalidateQueries({ queryKey: [cfg.queryKey] });
          }}
        />
      )}

      <div className="grid gap-2">
        {list.isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {list.data?.length === 0 && <p className="text-sm text-muted-foreground">Nothing here yet.</p>}
        {list.data?.map((row) => (
          <div key={row.id} className="glass flex items-center gap-3 p-3">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            {cfg.imageField && (
              <div className="h-12 w-12 rounded-xl overflow-hidden bg-surface-2 flex-shrink-0">
                {row[cfg.imageField] ? (
                  <SignedImage path={row[cfg.imageField]} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-[#EAF5FE] to-[#FFF6DD]" />
                )}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{row[cfg.titleField] || "(untitled)"}</p>
              {cfg.subtitleField && row[cfg.subtitleField] && (
                <p className="text-xs text-muted-foreground truncate">{row[cfg.subtitleField]}</p>
              )}
            </div>
            <span className="text-xs text-muted-foreground mr-2">#{row.sort_order ?? 0}</span>
            <button onClick={() => { setEditing(row); setShowForm(true); }} className="btn-ghost text-sm">
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => confirm("Delete this?") && del.mutate(row)} className="btn-ghost text-sm text-destructive">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ManagerForm({
  cfg, initial, onClose, onSaved,
}: {
  cfg: ManagerConfig;
  initial: Record<string, any> | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [values, setValues] = useState<Record<string, any>>(() => {
    const base: Record<string, any> = { sort_order: 0 };
    for (const f of cfg.fields) {
      base[f.key] = initial?.[f.key] ?? (f.type === "number" ? 0 : "");
    }
    base.sort_order = initial?.sort_order ?? 0;
    return base;
  });
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Record<string, any> = {};
      for (const f of cfg.fields) {
        let v = values[f.key];
        if (typeof v === "string") v = v.trim();
        if (f.type === "number") v = v === "" || v === null ? null : Number(v);
        if (f.type === "date") v = v || null;
        payload[f.key] = v === "" ? null : v;
      }
      payload.sort_order = Number(values.sort_order) || 0;

      if (cfg.imageField) {
        if (file) {
          if (initial?.[cfg.imageField]) await deleteFile(initial[cfg.imageField]);
          payload[cfg.imageField] = await uploadFile(file, cfg.imageFolder || cfg.table);
        } else if (initial) {
          payload[cfg.imageField] = initial[cfg.imageField] ?? null;
        }
      }

      const { error } = initial
        ? await supabase.from(cfg.table as any).update(payload).eq("id", initial.id)
        : await supabase.from(cfg.table as any).insert(payload);
      if (error) throw error;
      toast.success("Saved");
      onSaved();
    } catch (err) {
      console.error(err);
      toast.error("Save failed");
    } finally { setSaving(false); }
  }

  return (
    <form onSubmit={submit} className="glass p-4 grid gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">{initial ? `Edit ${cfg.singular}` : `New ${cfg.singular}`}</h3>
        <button type="button" onClick={onClose}><X className="h-4 w-4" /></button>
      </div>

      {cfg.fields.map((f) => (
        <div key={f.key}>
          <label className="text-xs uppercase tracking-wide text-muted-foreground">{f.label}</label>
          {f.type === "textarea" ? (
            <textarea
              className="glass-input w-full min-h-24 mt-1"
              placeholder={f.placeholder}
              value={values[f.key] ?? ""}
              onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
            />
          ) : f.type === "select" ? (
            <select
              className="glass-input w-full mt-1"
              value={values[f.key] ?? ""}
              onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
            >
              <option value="">— select —</option>
              {(f.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          ) : (
            <input
              type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
              min={f.min}
              max={f.max}
              className="glass-input w-full mt-1"
              placeholder={f.placeholder}
              value={values[f.key] ?? ""}
              onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
            />
          )}
        </div>
      ))}

      <div>
        <label className="text-xs uppercase tracking-wide text-muted-foreground">Sort order</label>
        <input
          type="number"
          className="glass-input w-full mt-1"
          value={values.sort_order ?? 0}
          onChange={(e) => setValues({ ...values, sort_order: e.target.value })}
        />
      </div>

      {cfg.imageField && (
        <div>
          <label className="text-xs uppercase tracking-wide text-muted-foreground">Image</label>
          <label className="glass-input flex items-center gap-3 mt-1 cursor-pointer">
            <Upload className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground truncate">
              {file ? file.name : initial?.[cfg.imageField] ? "Replace image" : "Upload image"}
            </span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </label>
        </div>
      )}

      <div className="flex justify-end gap-2 mt-2">
        <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
        <button disabled={saving} className="btn-primary">{saving ? "Saving…" : "Save"}</button>
      </div>
    </form>
  );
}
