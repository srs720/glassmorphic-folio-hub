import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/cv/request")({
  head: () => ({
    meta: [
      { title: "Request CV Access | Shoibur Rahman" },
      {
        name: "description",
        content:
          "Request secure access to the CV of Shoibur Rahman. Verify your email with a one-time code and view the CV once approved.",
      },
      { property: "og:title", content: "Request CV Access | Shoibur Rahman" },
      {
        property: "og:description",
        content: "Verify your email with a one-time code to request access to Shoibur Rahman's CV.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CvRequestPage,
});

function CvRequestPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"form" | "otp" | "waiting">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [purpose, setPurpose] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);

  async function submitRequest(e: FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2 || purpose.trim().length < 3 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("Please fill in every field correctly.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/public/request-cv", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), purpose: purpose.trim() }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error ?? "Something went wrong."); return; }
      toast.success(json.message ?? "Code sent.");
      setStep("otp");
    } catch {
      toast.error("Network problem. Please try again.");
    } finally { setBusy(false); }
  }

  async function submitOtp(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/public/verify-otp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error ?? "Could not verify the code."); return; }
      if (json.status === "approved") { navigate({ to: "/cv/viewer" }); return; }
      toast.success("Email verified.");
      setStep("waiting");
    } catch {
      toast.error("Network problem. Please try again.");
    } finally { setBusy(false); }
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-xl px-4 py-14">
        <div className="bento p-6 md:p-8 grid gap-5">
          <div>
            <p className="label-mono">Curriculum Vitae</p>
            <h1 className="font-display text-3xl mt-2">Request CV access</h1>
            <p className="text-sm text-muted-foreground mt-2">
              The CV is shared privately. Verify your email with a one-time code, then wait for approval.
            </p>
          </div>

          {step === "form" && (
            <form onSubmit={submitRequest} className="grid gap-4">
              <div>
                <label className="label-mono" htmlFor="cv-name">Your name</label>
                <input id="cv-name" className="field mt-2" maxLength={100} value={name}
                  onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <label className="label-mono" htmlFor="cv-email">Your email</label>
                <input id="cv-email" type="email" className="field mt-2" maxLength={255} value={email}
                  onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <label className="label-mono" htmlFor="cv-purpose">Purpose</label>
                <textarea id="cv-purpose" className="field mt-2 min-h-24" maxLength={600} value={purpose}
                  onChange={(e) => setPurpose(e.target.value)} required />
              </div>
              <button disabled={busy} className="btn-primary justify-self-start">
                {busy ? "Sending..." : "Send verification code"}
              </button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={submitOtp} className="grid gap-4">
              <div>
                <label className="label-mono" htmlFor="cv-otp">6-digit code sent to {email}</label>
                <input id="cv-otp" inputMode="numeric" pattern="\d{6}" maxLength={6}
                  className="field mt-2 tracking-[0.5em] text-center text-xl" value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} required />
              </div>
              <div className="flex gap-2">
                <button disabled={busy} className="btn-primary">{busy ? "Checking..." : "Verify code"}</button>
                <button type="button" className="btn-ghost" onClick={() => setStep("form")}>Back</button>
              </div>
            </form>
          )}

          {step === "waiting" && (
            <div className="grid gap-3">
              <p className="text-sm">
                Thank you — your email is verified. Your request is now waiting for manual approval.
                You will be able to open the CV as soon as it is approved.
              </p>
              <button className="btn-primary justify-self-start" onClick={() => navigate({ to: "/cv/viewer" })}>
                Check access
              </button>
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
