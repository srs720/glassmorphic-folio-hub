import { createFileRoute, Outlet, redirect, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, FolderKanban, MessageSquare, Settings, LogOut, Home } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id);
    const isAdmin = (roles ?? []).some((r) => r.role === "admin");
    if (!isAdmin) throw redirect({ to: "/" });
    return { user: data.user };
  },
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  }

  const linkClass =
    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-foreground/70 hover:bg-white/60 hover:text-foreground transition";
  const activeClass = "bg-white/80 text-foreground shadow-sm";

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary font-semibold">Admin Panel</p>
            <h1 className="text-2xl font-bold tracking-tight">Portfolio Studio</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden md:block text-xs text-muted-foreground">{email}</span>
            <Link to="/" className="btn-ghost inline-flex items-center gap-2 text-sm">
              <Home className="h-4 w-4" /> Site
            </Link>
            <button onClick={signOut} className="btn-ghost inline-flex items-center gap-2 text-sm">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[220px_1fr]">
          <aside className="glass p-3 h-fit sticky top-6">
            <nav className="grid gap-1">
              <Link to="/admin" activeOptions={{ exact: true }} className={linkClass} activeProps={{ className: `${linkClass} ${activeClass}` }}>
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
              <Link to="/admin/projects" className={linkClass} activeProps={{ className: `${linkClass} ${activeClass}` }}>
                <FolderKanban className="h-4 w-4" /> Projects
              </Link>
              <Link to="/admin/messages" className={linkClass} activeProps={{ className: `${linkClass} ${activeClass}` }}>
                <MessageSquare className="h-4 w-4" /> Messages
              </Link>
              <Link to="/admin/settings" className={linkClass} activeProps={{ className: `${linkClass} ${activeClass}` }}>
                <Settings className="h-4 w-4" /> Settings
              </Link>
            </nav>
          </aside>

          <main className="min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
