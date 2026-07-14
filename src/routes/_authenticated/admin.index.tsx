import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FolderKanban, MessageSquare, Link2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Stat({ icon: Icon, label, value }: { icon: typeof FolderKanban; label: string; value: number | string }) {
  return (
    <div className="glass p-6">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-primary/15 p-2.5 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const stats = useQuery({
    queryKey: ["admin_stats"],
    queryFn: async () => {
      const [p, m, s] = await Promise.all([
        supabase.from("projects").select("id", { count: "exact", head: true }),
        supabase.from("messages").select("id", { count: "exact", head: true }),
        supabase.from("social_links").select("id", { count: "exact", head: true }),
      ]);
      return { projects: p.count ?? 0, messages: m.count ?? 0, socials: s.count ?? 0 };
    },
  });

  return (
    <div className="grid gap-4">
      <div className="glass-strong p-6">
        <h2 className="text-xl font-bold">Overview</h2>
        <p className="text-sm text-muted-foreground mt-1">A snapshot of your portfolio.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={FolderKanban} label="Projects" value={stats.data?.projects ?? "—"} />
        <Stat icon={MessageSquare} label="Messages" value={stats.data?.messages ?? "—"} />
        <Stat icon={Link2} label="Social links" value={stats.data?.socials ?? "—"} />
      </div>
    </div>
  );
}
