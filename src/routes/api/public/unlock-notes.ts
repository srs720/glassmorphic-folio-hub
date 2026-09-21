import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const schema = z.object({ passkey: z.string().trim().min(1).max(200) });

export const Route = createFileRoute("/api/public/unlock-notes")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          let parsed;
          try {
            parsed = schema.parse(await request.json());
          } catch {
            return Response.json({ error: "Enter a passkey." }, { status: 400 });
          }

          if (!process.env["SUPABASE_SERVICE_ROLE_KEY"]) {
            throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY in environment variables.");
          }
          if (!process.env["SUPABASE_URL"]) {
            throw new Error("Missing SUPABASE_URL in environment variables.");
          }

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data: rows, error } = await supabaseAdmin
            .from("secret_notes")
            .select("id, title, content, created_at, passkey")
            .order("sort_order")
            .order("created_at", { ascending: false });

          if (error) {
            return Response.json(
              { error: error.message || "Unknown database error occurred" },
              { status: 500 },
            );
          }

          const input = parsed.passkey.trim();
          const data = (rows ?? [])
            .filter((n) => (n.passkey ?? "").trim() === input)
            .map(({ passkey: _passkey, ...note }) => note);

          if (data.length === 0) {
            return Response.json({ error: "No notes found for this passkey." }, { status: 404 });
          }
          return Response.json({ ok: true, notes: data });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unknown error occurred";
          console.error(err);
          return Response.json({ error: message }, { status: 500 });
        }
      },
    },
  },
});
