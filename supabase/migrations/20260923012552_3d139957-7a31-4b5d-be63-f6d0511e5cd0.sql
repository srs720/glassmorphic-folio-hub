ALTER TABLE public.cv_requests ADD COLUMN IF NOT EXISTS expires_at timestamptz;
ALTER TABLE public.cv_requests ALTER COLUMN status SET DEFAULT 'pending'::cv_request_status;
UPDATE public.cv_requests SET status = 'pending' WHERE status = 'unverified';

GRANT INSERT ON public.cv_requests TO anon;

DROP POLICY IF EXISTS "Anyone can request cv access" ON public.cv_requests;
CREATE POLICY "Anyone can request cv access" ON public.cv_requests
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.check_cv_access(_email text)
RETURNS TABLE (status text, expires_at timestamptz, user_name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.status::text, r.expires_at, r.user_name
  FROM public.cv_requests r
  WHERE lower(r.user_email) = lower(btrim(_email))
  ORDER BY r.created_at DESC
  LIMIT 1
$$;

GRANT EXECUTE ON FUNCTION public.check_cv_access(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_cv_for_email(_email text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  req public.cv_requests%ROWTYPE;
  result jsonb;
BEGIN
  SELECT * INTO req FROM public.cv_requests
  WHERE lower(user_email) = lower(btrim(_email))
  ORDER BY created_at DESC LIMIT 1;

  IF req.id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_found');
  END IF;
  IF req.status <> 'approved' THEN
    RETURN jsonb_build_object('ok', false, 'reason', req.status::text);
  END IF;
  IF req.expires_at IS NOT NULL AND req.expires_at <= now() THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'expired');
  END IF;

  SELECT jsonb_build_object(
    'ok', true,
    'viewerEmail', lower(btrim(_email)),
    'viewerName', req.user_name,
    'cv', (SELECT to_jsonb(c) FROM (
        SELECT professional_summary, skills, languages, contact_phone, contact_address
        FROM public.cv_content LIMIT 1) c),
    'profile', (SELECT to_jsonb(s) FROM (
        SELECT name, tagline, bio, contact_email, phone, location, linkedin_url, github_url, avatar_path
        FROM public.site_settings LIMIT 1) s),
    'education', COALESCE((SELECT jsonb_agg(to_jsonb(e) ORDER BY e.sort_order, e.created_at) FROM (
        SELECT id, kind, title, institution, period, description, sort_order, created_at
        FROM public.education_entries) e), '[]'::jsonb)
  ) INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_cv_for_email(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.notes_by_passkey(_passkey text)
RETURNS TABLE (id uuid, title text, content text, created_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT n.id, n.title, n.content, n.created_at
  FROM public.secret_notes n
  WHERE btrim(n.passkey) = btrim(_passkey) AND btrim(_passkey) <> ''
  ORDER BY n.sort_order, n.created_at DESC
$$;

GRANT EXECUTE ON FUNCTION public.notes_by_passkey(text) TO anon, authenticated;