import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const schema = z.object({
  email: z.string().trim().email().max(255),
  otp: z.string().trim().regex(/^\d{6}$/),
});

export const Route = createFileRoute("/api/public/verify-otp")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let parsed;
        try {
          parsed = schema.parse(await request.json());
        } catch {
          return Response.json({ error: "Enter the 6-digit code." }, { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { createCvAccessGrant, cvGrantCookie, normalizeEmail } = await import("@/lib/cv.server");
        const email = normalizeEmail(parsed.email);

        const { data: row } = await supabaseAdmin
          .from("cv_requests")
          .select("id, otp, otp_expiry, status")
          .eq("user_email", email)
          .maybeSingle();

        if (!row) return Response.json({ error: "No request found for this email." }, { status: 404 });
        if (row.status === "rejected")
          return Response.json({ error: "This request was declined." }, { status: 403 });
        if (!row.otp || row.otp !== parsed.otp)
          return Response.json({ error: "That code is not correct." }, { status: 400 });
        if (!row.otp_expiry || new Date(row.otp_expiry).getTime() < Date.now())
          return Response.json({ error: "That code has expired. Request a new one." }, { status: 400 });

        const nextStatus = row.status === "approved" ? "approved" : "pending";
        const { error } = await supabaseAdmin
          .from("cv_requests")
          .update({ status: nextStatus, otp: null, otp_expiry: null })
          .eq("id", row.id);

        if (error) return Response.json({ error: "Could not verify right now." }, { status: 500 });

        if (nextStatus === "approved") {
          return Response.json(
            { ok: true, status: "approved", message: "Email verified. Opening the CV." },
            { headers: { "Set-Cookie": cvGrantCookie(createCvAccessGrant(email)) } },
          );
        }
        return Response.json({ ok: true, status: "pending", message: "Email verified. Your request is now waiting for approval." });
      },
    },
  },
});
