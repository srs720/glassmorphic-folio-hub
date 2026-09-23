import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { KeyRound, Lock } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Secret Notes | Shoibur Rahman" },
      {
        name: "description",
        content: "Private notes from Shoibur Rahman, unlocked with a passkey shared directly with you.",
      },
      { property: "og:title", content: "Secret Notes | Shoibur Rahman" },
      {
        property: "og:description",
        content: "Enter your passkey to read private notes shared by Shoibur Rahman.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NotesPage,
});

type Note = { id: string; title: string; content: string; created_at: string };

function NotesPage() {
  const [passkey, setPasskey] = useState("");
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function unlock(e: FormEvent) {
    e.preventDefault();
    if (!passkey.trim()) return;
    setBusy(true);
    setMessage("");
    try {
      const { data, error } = await (supabase as any).rpc("notes_by_passkey", { _passkey: passkey.trim() });
      if (error) {
        setNotes(null);
        setMessage(error.message || "Unknown error occurred");
        return;
      }
      const rows = (data ?? []) as Note[];
      if (rows.length === 0) {
        setNotes(null);
        setMessage("No notes found for this passkey.");
        return;
      }
      setNotes(rows);
    } catch (err) {
      setNotes(null);
      setMessage(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-2xl px-4 py-14">
        <div className="bento p-6 md:p-8 grid gap-5 text-center">
          <div className="grid gap-2 justify-items-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-2 text-primary">
              <Lock className="h-5 w-5" />
            </span>
            <p className="label-mono">Private locker</p>
            <h1 className="font-display text-3xl">Secret Notes</h1>
            <p className="text-sm text-muted-foreground max-w-md">
              Enter the passkey you were given to read the notes shared with you.
            </p>
          </div>

          <form onSubmit={unlock} className="grid gap-3 justify-items-center">
            <input
              type="password"
              className="field text-center tracking-widest max-w-sm"
              placeholder="Passkey"
              value={passkey}
              maxLength={200}
              onChange={(e) => setPasskey(e.target.value)}
              aria-label="Passkey"
              required
            />
            <button disabled={busy} className="btn-primary">
              {busy ? "Unlocking..." : (<>Unlock <KeyRound className="h-4 w-4" /></>)}
            </button>
          </form>

          {message && <p className="text-sm text-destructive">{message}</p>}
        </div>

        {notes && notes.length > 0 && (
          <div className="mt-6 grid gap-4">
            {notes.map((n) => (
              <article key={n.id} className="bento p-5 md:p-6 text-left">
                <h2 className="font-display text-2xl">{n.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-foreground/80 whitespace-pre-line">{n.content}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
