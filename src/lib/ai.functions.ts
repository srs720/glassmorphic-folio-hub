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


/** Public: answer any question about the whole site using the full public DB + admin knowledge base. */
export const askSite = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
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

    const [settings, education, people, hobbies, quotes, certificates, posts] = await Promise.all([
      client.from("site_settings").select("*").limit(1).maybeSingle(),
      client.from("education_entries").select("kind, title, title_bn, institution, institution_bn, period, description, description_bn").order("sort_order"),
      client.from("people").select("category, name, name_bn, relation, relation_bn, note, note_bn").order("sort_order"),
      client.from("hobbies").select("title, title_bn, description, description_bn").order("sort_order"),
      client.from("quotes").select("text, text_bn, author, author_bn").order("sort_order"),
      client.from("certificates").select("title, title_bn, issuer, issuer_bn, description, issued_on").order("sort_order"),
      client.from("blog_posts").select("title, title_bn, slug, excerpt, excerpt_bn, content, content_bn, tags").order("published_at", { ascending: false }).limit(20),
    ]);

    // Private facts the admin curates — never rendered publicly, but usable by the assistant.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: kb } = await supabaseAdmin
      .from("ai_knowledge_base")
      .select("topic, content")
      .order("sort_order");

    const { stripHtml } = await import("@/lib/post-utils");
    const { chatComplete } = await import("@/lib/ai-gateway.server");

    const s: any = settings.data ?? {};
    const lines: string[] = [];
    lines.push(`PROFILE:\nName: ${s.name ?? ""} / ${s.name_bn ?? ""}\nTagline: ${s.tagline ?? ""} ${s.tagline_bn ?? ""}\nBio: ${stripHtml(String(s.bio ?? ""))}\nBio (BN): ${stripHtml(String(s.bio_bn ?? ""))}\nLocation: ${s.location ?? ""}\nEmail: ${s.contact_email ?? ""}\nPhone: ${s.phone ?? ""}`);

    const push = (label: string, rows: any[] | null | undefined, fmt: (r: any) => string) => {
      if (rows && rows.length) lines.push(`${label}:\n` + rows.map((r) => `- ${fmt(r)}`).join("\n"));
    };
    push("EDUCATION", education.data, (r) => `[${r.kind}] ${r.title} / ${r.title_bn ?? ""} — ${r.institution ?? ""} (${r.period ?? ""}) ${r.description ?? ""}`);
    push("PEOPLE", people.data, (r) => `[${r.category}] ${r.name} / ${r.name_bn ?? ""} — ${r.relation ?? ""} ${r.note ?? ""}`);
    push("HOBBIES & MEMORIES", hobbies.data, (r) => `${r.title} / ${r.title_bn ?? ""} — ${r.description ?? ""}`);
    push("QUOTES", quotes.data, (r) => `"${r.text}" — ${r.author ?? ""}`);
    push("CERTIFICATES", certificates.data, (r) => `${r.title} — ${r.issuer ?? ""} (${r.issued_on ?? ""}) ${r.description ?? ""}`);
    push("ARTICLES", posts.data, (r) => `${r.title} (/post/${r.slug}) tags: ${(r.tags ?? []).join(", ")} — ${stripHtml(String(r.excerpt ?? r.content ?? "")).slice(0, 400)}`);
    push("PRIVATE KNOWLEDGE BASE (admin-provided facts, treat as authoritative)", kb, (r) => `${r.topic}: ${r.content}`);

    const context = lines.join("\n\n").slice(0, 24000);
    const language = data.locale === "bn" ? "Bengali (Bangla)" : "English";

    const answer = await chatComplete(
      [
        {
          role: "system",
          content:
            `You are the personal AI assistant for Shoibur Rahman's website. Answer in ${language}. ` +
            `Use ONLY the site data below — never outside knowledge, never speculation. If the answer is ` +
            `not in the data, say so plainly in ${language}. Be warm, concise (under 130 words).\n\n` +
            `SITE DATA:\n${context}`,
        },
        { role: "user", content: data.question },
      ],
      600,
    );

    return { answer: answer || "I couldn't find that on this site." };
  });
