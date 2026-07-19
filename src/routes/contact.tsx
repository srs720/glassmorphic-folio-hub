import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Mail, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout, useSocials, SocialIcon } from "@/components/SiteLayout";

const CANONICAL = "https://shoiburrahman.com";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Shoibur Rahman" },
      { name: "description", content: "Drop Shoibur Rahman a note — questions, hellos, or collaboration ideas." },
      { property: "og:title", content: "Contact — Shoibur Rahman" },
      { property: "og:description", content: "Say hello." },
      { property: "og:url", content: `${CANONICAL}/contact` },
    ],
    links: [{ rel: "canonical", href: `${CANONICAL}/contact` }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const socials = useSocials();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in every field.");
      return;
    }
    setSending(true);
    const { error } = await supabase.from("messages").insert({ name, email, message });
    setSending(false);
    if (error) {
      toast.error("Couldn't send — please try again.");
      return;
    }
    toast.success("Sent — thanks for saying hello.");
    setName(""); setEmail(""); setMessage("");
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-4 md:px-6 pt-10 md:pt-16">
        <p className="label-mono">Say hello</p>
        <h1 className="mt-3 font-display text-5xl md:text-6xl">Let's talk.</h1>

        <div className="mt-10 grid gap-5 md:grid-cols-5">
          <form onSubmit={submit} className="bento p-6 md:p-8 md:col-span-3 grid gap-4">
            <div>
              <label className="label-mono">Your name</label>
              <input className="field mt-2" value={name} onChange={(e) => setName(e.target.value)} placeholder="Shoibur's friend" />
            </div>
            <div>
              <label className="label-mono">Your email</label>
              <input type="email" className="field mt-2" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div>
              <label className="label-mono">Message</label>
              <textarea className="field mt-2 min-h-[140px]" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Say hi, share thoughts, or ask anything." />
            </div>
            <div>
              <button disabled={sending} className="btn-primary">
                {sending ? "Sending..." : (<>Send message <Send className="h-4 w-4" /></>)}
              </button>
            </div>
          </form>

          <div className="md:col-span-2 grid gap-4 content-start">
            <div className="bento-blue p-6">
              <Mail className="h-5 w-5" />
              <p className="mt-3 font-display text-xl">Prefer another way?</p>
              <p className="text-sm text-foreground/80 mt-2">Use any of the channels below — I read them all.</p>
            </div>
            <div className="bento p-6">
              <p className="label-mono">Find me at</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(socials.data ?? []).map((s) => (
                  <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="chip hover:bg-surface-2">
                    <SocialIcon name={s.icon_name} />
                    <span>{s.platform_name}</span>
                  </a>
                ))}
                {(socials.data ?? []).length === 0 && <span className="text-sm text-muted-foreground">Coming soon.</span>}
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
