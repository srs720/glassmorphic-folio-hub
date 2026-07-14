import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/messages")({
  component: MessagesAdmin,
});

function MessagesAdmin() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["admin_messages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("messages").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
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
      </div>

      {list.isLoading ? (
        <div className="glass p-6 text-muted-foreground">Loading…</div>
      ) : list.data?.length === 0 ? (
        <div className="glass p-6 text-muted-foreground">No messages yet.</div>
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
                <div className="flex items-center gap-3">
                  <time className="text-xs text-muted-foreground">
                    {new Date(m.created_at).toLocaleString()}
                  </time>
                  <button
                    onClick={() => confirm("Delete this message?") && del.mutate(m.id)}
                    className="btn-ghost inline-flex items-center gap-1 text-sm text-destructive"
                  >
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
