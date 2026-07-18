import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout, useSocials, SocialIcon } from "@/components/SiteLayout";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Shoibur Rahman" },
      { name: "description", content: "Get in touch with Shoibur Rahman for web development, logo design, or promotional video editing." },
      { property: "og:title", content: "Contact — Shoibur Rahman" },
      { property: "og:description", content: "Get in touch with Shoibur Rahman for web development, logo design, or promotional video editing." },
      { property: "og:url", content: "https://glassmorphic-folio-hub.lovable.app/contact" },
    ],
    links: [{ rel: "canonical", href: "https://glassmorphic-folio-hub.lovable.app/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const socials = useSocials();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) { toast.error("Please fill in every field."); return; }
    if (name.length > 100 || email.length > 255 || message.length > 2000) { toast.error("Input too long."); return; }
    setLoading(true);
    const { error } = await supabase.from("messages").insert({ name: name.trim(), email: email.trim(), message: message.trim() });
    setLoading(false);
    if (error) { toast.error("Failed to send. Try again."); return; }
    toast.success("Message sent — thanks!");
    setName(""); setEmail(""); setMessage("");
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-4xl px-4 md:px-6 pt-12 pb-24">
        <p className="mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">// SCENE_05 · Call Sheet</p>
        <h1 className="mt-4 font-display text-5xl md:text-7xl uppercase leading-[0.9]">
          Send The <span className="text-accent">Brief.</span>
        </h1>
        <p className="mt-4 text-muted-foreground max-w-xl">Have a project in mind? Fill the call sheet and I'll reply within 24h.</p>

        <div className="mt-10 surface p-6 md:p-10">
          <form onSubmit={submit} className="grid gap-5">
            <Field label="01 · Client Name">
              <input className="field w-full text-sm" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
            </Field>
            <Field label="02 · Email Channel">
              <input className="field w-full text-sm" placeholder="you@studio.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} />
            </Field>
            <Field label="03 · Project Brief">
              <textarea className="field w-full text-sm min-h-40" placeholder="Scope, timeline, references…" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={2000} />
            </Field>
            <div className="flex items-center justify-between border-t border-border pt-5">
              <span className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">TAKE_01</span>
              <button type="submit" disabled={loading} className="btn-primary inline-flex items-center gap-2">
                <Send className="h-4 w-4" /> {loading ? "Rolling…" : "Send Brief"}
              </button>
            </div>
          </form>

          {(socials.data ?? []).length > 0 && (
            <div className="mt-10 border-t border-border pt-6">
              <p className="mono text-[10px] uppercase tracking-[0.22em] text-teal">// OTHER CHANNELS</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {socials.data!.map((s) => (
                  <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
                    className="mono inline-flex items-center gap-2 border border-border px-3 py-2 text-xs uppercase tracking-wider hover:border-accent hover:text-accent transition">
                    <SocialIcon name={s.icon_name} />
                    <span>{s.platform_name}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
