UPDATE public.site_settings s
SET slider_images = COALESCE((
  SELECT array_agg(p) FROM unnest(s.slider_images) AS p
  WHERE EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'portfolio-assets' AND o.name = p)
), '{}');