CREATE TABLE public.ai_knowledge_base (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic text NOT NULL,
  content text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_knowledge_base TO authenticated;
GRANT ALL ON public.ai_knowledge_base TO service_role;

ALTER TABLE public.ai_knowledge_base ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage ai knowledge" ON public.ai_knowledge_base
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER ai_knowledge_base_set_updated_at
  BEFORE UPDATE ON public.ai_knowledge_base
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();