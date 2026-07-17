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
      { name: "description", content: "Get in touch with Shoibur Rahman for web development, logo design, or promotional video editing projects. Send a message or connect on social." },
      { property: "og:title", content: "Contact — Shoibur Rahman" },
      { property: "og:description", content: "Get in touch with Shoibur Rahman for web development, logo design, or promotional video editing projects. Send a message or connect on social." },
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
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in every field.");
      return;
    }
    if (name.length > 100 || email.length > 255 || message.length > 2000) {
      toast.error("Input too long.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("messages").insert({
      name: name.trim(), email: email.trim(), message: message.trim(),
    });
    setLoading(false);
    if (error) { toast.error("Failed to send. Try again."); return; }
    toast.success("Message sent — thanks!");
    setName(""); setEmail(""); setMessage("");
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-4 pt-12 pb-20">
        <div className="glass-strong p-8 md:p-10">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">Contact</p>
          <h1 className="text-4xl font-bold">Let's talk</h1>
          <p className="mt-2 text-muted-foreground">Have a project in mind? Send a message and I'll reply soon.</p>

          <form onSubmit={submit} className="mt-6 grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <input className="glass-input px-4 py-2.5 text-sm" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
              <input className="glass-input px-4 py-2.5 text-sm" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} />
            </div>
            <textarea className="glass-input px-4 py-2.5 text-sm min-h-32" placeholder="Your message" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={2000} />
            <button type="submit" disabled={loading} className="btn-primary inline-flex items-center justify-center gap-2 self-start">
              <Send className="h-4 w-4" /> {loading ? "Sending…" : "Send message"}
            </button>
          </form>

          {(socials.data ?? []).length > 0 && (
            <div className="mt-8">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3">Or reach me on</p>
              <div className="flex flex-wrap gap-2">
                {socials.data!.map((s) => (
                  <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
                    className="glass inline-flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/70 transition">
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
