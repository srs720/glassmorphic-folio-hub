import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Admin" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
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
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      setLoading(false);
      if (error) return toast.error(error.message);
      toast.success("Account created — signing you in…");
      navigate({ to: "/admin" });
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) return toast.error(error.message);
      toast.success("Welcome back");
      navigate({ to: "/admin" });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-4 text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← back to site</Link>
        </div>
        <div className="glass-strong p-8">
          <h1 className="text-2xl font-bold tracking-tight">Admin {mode === "signin" ? "Sign in" : "Sign up"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signup"
              ? "The first account created becomes the admin."
              : "Sign in to manage your portfolio."}
          </p>
          <form onSubmit={onSubmit} className="mt-6 grid gap-3">
            <input
              className="glass-input px-4 py-2.5 text-sm"
              type="email" placeholder="Email" value={email}
              onChange={(e) => setEmail(e.target.value)} required
            />
            <input
              className="glass-input px-4 py-2.5 text-sm"
              type="password" placeholder="Password (min 8 chars)" value={password}
              onChange={(e) => setPassword(e.target.value)} required minLength={8}
            />
            <button disabled={loading} className="btn-primary mt-2" type="submit">
              {loading ? "…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-4 text-sm text-primary hover:underline"
          >
            {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
