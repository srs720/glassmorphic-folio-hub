import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, jsonResult, supabaseAnon } from "../supabase";
import { stripHtml } from "@/lib/post-utils";

export default defineTool({
  name: "get_post",
  title: "Read an article",
  description: "Read the full text of one published article by its slug, in English and Bengali when available.",
  inputSchema: { slug: z.string().trim().min(1).max(120).describe("The article slug, e.g. `my-article`.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ slug }) => {
    const { data, error } = await supabaseAnon()
      .from("blog_posts")
      .select("title, title_bn, slug, excerpt, excerpt_bn, content, content_bn, tags, published_at")
      .eq("slug", slug)
      .maybeSingle();
    if (error) return errorResult(error.message);
    if (!data) return errorResult(`No published article found with slug "${slug}".`);

    return jsonResult({
      ...data,
      content: stripHtml(String(data.content ?? "")),
      content_bn: stripHtml(String(data.content_bn ?? "")),
      url: `https://shoiburrahman.com/post/${data.slug}`,
    });
  },
});
