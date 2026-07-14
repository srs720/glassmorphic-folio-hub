import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FolderKanban, MessageSquare, FileText, Quote } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
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
      const [p, m, b, t] = await Promise.all([
        supabase.from("projects").select("id", { count: "exact", head: true }),
        supabase.from("messages").select("id", { count: "exact", head: true }),
        supabase.from("blog_posts").select("id", { count: "exact", head: true }),
        supabase.from("testimonials").select("id", { count: "exact", head: true }),
      ]);
      return { projects: p.count ?? 0, messages: m.count ?? 0, blog: b.count ?? 0, testimonials: t.count ?? 0 };
    },
  });

  const traffic = useQuery({
    queryKey: ["admin_messages_traffic"],
    queryFn: async () => {
      const { data } = await supabase.from("messages").select("created_at").order("created_at", { ascending: false }).limit(200);
      const buckets: Record<string, number> = {};
      const now = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now); d.setDate(d.getDate() - i);
        buckets[d.toISOString().slice(0, 10)] = 0;
      }
      (data ?? []).forEach((r) => {
        const k = new Date(r.created_at).toISOString().slice(0, 10);
        if (k in buckets) buckets[k]++;
      });
      return Object.entries(buckets).map(([day, count]) => ({ day: day.slice(5), count }));
    },
  });

  return (
    <div className="grid gap-4">
      <div className="glass-strong p-6">
        <h2 className="text-xl font-bold">Overview</h2>
        <p className="text-sm text-muted-foreground mt-1">A snapshot of your portfolio.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={FolderKanban} label="Projects" value={stats.data?.projects ?? "—"} />
        <Stat icon={FileText} label="Blog posts" value={stats.data?.blog ?? "—"} />
        <Stat icon={MessageSquare} label="Messages" value={stats.data?.messages ?? "—"} />
        <Stat icon={Quote} label="Testimonials" value={stats.data?.testimonials ?? "—"} />
      </div>

      <div className="glass p-6">
        <h3 className="font-semibold">Messages — last 7 days</h3>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={traffic.data ?? []}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="day" fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip />
              <Bar dataKey="count" fill="oklch(0.68 0.15 155)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
