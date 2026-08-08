import { supabase } from "@/integrations/supabase/client";
import { relatedByTags } from "@/lib/post-utils";

export type PostRow = {
  id: string;
  slug: string;
  title: string;
  title_bn: string | null;
  excerpt: string;
  excerpt_bn: string | null;
  content: string;
  content_bn: string | null;
  cover_path: string | null;
  tags: string[] | null;
  seo_title: string;
  seo_title_bn: string | null;
  seo_description: string;
  seo_description_bn: string | null;
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string | null;
};

/** Loads a readable post plus tag-related siblings. Returns null when missing. */
export async function loadPostWithRelated(slug: string) {
  const { data } = await supabase.from("blog_posts").select("*").eq("slug", slug).maybeSingle();
  if (!data) return null;
  const post = data as unknown as PostRow;

  const { data: others } = await supabase
    .from("blog_posts")
    .select("id, slug, title, title_bn, excerpt, excerpt_bn, cover_path, tags, published_at, created_at")
    .order("published_at", { ascending: false })
    .limit(50);

  const related = relatedByTags(post, (others ?? []) as any[], 3);
  return { post, related };
}
