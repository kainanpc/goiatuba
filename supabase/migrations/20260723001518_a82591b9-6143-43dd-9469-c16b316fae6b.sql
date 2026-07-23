
-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  category TEXT NOT NULL DEFAULT 'info',
  link TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own notifications" ON public.notifications
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins insert notifications" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin') OR auth.uid() = user_id);

CREATE INDEX idx_notifications_user_created ON public.notifications(user_id, created_at DESC);

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Audit logs: add IP, user agent, device metadata
ALTER TABLE public.audit_logs
  ADD COLUMN IF NOT EXISTS ip_address TEXT,
  ADD COLUMN IF NOT EXISTS user_agent TEXT,
  ADD COLUMN IF NOT EXISTS device TEXT;

-- Helper to log audit events from the client (RLS-safe)
CREATE OR REPLACE FUNCTION public.log_audit_event(
  _action TEXT,
  _entity TEXT,
  _entity_id UUID DEFAULT NULL,
  _metadata JSONB DEFAULT '{}'::jsonb,
  _ip TEXT DEFAULT NULL,
  _user_agent TEXT DEFAULT NULL,
  _device TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_id UUID;
BEGIN
  INSERT INTO public.audit_logs (user_id, action, entity, entity_id, metadata, ip_address, user_agent, device)
  VALUES (auth.uid(), _action, _entity, _entity_id, COALESCE(_metadata, '{}'::jsonb), _ip, _user_agent, _device)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.log_audit_event(TEXT, TEXT, UUID, JSONB, TEXT, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.log_audit_event(TEXT, TEXT, UUID, JSONB, TEXT, TEXT, TEXT) TO authenticated;

-- Trigger: notify admins when a new signup is pending approval
CREATE OR REPLACE FUNCTION public.notify_pending_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE r RECORD;
BEGIN
  IF NEW.account_status = 'pending' THEN
    FOR r IN SELECT user_id FROM public.user_roles WHERE role IN ('owner','admin') LOOP
      INSERT INTO public.notifications (user_id, title, body, category, link)
      VALUES (r.user_id, 'Nova solicitação de acesso',
        COALESCE(NEW.full_name, NEW.email) || ' aguarda aprovação.',
        'approval', '/master');
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_pending_signup ON public.profiles;
CREATE TRIGGER trg_notify_pending_signup
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.notify_pending_signup();

-- Trigger: notify user when account status changes
CREATE OR REPLACE FUNCTION public.notify_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.account_status IS DISTINCT FROM OLD.account_status THEN
    INSERT INTO public.notifications (user_id, title, body, category, link)
    VALUES (NEW.id,
      CASE NEW.account_status
        WHEN 'approved' THEN 'Cadastro aprovado'
        WHEN 'rejected' THEN 'Cadastro reprovado'
        WHEN 'disabled' THEN 'Conta desativada'
        ELSE 'Status atualizado'
      END,
      'Seu status agora é: ' || NEW.account_status,
      'account', '/');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_status_change ON public.profiles;
CREATE TRIGGER trg_notify_status_change
AFTER UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.notify_status_change();

-- Trigger: notify employee when their time_entry decision changes
CREATE OR REPLACE FUNCTION public.notify_time_entry_decision()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status IN ('approved','rejected') THEN
    INSERT INTO public.notifications (user_id, title, body, category, link)
    VALUES (NEW.user_id,
      CASE NEW.status WHEN 'approved' THEN 'Horas aprovadas' ELSE 'Horas reprovadas' END,
      'Seu registro foi ' || NEW.status || '.',
      'time', '/banco-horas');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_time_entry_decision ON public.time_entries;
CREATE TRIGGER trg_notify_time_entry_decision
AFTER UPDATE ON public.time_entries
FOR EACH ROW EXECUTE FUNCTION public.notify_time_entry_decision();
