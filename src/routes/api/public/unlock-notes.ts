import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const schema = z.object({ passkey: z.string().trim().min(1).max(200) });

export const Route = createFileRoute("/api/public/unlock-notes")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let parsed;
        try {
          parsed = schema.parse(await request.json());
        } catch {
          return Response.json({ error: "Enter a passkey." }, { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin
          .from("secret_notes")
          .select("id, title, content, created_at")
          .eq("passkey", parsed.passkey)
          .order("sort_order")
          .order("created_at", { ascending: false });

        if (error) {
          return Response.json({ error: "Something went wrong. Try again." }, { status: 500 });
        }
        if (!data || data.length === 0) {
          return Response.json({ error: "No notes found for this passkey." }, { status: 404 });
        }
        return Response.json({ ok: true, notes: data });
      },
    },
  },
});
