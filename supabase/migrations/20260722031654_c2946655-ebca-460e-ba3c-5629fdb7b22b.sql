
CREATE TYPE public.time_entry_type AS ENUM ('extra', 'plantao', 'feriado', 'folga_usada', 'ajuste');

CREATE TABLE public.time_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  entry_type public.time_entry_type NOT NULL,
  hours numeric(6,2) NOT NULL,
  description text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_time_entries_user ON public.time_entries(user_id);
CREATE INDEX idx_time_entries_date ON public.time_entries(entry_date DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.time_entries TO authenticated;
GRANT ALL ON public.time_entries TO service_role;

ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver próprios registros ou admin vê todos" ON public.time_entries
  FOR SELECT TO authenticated USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'owner')
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Registrar horas próprias ou admin" ON public.time_entries
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'owner')
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Editar próprios registros ou admin" ON public.time_entries
  FOR UPDATE TO authenticated USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'owner')
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Remover próprios registros ou admin" ON public.time_entries
  FOR DELETE TO authenticated USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'owner')
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON public.time_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
