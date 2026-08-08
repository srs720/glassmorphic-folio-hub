/** Helpers shared by the public post pages and the admin editor. */

export function stripHtml(html: string): string {
  return (html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export function wordCount(html: string): number {
  const text = stripHtml(html);
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

/** Reading time in whole minutes (minimum 1) at ~200 words per minute. */
export function readingMinutes(html: string): number {
  return Math.max(1, Math.round(wordCount(html) / 200));
}

export function parseTags(input: string): string[] {
  return Array.from(
    new Set(
      input
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 12),
    ),
  );
}

/** Rank other posts by how many tags they share with the current post. */
export function relatedByTags<T extends { id: string; tags?: string[] | null }>(
  current: T,
  all: T[],
  limit = 3,
): T[] {
  const own = new Set((current.tags ?? []).map((t) => t.toLowerCase()));
  return all
    .filter((p) => p.id !== current.id)
    .map((p) => ({
      post: p,
      score: (p.tags ?? []).filter((t) => own.has(t.toLowerCase())).length,
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.post);
}
