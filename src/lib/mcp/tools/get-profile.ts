import { defineTool } from "@lovable.dev/mcp-js";
import { errorResult, jsonResult, supabaseAnon } from "../supabase";

export default defineTool({
  name: "get_profile",
  title: "Get profile",
  description:
    "Get Shoibur Rahman's public profile: name, tagline, bio and location in English and Bengali, plus public contact and social links.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const { data, error } = await supabaseAnon()
      .from("site_settings")
      .select(
        "name, name_bn, tagline, tagline_bn, bio, bio_bn, location, contact_email, phone, facebook_url, youtube_url, linkedin_url, github_url",
      )
      .limit(1)
      .maybeSingle();
    if (error) return errorResult(error.message);
    if (!data) return errorResult("No profile has been published yet.");
    return jsonResult(data);
  },
});
