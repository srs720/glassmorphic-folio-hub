import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Mail, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";
import { ContactLinks } from "@/components/ContactLinks";
import { useLang } from "@/lib/i18n";

const CANONICAL = "https://shoiburrahman.com";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Shoibur Rahman" },
      { name: "description", content: "Drop Shoibur Rahman a note — questions, hellos, or collaboration ideas." },
      { property: "og:title", content: "Contact — Shoibur Rahman" },
      { property: "og:description", content: "Say hello to Shoibur Rahman." },
      { property: "og:url", content: `${CANONICAL}/contact` },
    ],
    links: [{ rel: "canonical", href: `${CANONICAL}/contact` }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { t } = useLang();
  const socials = useSocials();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error(t("fill_all"));
      return;
    }
    setSending(true);
    const { error } = await supabase.from("messages").insert({ name, email, message });
    setSending(false);
    if (error) {
      toast.error(t("send_error"));
      return;
    }
    toast.success(t("send_ok"));
    setName(""); setEmail(""); setMessage("");
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-4 md:px-6 pt-10 md:pt-16">
        <p className="label-mono">{t("say_hello")}</p>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl md:text-6xl">{t("lets_talk")}</h1>

        <div className="mt-10 grid gap-5 md:grid-cols-5">
          <form onSubmit={submit} className="bento p-6 md:p-8 md:col-span-3 grid gap-4">
            <div>
              <label className="label-mono">{t("your_name")}</label>
              <input className="field mt-2" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("name_placeholder")} />
            </div>
            <div>
              <label className="label-mono">{t("your_email")}</label>
              <input type="email" className="field mt-2" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div>
              <label className="label-mono">{t("message")}</label>
              <textarea className="field mt-2 min-h-[140px]" value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t("msg_placeholder")} />
            </div>
            <div>
              <button disabled={sending} className="btn-primary">
                {sending ? t("sending") : (<>{t("send_message")} <Send className="h-4 w-4" /></>)}
              </button>
            </div>
          </form>

          <div className="md:col-span-2 grid gap-4 content-start">
            <div className="bento-blue p-6">
              <Mail className="h-5 w-5" />
              <p className="mt-3 font-display text-xl">{t("prefer_other")}</p>
              <p className="text-sm text-foreground/80 mt-2">{t("channels_note")}</p>
            </div>
            <div className="bento p-6">
              <p className="label-mono">{t("find_me_at")}</p>
              <ContactLinks className="mt-3" />
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
