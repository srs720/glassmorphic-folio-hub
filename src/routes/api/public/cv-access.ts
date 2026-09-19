import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/api/public/cv-access")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { verifyCvAccessGrant } = await import("@/lib/cv.server");
        const token = request.headers.get("cookie")
          ?.split(";")
          .map((part) => part.trim())
          .find((part) => part.startsWith("cv_access="))
          ?.slice("cv_access=".length);
        const email = verifyCvAccessGrant(token);
        if (!email) return Response.json({ error: "CV access verification is required." }, { status: 401 });

        const { data: req } = await supabaseAdmin
          .from("cv_requests")
          .select("status, user_name")
          .eq("user_email", email)
          .maybeSingle();

        if (!req) return Response.json({ error: "No request found for this email." }, { status: 404 });
        if (req.status !== "approved")
          return Response.json({ error: "Your request is not approved yet.", status: req.status }, { status: 403 });

        const [{ data: cv }, { data: settings }, { data: education }] = await Promise.all([
          supabaseAdmin
            .from("cv_content")
            .select("professional_summary, skills, languages, contact_phone, contact_address")
            .limit(1)
            .maybeSingle(),
          supabaseAdmin
            .from("site_settings")
            .select("name, tagline, bio, contact_email, phone, location, linkedin_url, github_url, avatar_path")
            .limit(1)
            .maybeSingle(),
          supabaseAdmin
            .from("education_entries")
            .select("id, kind, title, institution, period, description")
            .order("sort_order")
            .order("created_at"),
        ]);

        return Response.json({
          ok: true,
          viewerEmail: email,
          viewerName: req.user_name,
          cv: cv ?? null,
          profile: settings ?? null,
          education: education ?? [],
        });
      },
    },
  },
});
