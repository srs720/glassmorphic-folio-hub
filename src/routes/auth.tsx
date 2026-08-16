import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error("Invalid credentials");
    toast.success("Welcome back");
    navigate({ to: "/admin" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-4 text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← back to site</Link>
        </div>
        <div className="glass-strong p-8">
          <h1 className="text-2xl font-bold tracking-tight">Admin sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Private area. Access is limited to the site owner.
          </p>
          <form onSubmit={onSubmit} className="mt-6 grid gap-3">
            <input
              className="glass-input px-4 py-2.5 text-sm"
              type="email" placeholder="Email" value={email} autoComplete="username"
              onChange={(e) => setEmail(e.target.value)} required
            />
            <input
              className="glass-input px-4 py-2.5 text-sm"
              type="password" placeholder="Password" value={password} autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)} required
            />
            <button disabled={loading} className="btn-primary mt-2" type="submit">
              {loading ? "…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
