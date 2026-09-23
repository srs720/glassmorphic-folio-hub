import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/cv/request")({
  head: () => ({
    meta: [
      { title: "Request CV Access | Shoibur Rahman" },
      {
        name: "description",
        content:
          "Request access to the CV of Shoibur Rahman. Requests are reviewed manually and approved for a limited time.",
      },
      { property: "og:title", content: "Request CV Access | Shoibur Rahman" },
      {
        property: "og:description",
        content: "Send a short request to view Shoibur Rahman's CV. Access is granted manually for a limited time.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CvRequestPage,
});

function CvRequestPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [purpose, setPurpose] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2 || purpose.trim().length < 3 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please fill in every field correctly.");
      return;
    }
    setBusy(true);
    setError("");
    const { error: insertError } = await supabase.from("cv_requests").insert({
      user_name: name.trim().slice(0, 100),
      user_email: email.trim().toLowerCase().slice(0, 255),
      purpose: purpose.trim().slice(0, 600),
    });
    setBusy(false);
    if (insertError) {
      setError(insertError.message || "Could not send your request. Please try again.");
      return;
    }
    setSent(true);
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-xl px-4 py-14">
        <div className="bento p-6 md:p-8 grid gap-5">
          <div>
            <p className="label-mono">Curriculum Vitae</p>
            <h1 className="font-display text-3xl mt-2">Request CV access</h1>
            <p className="text-sm text-muted-foreground mt-2">
              The CV is shared privately. Send a short request and it will be reviewed manually.
            </p>
          </div>

          {sent ? (
            <div className="grid gap-3">
              <p className="text-sm">Your request has been sent to the admin. Please check back later.</p>
              <Link to="/cv" className="btn-primary justify-self-start">Open CV</Link>
            </div>
          ) : (
            <form onSubmit={submit} className="grid gap-4">
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
                {busy ? "Sending..." : "Send request"}
              </button>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </form>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
