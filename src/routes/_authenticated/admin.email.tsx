import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/email")({
  component: EmailSettingsAdmin,
});

function EmailSettingsAdmin() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["email_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("email_settings").select("*").limit(1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [sender, setSender] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!q.data) return;
    setSender(q.data.sender_email ?? "");
    setPassword(q.data.app_password ?? "");
  }, [q.data]);

  async function save(e: FormEvent) {
    e.preventDefault();
    const email = sender.trim();
    const pass = password.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error("Enter a valid sender email."); return; }
    if (pass.length < 8) { toast.error("Enter the app password."); return; }
    setSaving(true);
    const { error } = q.data?.id
      ? await supabase.from("email_settings").update({ sender_email: email, app_password: pass }).eq("id", q.data.id)
      : await supabase.from("email_settings").insert({ sender_email: email, app_password: pass });
    setSaving(false);
    if (error) { toast.error("Couldn't save email settings."); return; }
    toast.success("Email settings saved");
    qc.invalidateQueries({ queryKey: ["email_settings"] });
  }

  return (
    <form onSubmit={save} className="bento p-5 md:p-7 grid gap-4 max-w-2xl">
      <div>
        <h2 className="font-display text-2xl">Email Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Used to send the 6-digit CV access codes. Use a Gmail address and a Google app password (not your normal password).
        </p>
      </div>
      <div>
        <label className="label-mono" htmlFor="sender_email">Sender email</label>
        <input id="sender_email" type="email" className="field mt-2" maxLength={255}
          placeholder="info.shoiburrahman@gmail.com" value={sender} onChange={(e) => setSender(e.target.value)} />
      </div>
      <div>
        <label className="label-mono" htmlFor="app_password">App password</label>
        <input id="app_password" type="password" className="field mt-2" maxLength={255} autoComplete="new-password"
          placeholder="xxxx xxxx xxxx xxxx" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div>
        <button disabled={saving} className="btn-primary">
          {saving ? "Saving..." : (<>Save <Save className="h-4 w-4" /></>)}
        </button>
      </div>
    </form>
  );
}
