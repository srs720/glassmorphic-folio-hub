import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Mail, Archive, ArchiveRestore, Inbox } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/messages")({
  component: MessagesAdmin,
});

function MessagesAdmin() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"inbox" | "archived">("inbox");

  const list = useQuery({
    queryKey: ["admin_messages", tab],
    queryFn: async () => {
      const { data, error } = await supabase.from("messages").select("*")
        .eq("archived", tab === "archived").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const archive = useMutation({
    mutationFn: async ({ id, archived }: { id: string; archived: boolean }) => {
      const { error } = await supabase.from("messages").update({ archived }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Updated");
      qc.invalidateQueries({ queryKey: ["admin_messages"] });
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("messages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin_messages"] });
    },
  });

  return (
    <div className="grid gap-4">
      <div className="glass-strong p-6">
        <h2 className="text-xl font-bold">Messages</h2>
        <p className="text-sm text-muted-foreground">Contact-form submissions.</p>
        <div className="mt-4 flex gap-2">
          <button onClick={() => setTab("inbox")}
            className={tab === "inbox" ? "btn-primary inline-flex items-center gap-2" : "btn-ghost inline-flex items-center gap-2"}>
            <Inbox className="h-4 w-4" /> Inbox
          </button>
          <button onClick={() => setTab("archived")}
            className={tab === "archived" ? "btn-primary inline-flex items-center gap-2" : "btn-ghost inline-flex items-center gap-2"}>
            <Archive className="h-4 w-4" /> Archived
          </button>
        </div>
      </div>

      {list.isLoading ? (
        <div className="glass p-6 text-muted-foreground">Loading…</div>
      ) : list.data?.length === 0 ? (
        <div className="glass p-6 text-muted-foreground">No messages here.</div>
      ) : (
        <div className="grid gap-3">
          {list.data?.map((m) => (
            <article key={m.id} className="glass p-5">
              <header className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{m.name}</p>
                  <a href={`mailto:${m.email}`} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                    <Mail className="h-3.5 w-3.5" /> {m.email}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <time className="text-xs text-muted-foreground">
                    {new Date(m.created_at).toLocaleString()}
                  </time>
                  <button onClick={() => archive.mutate({ id: m.id, archived: !m.archived })}
                    className="btn-ghost inline-flex items-center gap-1 text-sm">
                    {m.archived ? <><ArchiveRestore className="h-3.5 w-3.5" /> Unarchive</> : <><Archive className="h-3.5 w-3.5" /> Archive</>}
                  </button>
                  <button onClick={() => confirm("Delete this message?") && del.mutate(m.id)}
                    className="btn-ghost inline-flex items-center gap-1 text-sm text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </header>
              <p className="mt-3 whitespace-pre-wrap text-sm text-foreground/80">{m.message}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
