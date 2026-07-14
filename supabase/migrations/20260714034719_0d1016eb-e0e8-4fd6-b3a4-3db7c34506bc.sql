
-- Extend site_settings
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS avatar_path text,
  ADD COLUMN IF NOT EXISTS tagline text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS location text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS experience text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS education text NOT NULL DEFAULT '';

-- Extend projects
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS detail_content text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS images text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT true;

-- Extend messages
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false;

-- Skills
CREATE TABLE IF NOT EXISTS public.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.skills TO anon, authenticated;
GRANT ALL ON public.skills TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.skills TO authenticated;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Skills public read" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Admins manage skills" ON public.skills FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Services
CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  icon_name text NOT NULL DEFAULT 'sparkles',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon, authenticated;
GRANT ALL ON public.services TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.services TO authenticated;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Services public read" ON public.services FOR SELECT USING (true);
CREATE POLICY "Admins manage services" ON public.services FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Testimonials
CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name text NOT NULL,
  author_role text NOT NULL DEFAULT '',
  content text NOT NULL,
  avatar_path text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.testimonials TO anon, authenticated;
GRANT ALL ON public.testimonials TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Testimonials public read" ON public.testimonials FOR SELECT USING (true);
CREATE POLICY "Admins manage testimonials" ON public.testimonials FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Blog posts
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  cover_path text,
  status text NOT NULL DEFAULT 'draft',
  seo_title text NOT NULL DEFAULT '',
  seo_description text NOT NULL DEFAULT '',
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blog_posts TO anon, authenticated;
GRANT ALL ON public.blog_posts TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Blog public read published" ON public.blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Admins read all blog" ON public.blog_posts FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins manage blog" ON public.blog_posts FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER blog_posts_set_updated_at BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed site_settings (single row)
INSERT INTO public.site_settings (name, bio, tagline, location, experience, education)
SELECT 'Shoibur Rahman',
  'I am Shoibur Rahman — a passionate developer, designer, and video editor building clean digital products, professional logos, and promotional content that helps brands grow.',
  'Developer • Designer • Video Editor',
  'Bangladesh',
  'Building websites, professional logos, and promotional videos for clients and personal projects.',
  'Class Ten — General Jim'
WHERE NOT EXISTS (SELECT 1 FROM public.site_settings);

UPDATE public.site_settings SET
  name = 'Shoibur Rahman',
  bio = COALESCE(NULLIF(bio, 'Your bio goes here.'), 'I am Shoibur Rahman — a passionate developer, designer, and video editor building clean digital products, professional logos, and promotional content that helps brands grow.'),
  tagline = COALESCE(NULLIF(tagline, ''), 'Developer • Designer • Video Editor'),
  location = COALESCE(NULLIF(location, ''), 'Bangladesh'),
  experience = COALESCE(NULLIF(experience, ''), 'Building websites, professional logos, and promotional videos for clients and personal projects.'),
  education = COALESCE(NULLIF(education, ''), 'Class Ten — General Jim')
WHERE name = 'Your Name' OR name IS NULL OR name = '';

-- Seed skills
INSERT INTO public.skills (name, category, sort_order) VALUES
  ('HTML', 'Web', 1),
  ('CSS', 'Web', 2),
  ('JavaScript', 'Web', 3),
  ('Python', 'Programming', 4),
  ('Database Configuration', 'Backend', 5),
  ('Graphic Design', 'Design', 6),
  ('Professional Logo Creation', 'Design', 7),
  ('Promotional Video Editing', 'Video', 8)
ON CONFLICT DO NOTHING;

-- Seed services
INSERT INTO public.services (title, description, icon_name, sort_order) VALUES
  ('Web Development', 'Modern responsive websites built with HTML, CSS, JavaScript, and Python backends.', 'code', 1),
  ('Logo & Graphic Design', 'Professional logo creation and brand-ready graphic design.', 'palette', 2),
  ('Promotional Video Editing', 'Eye-catching promo edits for products, channels, and campaigns.', 'video', 3),
  ('Database Configuration', 'Reliable database setup, schema design, and configuration.', 'database', 4)
ON CONFLICT DO NOTHING;

-- Seed featured projects
INSERT INTO public.projects (title, description, live_url, tags, detail_content, sort_order, featured)
SELECT 'SRS DIGITAL SHOP', 'A modern e-commerce platform offering digital products with a smooth shopping experience.', '', ARRAY['E-commerce','Web'], 'SRS DIGITAL SHOP is an e-commerce platform designed to sell digital products with a clean, fast, and secure checkout experience.', 1, true
WHERE NOT EXISTS (SELECT 1 FROM public.projects WHERE title = 'SRS DIGITAL SHOP');

INSERT INTO public.projects (title, description, live_url, tags, detail_content, sort_order, featured)
SELECT 'Zero To Decor', 'A video design and digital content channel focused on creative decor concepts.', '', ARRAY['Video','Content'], 'Zero To Decor is a channel dedicated to creative video design and digital decor content, featuring promotional edits and creative concepts.', 2, true
WHERE NOT EXISTS (SELECT 1 FROM public.projects WHERE title = 'Zero To Decor');
