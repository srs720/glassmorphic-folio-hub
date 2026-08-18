import { defineTool } from "@lovable.dev/mcp-js";
import { errorResult, jsonResult, supabaseAnon } from "../supabase";

export default defineTool({
  name: "list_education",
  title: "List education",
  description: "List the public education and academic journey entries, bilingual (English and Bengali).",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const { data, error } = await supabaseAnon()
      .from("education_entries")
      .select("kind, title, title_bn, institution, institution_bn, period, description, description_bn")
      .order("sort_order");
    if (error) return errorResult(error.message);
    return jsonResult(data ?? []);
  },
});
