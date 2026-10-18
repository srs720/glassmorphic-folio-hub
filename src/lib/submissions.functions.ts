import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { notifyTelegram, saveThenNotify } from "./telegram.server";

function publicClient(url: string | undefined, key: string | undefined) {
  if (!url || !key) throw new Error("Submission storage is not configured.");
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
      headers.set("apikey", key);
      return fetch(input, { ...init, headers });
    } },
  });
}

const base = z.object({ name: z.string().trim().min(1).max(100), email: z.string().trim().email().max(255) });

export const submitContact = createServerFn({ method: "POST" })
  .inputValidator(base.extend({ message: z.string().trim().min(1).max(3000) }))
  .handler(async ({ data }) => {
    const sb = publicClient(process.env["SUPABASE_URL"], process.env["SUPABASE_PUBLISHABLE_KEY"]);
    const result = await saveThenNotify(
      async () => await sb.from("messages").insert(data),
      () => notifyTelegram(process.env["TELEGRAM_BOT_TOKEN"], "contact", { ...data, detail: data.message }),
    );
    return { ok: !result.error };
  });

export const submitCvRequest = createServerFn({ method: "POST" })
  .inputValidator(base.extend({ name: z.string().trim().min(2).max(100), purpose: z.string().trim().min(3).max(600) }))
  .handler(async ({ data }) => {
    const sb = publicClient(process.env["SUPABASE_URL"], process.env["SUPABASE_PUBLISHABLE_KEY"]);
    const email = data.email.toLowerCase();
    const { data: existing, error: checkError } = await sb.rpc("check_cv_access", { _email: email });
    if (checkError) return { ok: false, duplicate: false };
    if (Array.isArray(existing) ? existing.length > 0 : Boolean(existing)) return { ok: false, duplicate: true };
    const result = await saveThenNotify(
      async () => await sb.from("cv_requests").insert({ user_name: data.name, user_email: email, purpose: data.purpose }),
      () => notifyTelegram(process.env["TELEGRAM_BOT_TOKEN"], "cv", { name: data.name, email, detail: data.purpose }),
    );
    return { ok: !result.error, duplicate: result.error?.code === "23505" };
  });