
-- 1) Approval workflow for time_entries
CREATE TYPE public.time_entry_status AS ENUM ('pending', 'approved', 'rejected');

ALTER TABLE public.time_entries
  ADD COLUMN status public.time_entry_status NOT NULL DEFAULT 'pending',
  ADD COLUMN reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN reviewed_at timestamptz,
  ADD COLUMN review_note text;

-- Backfill: existing records stay approved
UPDATE public.time_entries SET status = 'approved', reviewed_at = created_at WHERE status = 'pending';

-- Admins/owner auto-approve their own submissions via trigger
CREATE OR REPLACE FUNCTION public.time_entries_auto_approve()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin') THEN
    NEW.status := 'approved';
    NEW.reviewed_by := auth.uid();
    NEW.reviewed_at := now();
  ELSE
    NEW.status := 'pending';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_time_entries_auto_approve ON public.time_entries;
CREATE TRIGGER trg_time_entries_auto_approve
  BEFORE INSERT ON public.time_entries
  FOR EACH ROW EXECUTE FUNCTION public.time_entries_auto_approve();

-- Only admin/owner can change status after creation
CREATE OR REPLACE FUNCTION public.time_entries_guard_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status
     AND NOT (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin')) THEN
    RAISE EXCEPTION 'Apenas administradores podem alterar o status do registro';
  END IF;
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    NEW.reviewed_by := auth.uid();
    NEW.reviewed_at := now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_time_entries_guard_status ON public.time_entries;
CREATE TRIGGER trg_time_entries_guard_status
  BEFORE UPDATE ON public.time_entries
  FOR EACH ROW EXECUTE FUNCTION public.time_entries_guard_status();

-- 2) Storage: avatars bucket policies (bucket itself is created via tool)
-- Anyone can read avatars, users can upload/update/delete their own inside a folder named by their uid.
CREATE POLICY "Avatars públicos leitura"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Usuário envia seu próprio avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Usuário atualiza seu próprio avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Usuário remove seu próprio avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
