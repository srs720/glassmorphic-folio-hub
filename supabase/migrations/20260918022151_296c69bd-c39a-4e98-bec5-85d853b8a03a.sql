
CREATE TYPE public.cv_request_status AS ENUM ('unverified', 'pending', 'approved', 'rejected');

CREATE TABLE public.cv_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_summary text NOT NULL DEFAULT '',
  skills jsonb NOT NULL DEFAULT '[]'::jsonb,
  languages jsonb NOT NULL DEFAULT '[]'::jsonb,
  contact_phone text NOT NULL DEFAULT '',
  contact_address text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cv_content TO authenticated;
GRANT ALL ON public.cv_content TO service_role;
ALTER TABLE public.cv_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage cv content" ON public.cv_content FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER cv_content_set_updated_at BEFORE UPDATE ON public.cv_content
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.cv_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name text NOT NULL,
  user_email text NOT NULL UNIQUE,
  purpose text NOT NULL DEFAULT '',
  otp text,
  otp_expiry timestamptz,
  status public.cv_request_status NOT NULL DEFAULT 'unverified',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cv_requests TO authenticated;
GRANT ALL ON public.cv_requests TO service_role;
ALTER TABLE public.cv_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage cv requests" ON public.cv_requests FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER cv_requests_set_updated_at BEFORE UPDATE ON public.cv_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.email_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_email text NOT NULL DEFAULT '',
  app_password text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.email_settings TO authenticated;
GRANT ALL ON public.email_settings TO service_role;
ALTER TABLE public.email_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage email settings" ON public.email_settings FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER email_settings_set_updated_at BEFORE UPDATE ON public.email_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.cv_content (professional_summary) VALUES ('');
INSERT INTO public.email_settings (sender_email) VALUES ('info.shoiburrahman@gmail.com');
