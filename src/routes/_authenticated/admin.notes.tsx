import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Plus, Save, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/notes")({
  component: NotesAdmin,
});

type Note = {
  id: string;
  title: string;
  content: string;
  passkey: string;
  sort_order: number;
};

function NotesAdmin() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<Note> | null>(null);

  const q = useQuery({
    queryKey: ["secret_notes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("secret_notes")
        .select("id, title, content, passkey, sort_order")
        .order("sort_order")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Note[];
    },
  });

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const title = (editing.title ?? "").trim();
    const passkey = (editing.passkey ?? "").trim();
    const content = (editing.content ?? "").trim();
    if (title.length < 2) { toast.error("Add a title."); return; }
    if (passkey.length < 4) { toast.error("Passkey must be at least 4 characters."); return; }

    const payload = { title, content, passkey, sort_order: editing.sort_order ?? 0 };
    const { error } = editing.id
      ? await supabase.from("secret_notes").update(payload).eq("id", editing.id)
      : await supabase.from("secret_notes").insert(payload);
    if (error) { toast.error("Couldn't save the note."); return; }
    toast.success("Note saved");
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["secret_notes"] });
  }

  async function remove(id: string) {
    const { error } = await supabase.from("secret_notes").delete().eq("id", id);
    if (error) { toast.error("Couldn't delete the note."); return; }
    toast.success("Note deleted");
    qc.invalidateQueries({ queryKey: ["secret_notes"] });
  }

  return (
    <div className="grid gap-4">
      <div className="bento p-5 md:p-7 grid gap-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl">Notes Manager</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Each note is unlocked on the public page with its passkey. Share the passkey only with the right people.
            </p>
          </div>
          <button className="btn-primary text-sm" onClick={() => setEditing({ title: "", content: "", passkey: "", sort_order: 0 })}>
            <Plus className="h-4 w-4" /> New note
          </button>
        </div>
      </div>

      {editing && (
        <form onSubmit={save} className="bento p-5 md:p-7 grid gap-4 max-w-2xl">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl">{editing.id ? "Edit note" : "New note"}</h3>
            <button type="button" className="btn-ghost text-sm" onClick={() => setEditing(null)}>
              <X className="h-4 w-4" /> Cancel
            </button>
          </div>
          <div>
            <label className="label-mono" htmlFor="note_title">Title</label>
            <input id="note_title" className="field mt-2" maxLength={160} value={editing.title ?? ""}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })} required />
          </div>
          <div>
            <label className="label-mono" htmlFor="note_passkey">Passkey (required)</label>
            <input id="note_passkey" className="field mt-2" maxLength={200} value={editing.passkey ?? ""}
              onChange={(e) => setEditing({ ...editing, passkey: e.target.value })} required />
          </div>
          <div>
            <label className="label-mono" htmlFor="note_content">Content</label>
            <textarea id="note_content" className="field mt-2 min-h-40" value={editing.content ?? ""}
              onChange={(e) => setEditing({ ...editing, content: e.target.value })} />
          </div>
          <div>
            <label className="label-mono" htmlFor="note_order">Order</label>
            <input id="note_order" type="number" className="field mt-2" value={editing.sort_order ?? 0}
              onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} />
          </div>
          <div>
            <button className="btn-primary">Save <Save className="h-4 w-4" /></button>
          </div>
        </form>
      )}

      <div className="bento p-5 md:p-7 grid gap-3">
        {q.isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
        {q.data?.length === 0 && <p className="text-sm text-muted-foreground">No notes yet.</p>}
        {q.data?.map((n) => (
          <div key={n.id} className="rounded-2xl border border-border p-4 grid gap-2 sm:flex sm:items-center sm:gap-4">
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{n.title}</p>
              <p className="text-sm text-muted-foreground line-clamp-2">{n.content}</p>
              <p className="text-xs font-mono mt-1 text-primary">Passkey: {n.passkey}</p>
            </div>
            <div className="flex gap-2">
              <button className="btn-ghost text-sm" onClick={() => setEditing(n)}>Edit</button>
              <button className="btn-ghost text-sm text-destructive" onClick={() => remove(n.id)}>
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
