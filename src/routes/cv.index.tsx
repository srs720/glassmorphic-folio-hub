import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { saveCvAccessEmail } from "@/lib/cv-access";

export const Route = createFileRoute("/cv/")({
  head: () => ({
    meta: [
      { title: "Open CV | Shoibur Rahman" },
      {
        name: "description",
        content: "Enter your approved email address to open the private CV of Shoibur Rahman.",
      },
      { property: "og:title", content: "Open CV | Shoibur Rahman" },
      {
        property: "og:description",
        content: "Approved visitors can open the private CV of Shoibur Rahman with their registered email.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CvGatePage,
});

function CvGatePage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setMessage("Please enter a valid email address.");
      return;
    }
    setBusy(true);
    setMessage("");
    const { data, error } = await (supabase as any).rpc("check_cv_access", { _email: value });
    setBusy(false);
    if (error) {
      setMessage(error.message || "Something went wrong. Please try again.");
      return;
    }
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) {
      setMessage("We couldn't find a request for this email. Please request access first.");
      return;
    }
    if (row.status === "rejected") {
      setMessage("Your request was not approved.");
      return;
    }
    if (row.status !== "approved") {
      setMessage("Your request is still pending approval.");
      return;
    }
    if (row.expires_at && new Date(row.expires_at).getTime() <= Date.now()) {
      setMessage("Your access has expired.");
      return;
    }
    saveCvAccessEmail(value);
    navigate({ to: "/cv/viewer" });
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-xl px-4 py-14">
        <div className="bento p-6 md:p-8 grid gap-5">
          <div>
            <p className="label-mono">Curriculum Vitae</p>
            <h1 className="font-display text-3xl mt-2">Open the CV</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Enter the email address you used when requesting access.
            </p>
          </div>
          <form onSubmit={submit} className="grid gap-4">
            <div>
              <label className="label-mono" htmlFor="cv-open-email">Your registered email</label>
              <input
                id="cv-open-email"
                type="email"
                className="field mt-2"
                maxLength={255}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button disabled={busy} className="btn-primary justify-self-start">
              {busy ? "Checking..." : "Open CV"}
            </button>
          </form>
          {message && <p className="text-sm text-destructive">{message}</p>}
          <p className="text-sm text-muted-foreground">
            Don't have access yet?{" "}
            <Link to="/cv/request" className="text-primary underline underline-offset-4">Request CV access</Link>
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
