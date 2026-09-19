import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  purpose: z.string().trim().min(3).max(600),
});

export const Route = createFileRoute("/api/public/request-cv")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let parsed;
        try {
          parsed = schema.parse(await request.json());
        } catch {
          return Response.json({ error: "Please fill in every field correctly." }, { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { generateOtp, normalizeEmail, sendOtpEmail } = await import("@/lib/cv.server");

        const email = normalizeEmail(parsed.email);
        const otp = generateOtp();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString();

        const { data: existing } = await supabaseAdmin
          .from("cv_requests")
          .select("id, status")
          .eq("user_email", email)
          .maybeSingle();

        const row = {
          user_name: parsed.name,
          user_email: email,
          purpose: parsed.purpose,
          otp,
          otp_expiry: otpExpiry,
          status: existing?.status === "approved" ? "approved" as const : "unverified" as const,
        };

        const { error } = existing
          ? await supabaseAdmin.from("cv_requests").update(row).eq("id", existing.id)
          : await supabaseAdmin.from("cv_requests").insert(row);

        if (error) {
          return Response.json({ error: "Could not save your request. Try again." }, { status: 500 });
        }

        try {
          await sendOtpEmail(email, parsed.name, otp);
        } catch (err) {
          console.error("[request-cv] email failed", err);
          return Response.json(
            { error: "We couldn't send the verification email right now. Please try again later." },
            { status: 502 },
          );
        }

        return Response.json({
          ok: true,
          message: existing?.status === "approved"
            ? "We emailed you a fresh 6-digit code to open the CV."
            : "We emailed you a 6-digit code.",
        });
      },
    },
  },
});
