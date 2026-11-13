import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { sendTelegramMessage } from "@/lib/telegram.server";

function findUserByEmail(list: { users: Array<{ id: string; email?: string }> } | null, email: string): string | null {
  return list?.users?.find((u) => u.email?.toLowerCase() === email)?.id ?? null;
}

/**
 * Request a password-reset OTP: stores a 6-digit code (10 min validity) and
 * sends it to the site owner's Telegram. Silent success even for unknown
 * emails so accounts cannot be enumerated.
 */
export const requestPasswordOtp = createServerFn({ method: "POST" })
  .validator((data: { email: string }) => z.object({ email: z.string().email().max(200) }).parse(data))
  .handler(async ({ data }) => {
    const email = data.email.trim().toLowerCase();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    const userId = findUserByEmail(list as any, email);
    if (userId) {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      await supabaseAdmin.from("auth_reset_codes" as any).delete().eq("email", email);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      const { error } = await supabaseAdmin
        .from("auth_reset_codes" as any)
        .insert({ email, code, expires_at: expiresAt });
      if (error) throw new Error("Could not create a reset code. Try again.");
      await sendTelegramMessage(
        process.env["TELEGRAM_BOT_TOKEN"],
        `🔐 *Password Reset Code*\nEmail: ${email}\nCode: \`${code}\`\nValid for 10 minutes.`,
      );
    }
    return { ok: true as const };
  });

/** Verify the OTP and update the account password. */
export const resetPasswordWithOtp = createServerFn({ method: "POST" })
  .validator((data: { email: string; code: string; password: string }) =>
    z.object({
      email: z.string().email().max(200),
      code: z.string().regex(/^\d{6}$/),
      password: z.string().min(6).max(100),
    }).parse(data))
  .handler(async ({ data }) => {
    const email = data.email.trim().toLowerCase();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error: fetchErr } = await supabaseAdmin
      .from("auth_reset_codes" as any)
      .select("*")
      .eq("email", email)
      .eq("used", false)
      .order("created_at", { ascending: false })
      .limit(1);
    if (fetchErr) throw new Error("Could not verify the code. Try again.");
    const row = (rows as any[])?.[0];
    if (!row) throw new Error("No reset code found. Request a new one.");
    if (new Date(row.expires_at).getTime() < Date.now()) {
      throw new Error("This code has expired. Request a new one.");
    }
    if (String(row.code).trim() !== data.code.trim()) throw new Error("Incorrect code.");
    const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    const userId = findUserByEmail(list as any, email);
    if (!userId) throw new Error("No account found for this email.");
    const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: data.password,
    });
    if (updateErr) throw new Error("Could not update the password. Try again.");
    await supabaseAdmin.from("auth_reset_codes" as any).update({ used: true }).eq("id", row.id);
    await sendTelegramMessage(process.env["TELEGRAM_BOT_TOKEN"], `✅ Password was reset for ${email}.`);
    return { ok: true as const };
  });
