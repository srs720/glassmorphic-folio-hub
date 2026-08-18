import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, jsonResult, supabaseAnon } from "../supabase";

export default defineTool({
  name: "list_posts",
  title: "List published articles",
  description:
    "List published research articles and blog posts with title, slug, excerpt, tags and publish date. Optionally filter by a search term or tag.",
  inputSchema: {
    search: z.string().trim().max(120).optional().describe("Optional text to match in the title."),
    tag: z.string().trim().max(60).optional().describe("Optional tag to filter by."),
    limit: z.number().int().min(1).max(50).default(20).describe("Maximum number of articles to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ search, tag, limit }) => {
    let query = supabaseAnon()
      .from("blog_posts")
      .select("title, title_bn, slug, excerpt, excerpt_bn, tags, published_at")
      .order("published_at", { ascending: false })
      .limit(limit ?? 20);

    if (search) query = query.ilike("title", `%${search}%`);
    if (tag) query = query.contains("tags", [tag]);

    const { data, error } = await query;
    if (error) return errorResult(error.message);
    return jsonResult(data ?? []);
  },
});
