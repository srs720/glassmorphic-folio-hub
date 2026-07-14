
ALTER FUNCTION public.set_updated_at() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM public, anon, authenticated;

-- Storage policies for the private bucket: public read, admin write
CREATE POLICY "Public read portfolio assets" ON storage.objects FOR SELECT USING (bucket_id = 'portfolio-assets');
CREATE POLICY "Admins upload portfolio assets" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'portfolio-assets' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update portfolio assets" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'portfolio-assets' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete portfolio assets" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'portfolio-assets' AND public.has_role(auth.uid(), 'admin'));
