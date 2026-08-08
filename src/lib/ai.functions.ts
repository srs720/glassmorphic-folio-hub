import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Admin-only: draft an SEO meta description from the post body. */
export const generateSeoMeta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        title: z.string(),
        body: z.string(),
        locale: z.enum(["en", "bn"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const { stripHtml } = await import("@/lib/post-utils");
    const { chatComplete } = await import("@/lib/ai-gateway.server");

    const text = stripHtml(data.body).slice(0, 6000);
    if (!text) throw new Error("Write some content first.");

    const language = data.locale === "bn" ? "Bengali (Bangla)" : "English";
    const raw = await chatComplete(
      [
        {
          role: "system",
          content:
            `You write SEO meta descriptions in ${language}. Reply with the description only — ` +
            `no quotes, no labels, no markdown. Keep it under 155 characters, factual, and ` +
            `derived strictly from the article text.`,
        },
        { role: "user", content: `Title: ${data.title}\n\nArticle:\n${text}` },
      ],
      200,
    );

    const suggestion = raw.replace(/^["'\s]+|["'\s]+$/g, "").slice(0, 158);
    return { suggestion };
  });

/** Public: answer reader questions strictly from one published article. */
export const askAboutPost = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        slug: z.string().max(120),
        question: z.string().min(2).max(500),
        locale: z.enum(["en", "bn"]),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const client = createClient(process.env["SUPABASE_URL"]!, key, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input: RequestInfo | URL, init?: RequestInit) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });

    const { data: post } = await client
      .from("blog_posts")
      .select("title, title_bn, content, content_bn, excerpt, excerpt_bn")
      .eq("slug", data.slug)
      .maybeSingle();

    if (!post) throw new Error("Article not found.");

    const { stripHtml } = await import("@/lib/post-utils");
    const { chatComplete } = await import("@/lib/ai-gateway.server");

    const en = stripHtml(String(post.content ?? ""));
    const bn = stripHtml(String(post.content_bn ?? ""));
    const article = [en, bn].filter(Boolean).join("\n\n---\n\n").slice(0, 20000);
    if (!article) throw new Error("This article has no readable content yet.");

    const language = data.locale === "bn" ? "Bengali (Bangla)" : "English";
    const answer = await chatComplete(
      [
        {
          role: "system",
          content:
            `You answer questions about one specific article by Shoibur Rahman. Answer in ${language}. ` +
            `Use ONLY the article text below — never outside knowledge, never speculation. If the answer ` +
            `is not in the article, say so plainly in ${language}. Keep answers under 120 words.\n\n` +
            `ARTICLE TITLE: ${post.title}\n\nARTICLE TEXT:\n${article}`,
        },
        { role: "user", content: data.question },
      ],
      500,
    );

    return { answer: answer || "I couldn't find that in this article." };
  });
