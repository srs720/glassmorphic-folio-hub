-- Bengali columns
ALTER TABLE public.education_entries
  ADD COLUMN IF NOT EXISTS title_bn text,
  ADD COLUMN IF NOT EXISTS institution_bn text,
  ADD COLUMN IF NOT EXISTS period_bn text,
  ADD COLUMN IF NOT EXISTS description_bn text;

ALTER TABLE public.people
  ADD COLUMN IF NOT EXISTS name_bn text,
  ADD COLUMN IF NOT EXISTS relation_bn text,
  ADD COLUMN IF NOT EXISTS note_bn text;

ALTER TABLE public.hobbies
  ADD COLUMN IF NOT EXISTS title_bn text,
  ADD COLUMN IF NOT EXISTS description_bn text;

ALTER TABLE public.memories
  ADD COLUMN IF NOT EXISTS title_bn text,
  ADD COLUMN IF NOT EXISTS location_bn text,
  ADD COLUMN IF NOT EXISTS story_bn text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS description_bn text;

ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS text_bn text,
  ADD COLUMN IF NOT EXISTS author_bn text,
  ADD COLUMN IF NOT EXISTS category_bn text;

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS name_bn text,
  ADD COLUMN IF NOT EXISTS bio_bn text,
  ADD COLUMN IF NOT EXISTS tagline_bn text,
  ADD COLUMN IF NOT EXISTS greeting_bn text,
  ADD COLUMN IF NOT EXISTS identity_line_bn text;

ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS title_bn text,
  ADD COLUMN IF NOT EXISTS excerpt_bn text,
  ADD COLUMN IF NOT EXISTS content_bn text,
  ADD COLUMN IF NOT EXISTS seo_title_bn text,
  ADD COLUMN IF NOT EXISTS seo_description_bn text,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS blog_posts_slug_key ON public.blog_posts (slug);

-- Certificates
CREATE TABLE IF NOT EXISTS public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  title_bn text,
  issuer text,
  issuer_bn text,
  description text,
  description_bn text,
  image_path text,
  issued_on date,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.certificates TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.certificates TO authenticated;
GRANT ALL ON public.certificates TO service_role;

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read certificates" ON public.certificates
  FOR SELECT USING (true);
CREATE POLICY "admin write certificates" ON public.certificates
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER certificates_set_updated_at
  BEFORE UPDATE ON public.certificates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Remove Food Diary
DROP TABLE IF EXISTS public.foods;