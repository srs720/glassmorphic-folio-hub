ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}'::text[];

CREATE INDEX IF NOT EXISTS blog_posts_tags_idx ON public.blog_posts USING gin (tags);

DROP POLICY IF EXISTS "Blog public read published" ON public.blog_posts;

CREATE POLICY "Blog public read published"
ON public.blog_posts
FOR SELECT
TO public
USING (
  status = 'published'
  OR (status = 'scheduled' AND published_at IS NOT NULL AND published_at <= now())
);