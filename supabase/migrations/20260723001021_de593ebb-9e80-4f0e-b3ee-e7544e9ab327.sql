
-- Phase 1: account status for approval flow
CREATE TYPE public.account_status AS ENUM ('pending', 'approved', 'rejected', 'disabled');

ALTER TABLE public.profiles
  ADD COLUMN account_status public.account_status NOT NULL DEFAULT 'pending',
  ADD COLUMN status_changed_at timestamptz,
  ADD COLUMN status_changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN status_reason text;

-- Existing users are grandfathered as approved so they don't lose access
UPDATE public.profiles SET account_status = 'approved', status_changed_at = now();

-- Update signup trigger: owner auto-approved, others pending, capture phone
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_role public.app_role;
  v_status public.account_status;
BEGIN
  IF lower(NEW.email) = 'kainanb935@gmail.com' THEN
    v_role := 'owner';
    v_status := 'approved';
  ELSE
    v_role := 'employee';
    v_status := 'pending';
  END IF;

  INSERT INTO public.profiles (id, full_name, email, avatar_url, phone, account_status, status_changed_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'phone',
    v_status,
    now()
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, v_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$function$;

-- Ensure trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Only owner can change status
CREATE OR REPLACE FUNCTION public.set_account_status(_user_id uuid, _status public.account_status, _reason text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'owner') THEN
    RAISE EXCEPTION 'Apenas o Dono pode alterar o status de contas';
  END IF;
  UPDATE public.profiles
    SET account_status = _status,
        status_changed_at = now(),
        status_changed_by = auth.uid(),
        status_reason = _reason
    WHERE id = _user_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.set_account_status(uuid, public.account_status, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_account_status(uuid, public.account_status, text) TO authenticated;

-- Owner can also change a user's role
CREATE OR REPLACE FUNCTION public.set_user_role(_user_id uuid, _role public.app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'owner') THEN
    RAISE EXCEPTION 'Apenas o Dono pode alterar papéis';
  END IF;
  DELETE FROM public.user_roles WHERE user_id = _user_id;
  INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, _role);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.set_user_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_user_role(uuid, public.app_role) TO authenticated;
