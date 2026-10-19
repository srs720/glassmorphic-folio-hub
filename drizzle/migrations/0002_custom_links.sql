CREATE TABLE public.custom_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]{1,64}$'),
  destination_url text NOT NULL CHECK (destination_url ~* '^https?://'),
  clicks integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_links TO authenticated;
GRANT ALL ON public.custom_links TO service_role;
ALTER TABLE public.custom_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage links" ON public.custom_links FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.resolve_custom_link(_slug text)
RETURNS text LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.custom_links SET clicks = clicks + 1
  WHERE slug = lower(trim(_slug)) RETURNING destination_url
$$;
REVOKE ALL ON FUNCTION public.resolve_custom_link(text) FROM public;
GRANT EXECUTE ON FUNCTION public.resolve_custom_link(text) TO anon, authenticated;