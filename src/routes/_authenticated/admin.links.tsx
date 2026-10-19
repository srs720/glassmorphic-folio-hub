import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Copy, Trash2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/links")({
  component: LinkManager,
});

const BASE = "https://shoiburrahman.com";
const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 64);

function LinkManager() {
  const qc = useQueryClient();
  const [slug, setSlug] = useState("");
  const [dest, setDest] = useState("");

  const list = useQuery({
    queryKey: ["admin_links"],
    queryFn: async () => {
      const { data, error } = await supabase.from("custom_links").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      const s = clean(slug);
      if (!s) throw new Error("Slug is required");
      let u: URL;
      try { u = new URL(dest.trim()); } catch { throw new Error("Enter a valid URL (https://...)"); }
      if (!/^https?:$/.test(u.protocol)) throw new Error("URL must start with http(s)://");
      const { error } = await supabase.from("custom_links").insert({ slug: s, destination_url: u.toString() });
      if (error) throw new Error(error.code === "23505" ? "That slug already exists" : error.message);
    },
    onSuccess: () => { toast.success("Link created"); setSlug(""); setDest(""); qc.invalidateQueries({ queryKey: ["admin_links"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("custom_links").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin_links"] }); },
    onError: () => toast.error("Delete failed"),
  });

  function submit(e: FormEvent) { e.preventDefault(); add.mutate(); }

  return (
    <div className="glass-strong p-6 grid gap-5">
      <div>
        <h2 className="text-xl font-bold">Link Manager</h2>
        <p className="text-sm text-muted-foreground">Create short links like {BASE}/fb that redirect instantly.</p>
      </div>
      <form onSubmit={submit} className="glass p-4 grid gap-3 md:grid-cols-[1fr_2fr_auto] md:items-end">
        <div>
          <label className="text-xs uppercase tracking-wide text-muted-foreground">Slug</label>
          <input className="glass-input w-full mt-1" placeholder="fb" value={slug} onChange={(e) => setSlug(clean(e.target.value))} required />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wide text-muted-foreground">Destination URL</label>
          <input type="url" className="glass-input w-full mt-1" placeholder="https://facebook.com/..." value={dest} onChange={(e) => setDest(e.target.value)} required />
        </div>
        <button disabled={add.isPending} className="btn-primary"><Plus className="h-4 w-4" /> Add</button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-muted-foreground">
            <tr><th className="p-2">Slug</th><th className="p-2">Destination</th><th className="p-2">Clicks</th><th className="p-2"></th></tr>
          </thead>
          <tbody>
            {list.isLoading && <tr><td colSpan={4} className="p-2 text-muted-foreground">Loading…</td></tr>}
            {list.data?.length === 0 && <tr><td colSpan={4} className="p-2 text-muted-foreground">No links yet.</td></tr>}
            {list.data?.map((l) => (
              <tr key={l.id} className="border-t border-border">
                <td className="p-2 whitespace-nowrap">
                  <span className="font-medium">/{l.slug}</span>
                  <button
                    type="button"
                    className="btn-ghost ml-1 text-xs"
                    aria-label="Copy short link"
                    onClick={() => navigator.clipboard.writeText(`${BASE}/${l.slug}`).then(() => toast.success("Copied"))}
                  ><Copy className="h-3.5 w-3.5" /></button>
                </td>
                <td className="p-2 max-w-[280px] truncate"><a href={l.destination_url} target="_blank" rel="noreferrer" className="text-primary">{l.destination_url}</a></td>
                <td className="p-2">{l.clicks}</td>
                <td className="p-2 text-right">
                  <button type="button" onClick={() => confirm("Delete this link?") && del.mutate(l.id)} className="btn-ghost text-destructive" aria-label="Delete">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
