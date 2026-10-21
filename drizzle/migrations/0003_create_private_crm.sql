CREATE TABLE public.crm_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_bn text,
  slug text NOT NULL,
  relation text,
  relation_bn text,
  dob date,
  hobbies text,
  hobbies_bn text,
  bio text,
  bio_bn text,
  photo_path text,
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_profiles TO authenticated;
GRANT ALL ON public.crm_profiles TO service_role;
ALTER TABLE public.crm_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage CRM profiles" ON public.crm_profiles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE UNIQUE INDEX crm_profiles_slug_lower_unique ON public.crm_profiles (lower(slug));
CREATE INDEX crm_profiles_public_dob_idx ON public.crm_profiles (dob) WHERE is_public = true;
CREATE TRIGGER crm_profiles_set_updated_at BEFORE UPDATE ON public.crm_profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.crm_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  title_bn text,
  description text,
  description_bn text,
  event_date date NOT NULL,
  event_time time,
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_events TO authenticated;
GRANT ALL ON public.crm_events TO service_role;
ALTER TABLE public.crm_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage CRM events" ON public.crm_events FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE INDEX crm_events_public_date_idx ON public.crm_events (event_date) WHERE is_public = true;
CREATE TRIGGER crm_events_set_updated_at BEFORE UPDATE ON public.crm_events FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.get_public_crm_profile(_slug text)
RETURNS TABLE (
  id uuid,
  name text,
  name_bn text,
  slug text,
  relation text,
  relation_bn text,
  dob date,
  hobbies text,
  hobbies_bn text,
  bio text,
  bio_bn text,
  photo_path text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.name, p.name_bn, p.slug, p.relation, p.relation_bn,
         p.dob, p.hobbies, p.hobbies_bn, p.bio, p.bio_bn, p.photo_path
  FROM public.crm_profiles AS p
  WHERE p.is_public = true AND lower(p.slug) = lower(btrim(_slug))
  LIMIT 1
$$;
REVOKE ALL ON FUNCTION public.get_public_crm_profile(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_crm_profile(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_public_crm_calendar()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH local_day AS (
    SELECT (now() AT TIME ZONE 'Asia/Dhaka')::date AS day
  )
  SELECT jsonb_build_object(
    'today', local_day.day,
    'birthdays', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', p.id, 'name', p.name, 'name_bn', p.name_bn, 'slug', p.slug,
        'relation', p.relation, 'relation_bn', p.relation_bn, 'photo_path', p.photo_path
      ) ORDER BY p.name)
      FROM public.crm_profiles AS p, local_day
      WHERE p.is_public = true AND p.dob IS NOT NULL
        AND to_char(p.dob, 'MM-DD') = to_char(local_day.day, 'MM-DD')
    ), '[]'::jsonb),
    'events', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', e.id, 'title', e.title, 'title_bn', e.title_bn,
        'description', e.description, 'description_bn', e.description_bn,
        'event_date', e.event_date, 'event_time', e.event_time
      ) ORDER BY e.event_time NULLS FIRST, e.title)
      FROM public.crm_events AS e, local_day
      WHERE e.is_public = true AND e.event_date = local_day.day
    ), '[]'::jsonb)
  )
  FROM local_day
$$;
REVOKE ALL ON FUNCTION public.get_public_crm_calendar() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_crm_calendar() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.is_public_asset(_path text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.blog_posts WHERE cover_path = _path)
    OR EXISTS (SELECT 1 FROM public.certificates WHERE image_path = _path)
    OR EXISTS (SELECT 1 FROM public.hobbies WHERE image_path = _path)
    OR EXISTS (SELECT 1 FROM public.people WHERE image_path = _path)
    OR EXISTS (SELECT 1 FROM public.testimonials WHERE avatar_path = _path)
    OR EXISTS (SELECT 1 FROM public.site_settings WHERE _path IN (avatar_path, hero_image_path, logo_path, resume_path) OR _path = ANY(slider_images))
    OR EXISTS (SELECT 1 FROM public.crm_profiles WHERE is_public = true AND photo_path = _path)
$$;
