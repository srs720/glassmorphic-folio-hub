import { defineTool } from "@lovable.dev/mcp-js";
import { errorResult, jsonResult, supabaseAnon } from "../supabase";

export default defineTool({
  name: "list_certificates",
  title: "List certificates",
  description: "List the public certificates and achievements, with issuer and issue date, bilingual.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const { data, error } = await supabaseAnon()
      .from("certificates")
      .select("title, title_bn, issuer, issuer_bn, description, description_bn, issued_on")
      .order("sort_order");
    if (error) return errorResult(error.message);
    return jsonResult(data ?? []);
  },
});
