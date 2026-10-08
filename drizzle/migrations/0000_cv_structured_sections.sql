ALTER TABLE public.cv_content
  ADD COLUMN IF NOT EXISTS skill_groups jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS experience jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS projects jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS achievements_awards jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS contact_email text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS linkedin_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS github_url text NOT NULL DEFAULT '';

CREATE OR REPLACE FUNCTION public.get_cv_for_email(_email text)
 RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  req public.cv_requests%ROWTYPE;
  result jsonb;
BEGIN
  SELECT * INTO req FROM public.cv_requests
  WHERE lower(user_email) = lower(btrim(_email))
  ORDER BY created_at DESC LIMIT 1;
  IF req.id IS NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'not_found'); END IF;
  IF req.status <> 'approved' THEN RETURN jsonb_build_object('ok', false, 'reason', req.status::text); END IF;
  IF req.expires_at IS NOT NULL AND req.expires_at <= now() THEN RETURN jsonb_build_object('ok', false, 'reason', 'expired'); END IF;
  SELECT jsonb_build_object(
    'ok', true,
    'viewerEmail', lower(btrim(_email)),
    'viewerName', req.user_name,
    'cv', (SELECT to_jsonb(c) FROM (
        SELECT professional_summary, skills, languages, contact_phone, contact_address,
               skill_groups, experience, projects, achievements_awards, contact_email, linkedin_url, github_url
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
$function$;