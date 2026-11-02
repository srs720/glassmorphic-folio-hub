ALTER TABLE public.crm_profiles ADD COLUMN sort_order integer NOT NULL DEFAULT 0;
ALTER TABLE public.crm_events ADD COLUMN sort_order integer NOT NULL DEFAULT 0;

CREATE TABLE public.crm_reminder_runs (
  run_date date PRIMARY KEY,
  sent_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.crm_reminder_runs TO service_role;
ALTER TABLE public.crm_reminder_runs ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.auth_reset_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code text NOT NULL,
  expires_at timestamptz NOT NULL,
  used boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX auth_reset_codes_email_idx ON public.auth_reset_codes (email);
GRANT ALL ON public.auth_reset_codes TO service_role;
ALTER TABLE public.auth_reset_codes ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.get_crm_reminder_digest()
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
        'id', p.id, 'name', p.name, 'relation', p.relation, 'dob', p.dob,
        'slug', p.slug, 'is_public', p.is_public
      ) ORDER BY p.name)
      FROM public.crm_profiles AS p, local_day
      WHERE p.dob IS NOT NULL AND to_char(p.dob, 'MM-DD') = to_char(local_day.day, 'MM-DD')
    ), '[]'::jsonb),
    'events', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', e.id, 'title', e.title, 'event_time', e.event_time,
        'description', e.description, 'is_public', e.is_public
      ) ORDER BY e.event_time NULLS FIRST)
      FROM public.crm_events AS e, local_day
      WHERE e.event_date = local_day.day
    ), '[]'::jsonb)
  )
  FROM local_day
$$;
REVOKE ALL ON FUNCTION public.get_crm_reminder_digest() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_crm_reminder_digest() TO service_role;