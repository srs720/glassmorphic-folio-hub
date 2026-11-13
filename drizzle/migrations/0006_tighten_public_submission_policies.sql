DROP POLICY "Anyone can request cv access" ON public.cv_requests;
CREATE POLICY "Anyone can request cv access" ON public.cv_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    status = 'pending'::public.cv_request_status
    AND expires_at IS NULL
    AND otp IS NULL
    AND otp_expiry IS NULL
    AND length(btrim(user_name)) BETWEEN 2 AND 100
    AND length(user_email) BETWEEN 3 AND 255
    AND user_email = btrim(user_email)
    AND user_email ~* '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
    AND length(btrim(purpose)) BETWEEN 3 AND 600
  );

DROP POLICY "Anyone can send messages" ON public.messages;
CREATE POLICY "Anyone can send messages" ON public.messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    archived = false
    AND length(btrim(name)) BETWEEN 1 AND 100
    AND length(email) BETWEEN 3 AND 255
    AND email = btrim(email)
    AND email ~* '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
    AND length(btrim(message)) BETWEEN 1 AND 3000
  );