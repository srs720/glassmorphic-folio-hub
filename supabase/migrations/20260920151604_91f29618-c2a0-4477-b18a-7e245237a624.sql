CREATE TABLE public.secret_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  passkey text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.secret_notes TO authenticated;
GRANT ALL ON public.secret_notes TO service_role;

ALTER TABLE public.secret_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage secret notes" ON public.secret_notes
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER secret_notes_set_updated_at BEFORE UPDATE ON public.secret_notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();