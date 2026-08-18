import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, jsonResult, supabaseAnon } from "../supabase";

export default defineTool({
  name: "list_diary",
  title: "List diary sections",
  description:
    "List public diary content by section: `people` (family and friends), `hobbies` (hobbies and memories) or `quotes` (thoughts and quotes).",
  inputSchema: {
    section: z.enum(["people", "hobbies", "quotes"]).describe("Which diary section to read."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ section }) => {
    const columns = {
      people: "category, name, name_bn, relation, relation_bn, note, note_bn",
      hobbies: "title, title_bn, description, description_bn",
      quotes: "text, text_bn, author, author_bn",
    }[section];

    const { data, error } = await supabaseAnon().from(section).select(columns).order("sort_order");
    if (error) return errorResult(error.message);
    return jsonResult(data ?? []);
  },
});
