import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { requestPasswordOtp, resetPasswordWithOtp } from "@/lib/auth-reset.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset Password | Shoibur Rahman" },
      { name: "description", content: "Password reset with a Telegram verification code." },
      { property: "og:title", content: "Reset Password | Shoibur Rahman" },
      { property: "og:description", content: "Password reset with a Telegram verification code." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const requestOtp = useServerFn(requestPasswordOtp);
  const resetPw = useServerFn(resetPasswordWithOtp);
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submitRequest(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return toast.error("Enter your email");
    setBusy(true);
    try {
      await requestOtp({ data: { email } });
      toast.success("If this email has an account, the code was sent to Telegram.");
      setStep(2);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  async function submitReset(e: FormEvent) {
    e.preventDefault();
    if (code.trim().length !== 6) return toast.error("Enter the 6-digit code");
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    setBusy(true);
    try {
      await resetPw({ data: { email, code, password } });
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.success("Password updated. Please sign in.");
        navigate({ to: "/auth", replace: true });
        return;
      }
      toast.success("Password updated");
      navigate({ to: "/admin", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-4 text-center">
          <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground">← back to sign in</Link>
        </div>
        <div className="glass-strong p-8">
          <h1 className="text-2xl font-bold tracking-tight">Reset password</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {step === 1
              ? "Enter your account email. A 6-digit code will be sent via Telegram."
              : "Enter the 6-digit code from Telegram and your new password."}
          </p>
          {step === 1 ? (
            <form onSubmit={submitRequest} className="mt-6 grid gap-3">
              <input
                className="glass-input px-4 py-2.5 text-sm"
                type="email" placeholder="Email" value={email}
                onChange={(e) => setEmail(e.target.value)} required
              />
              <button disabled={busy} className="btn-primary mt-2" type="submit">
                {busy ? "…" : "Send code"}
              </button>
            </form>
          ) : (
            <form onSubmit={submitReset} className="mt-6 grid gap-3">
              <input
                className="glass-input px-4 py-2.5 text-sm tracking-widest"
                inputMode="numeric" maxLength={6} placeholder="6-digit code" value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} required
              />
              <input
                className="glass-input px-4 py-2.5 text-sm"
                type="password" placeholder="New password" value={password} autoComplete="new-password"
                onChange={(e) => setPassword(e.target.value)} required
              />
              <button disabled={busy} className="btn-primary mt-2" type="submit">
                {busy ? "…" : "Update password"}
              </button>
              <button type="button" onClick={() => setStep(1)} className="btn-ghost text-sm">
                Use a different email
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
