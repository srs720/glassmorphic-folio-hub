import { createFileRoute } from "@tanstack/react-router";

/**
 * Daily midnight (Asia/Dhaka) CRM reminder callback, triggered by pg_cron.
 * Bearer = publishable key (stray-traffic filter only). Idempotent via
 * crm_reminder_runs: the day marker is written only after a successful send,
 * so a failure leaves the day free for a retry.
 */
export const Route = createFileRoute("/api/public/hooks/crm-reminders")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const bearer = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
        if (!bearer || bearer !== process.env["SUPABASE_PUBLISHABLE_KEY"]) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        try {
          const [{ supabaseAdmin }, { sendTelegramMessage }] = await Promise.all([
            import("@/integrations/supabase/client.server"),
            import("@/lib/telegram.server"),
          ]);
          const { data, error } = await (supabaseAdmin.rpc as any)("get_crm_reminder_digest");
          if (error) throw new Error(error.message);
          const digest = (data ?? { today: null, birthdays: [], events: [] }) as {
            today: string | null;
            birthdays: Array<{ name: string; relation: string | null; is_public: boolean }>;
            events: Array<{ title: string; event_time: string | null; is_public: boolean }>;
          };
          const lines: string[] = [`⏰ *Daily Reminder* — ${digest.today ?? ""} (Asia/Dhaka)`];
          if (digest.birthdays.length > 0) {
            lines.push("", "🎂 *Birthdays today*");
            for (const b of digest.birthdays) {
              lines.push(`• ${b.name}${b.relation ? ` (${b.relation})` : ""}${b.is_public ? "" : " 🔒"}`);
            }
          }
          if (digest.events.length > 0) {
            lines.push("", "📅 *Events today*");
            for (const e of digest.events) {
              const time = e.event_time ? `${String(e.event_time).slice(0, 5)} — ` : "";
              lines.push(`• ${time}${e.title}${e.is_public ? "" : " 🔒"}`);
            }
          }
          if (digest.birthdays.length === 0 && digest.events.length === 0) {
            lines.push("", "No reminders for today.");
          }
          await sendTelegramMessage(process.env["TELEGRAM_BOT_TOKEN"], lines.join("\n"));
          const { error: insErr } = await supabaseAdmin
            .from("crm_reminder_runs" as any)
            .insert({ run_date: digest.today });
          if (insErr && insErr.code !== "23505") {
            console.error("Reminder day marker failed:", insErr.message);
          }
          return Response.json({ ok: true });
        } catch (err) {
          console.error("CRM reminder failed", err);
          return Response.json({ error: "Reminder failed" }, { status: 500 });
        }
      },
    },
  },
});
