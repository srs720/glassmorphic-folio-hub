CREATE OR REPLACE FUNCTION public.is_public_asset(_path text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.blog_posts WHERE cover_path = _path)
    OR EXISTS (SELECT 1 FROM public.certificates WHERE image_path = _path)
    OR EXISTS (SELECT 1 FROM public.hobbies WHERE image_path = _path)
    OR EXISTS (SELECT 1 FROM public.people WHERE image_path = _path)
    OR EXISTS (SELECT 1 FROM public.testimonials WHERE avatar_path = _path)
    OR EXISTS (SELECT 1 FROM public.site_settings WHERE _path IN (avatar_path, hero_image_path, logo_path, resume_path) OR _path = ANY(slider_images))
$$;
GRANT EXECUTE ON FUNCTION public.is_public_asset(text) TO anon, authenticated;
DROP POLICY IF EXISTS "Public read portfolio assets" ON storage.objects;
CREATE POLICY "Read published portfolio assets" ON storage.objects FOR SELECT
  USING (bucket_id = 'portfolio-assets' AND (public.is_public_asset(name) OR public.has_role(auth.uid(), 'admin')));