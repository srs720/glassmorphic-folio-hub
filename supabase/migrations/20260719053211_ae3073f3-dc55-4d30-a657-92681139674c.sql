
-- Extend site_settings
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS greeting TEXT,
  ADD COLUMN IF NOT EXISTS hero_image_path TEXT,
  ADD COLUMN IF NOT EXISTS identity_line TEXT;

UPDATE public.site_settings
  SET greeting = COALESCE(greeting, 'Hey, I''m Shoibur.'),
      identity_line = COALESCE(identity_line, 'Student · Web developer · Curious mind');

-- Helper to reduce repetition
-- education_entries
CREATE TABLE IF NOT EXISTS public.education_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL CHECK (kind IN ('past','current','future','certificate')),
  title TEXT NOT NULL,
  institution TEXT,
  period TEXT,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.education_entries TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.education_entries TO authenticated;
GRANT ALL ON public.education_entries TO service_role;
ALTER TABLE public.education_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read education" ON public.education_entries FOR SELECT USING (true);
CREATE POLICY "admin write education" ON public.education_entries FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_education_updated BEFORE UPDATE ON public.education_entries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- people
CREATE TABLE IF NOT EXISTS public.people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('family','friend','teacher')),
  name TEXT NOT NULL,
  relation TEXT,
  note TEXT,
  image_path TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.people TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.people TO authenticated;
GRANT ALL ON public.people TO service_role;
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read people" ON public.people FOR SELECT USING (true);
CREATE POLICY "admin write people" ON public.people FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_people_updated BEFORE UPDATE ON public.people
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- hobbies
CREATE TABLE IF NOT EXISTS public.hobbies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_path TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.hobbies TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.hobbies TO authenticated;
GRANT ALL ON public.hobbies TO service_role;
ALTER TABLE public.hobbies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read hobbies" ON public.hobbies FOR SELECT USING (true);
CREATE POLICY "admin write hobbies" ON public.hobbies FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_hobbies_updated BEFORE UPDATE ON public.hobbies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- memories
CREATE TABLE IF NOT EXISTS public.memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  location TEXT,
  story TEXT,
  image_path TEXT,
  taken_on DATE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.memories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.memories TO authenticated;
GRANT ALL ON public.memories TO service_role;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read memories" ON public.memories FOR SELECT USING (true);
CREATE POLICY "admin write memories" ON public.memories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_memories_updated BEFORE UPDATE ON public.memories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- foods
CREATE TABLE IF NOT EXISTS public.foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cuisine TEXT,
  review TEXT,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  image_path TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.foods TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.foods TO authenticated;
GRANT ALL ON public.foods TO service_role;
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read foods" ON public.foods FOR SELECT USING (true);
CREATE POLICY "admin write foods" ON public.foods FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_foods_updated BEFORE UPDATE ON public.foods
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- quotes
CREATE TABLE IF NOT EXISTS public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  author TEXT,
  category TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.quotes TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.quotes TO authenticated;
GRANT ALL ON public.quotes TO service_role;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read quotes" ON public.quotes FOR SELECT USING (true);
CREATE POLICY "admin write quotes" ON public.quotes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_quotes_updated BEFORE UPDATE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed data
INSERT INTO public.education_entries (kind, title, institution, period, description, sort_order) VALUES
  ('current', '10th Grade', 'General Jim', 'Batch 2026', 'Currently pursuing my Secondary School Certificate.', 10),
  ('past', '9th Grade', 'General Jim', '2024 - 2025', 'Foundational secondary schooling.', 20),
  ('future', 'Higher Secondary (Science)', 'To be decided', '2026 onward', 'Planning to continue in the science stream with focus on computer science.', 30),
  ('certificate', 'Self-taught Web Development', 'Online courses & projects', 'Ongoing', 'HTML, CSS, JavaScript, Python and database work.', 40);

INSERT INTO public.people (category, name, relation, note, sort_order) VALUES
  ('family', 'Rafiqul Islam', 'Father', 'My first teacher and the reason I keep pushing forward.', 10),
  ('family', 'Younger Brother', 'Brother', 'My built-in best friend.', 20),
  ('teacher', 'Favorite Teacher', 'Mentor at General Jim', 'Guides me both academically and personally.', 30),
  ('friend', 'Close Friend', 'Classmate', 'The one who makes school days lighter.', 40);

INSERT INTO public.hobbies (title, description, sort_order) VALUES
  ('Building PCs', 'I love picking parts, benchmarking, and putting new rigs together.', 10),
  ('Web Tinkering', 'Late-night coding sessions on small side projects.', 20),
  ('Traveling', 'Short trips around Bangladesh, camera in hand.', 30);

INSERT INTO public.memories (title, location, story, sort_order) VALUES
  ('Gazipur Safari Park', 'Gazipur, Bangladesh', 'One of my favorite day trips — lions, deer, and a lot of laughter with family.', 10);

INSERT INTO public.foods (name, cuisine, review, rating, sort_order) VALUES
  ('Pizza', 'Italian', 'Cheesy, crispy, comforting — a forever favorite.', 5, 10),
  ('Pasta', 'Italian', 'Simple, warm, endlessly customizable.', 4, 20),
  ('Indian Cuisine', 'Indian', 'Rich spices, deep flavors — biryani especially.', 5, 30);

INSERT INTO public.quotes (text, author, category, sort_order) VALUES
  ('Small steps every day beat perfect plans on paper.', 'Shoibur Rahman', 'life', 10),
  ('Learn in public, ship in private, iterate always.', 'Shoibur Rahman', 'work', 20),
  ('Family first. Everything else is negotiable.', 'Shoibur Rahman', 'life', 30);
