import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { askAboutPost } from "@/lib/ai.functions";
import type { Lang } from "@/lib/i18n";
import { T } from "@/lib/i18n";

type Msg = { role: "user" | "assistant"; text: string };

export function PostChat({ slug, lang }: { slug: string; lang: Lang }) {
  const tr = (k: keyof typeof T) => T[k][lang];
  const ask = useServerFn(askAboutPost);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [msgs, busy]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const question = q.trim();
    if (!question || busy) return;
    setQ("");
    setMsgs((m) => [...m, { role: "user", text: question }]);
    setBusy(true);
    try {
      const res = await ask({ data: { slug, question, locale: lang } });
      setMsgs((m) => [...m, { role: "assistant", text: res.answer }]);
    } catch (err: any) {
      setMsgs((m) => [...m, { role: "assistant", text: err?.message || tr("chat_error") }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-white shadow-lg hover:bg-highlight transition"
        >
          <Sparkles className="h-4 w-4" />
          <span className="hidden sm:inline">{tr("chat_open")}</span>
        </button>
      )}

      {open && (
        <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-40 sm:w-[380px] rounded-2xl border border-border bg-white shadow-2xl">
          <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
              <Sparkles className="h-4 w-4 text-primary" /> {tr("chat_title")}
            </p>
            <button type="button" onClick={() => setOpen(false)} aria-label={tr("chat_close")}>
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </header>

          <div className="max-h-[45vh] min-h-[140px] overflow-y-auto px-4 py-3 space-y-3">
            {msgs.length === 0 && (
              <p className="text-sm text-muted-foreground">{tr("chat_hint")}</p>
            )}
            {msgs.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "ml-auto max-w-[85%] rounded-2xl bg-primary px-3 py-2 text-sm text-white"
                    : "mr-auto max-w-[90%] rounded-2xl bg-surface-2 px-3 py-2 text-sm text-foreground"
                }
              >
                {m.text}
              </div>
            ))}
            {busy && (
              <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> {tr("chat_thinking")}
              </p>
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={submit} className="flex items-center gap-2 border-t border-border p-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              maxLength={500}
              placeholder={tr("chat_placeholder")}
              aria-label={tr("chat_placeholder")}
              className="flex-1 rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              type="submit"
              disabled={busy || !q.trim()}
              aria-label={tr("chat_send")}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
