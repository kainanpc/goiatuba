
-- Children (crianças atendidas pelo SCFV)
CREATE TABLE public.children (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name text NOT NULL,
  birth_date date,
  guardian_name text,
  guardian_phone text,
  gender text,
  notes text,
  avatar_url text,
  active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.children TO authenticated;
GRANT ALL ON public.children TO service_role;

ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Autenticados veem crianças" ON public.children
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Autenticados cadastram crianças" ON public.children
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Autenticados atualizam crianças" ON public.children
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Dono e Admin removem crianças" ON public.children
  FOR DELETE TO authenticated USING (
    public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin')
  );

CREATE TRIGGER update_children_updated_at BEFORE UPDATE ON public.children
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Activities (catálogo de atividades/conquistas com pontos padrão)
CREATE TABLE public.activities (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  default_points integer NOT NULL DEFAULT 10,
  category text,
  icon text,
  active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.activities TO authenticated;
GRANT ALL ON public.activities TO service_role;

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Autenticados veem atividades" ON public.activities
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Dono e Admin gerenciam atividades - insert" ON public.activities
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Dono e Admin gerenciam atividades - update" ON public.activities
  FOR UPDATE TO authenticated USING (
    public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Dono e Admin gerenciam atividades - delete" ON public.activities
  FOR DELETE TO authenticated USING (
    public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin')
  );

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON public.activities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Point entries (registros de pontuação por educador)
CREATE TABLE public.point_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  activity_id uuid REFERENCES public.activities(id) ON DELETE SET NULL,
  awarded_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  points integer NOT NULL,
  reason text,
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_point_entries_child ON public.point_entries(child_id);
CREATE INDEX idx_point_entries_awarded_by ON public.point_entries(awarded_by);
CREATE INDEX idx_point_entries_date ON public.point_entries(entry_date DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.point_entries TO authenticated;
GRANT ALL ON public.point_entries TO service_role;

ALTER TABLE public.point_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Autenticados veem pontuações" ON public.point_entries
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Educador registra pontuação" ON public.point_entries
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = awarded_by);
CREATE POLICY "Autor ou admin editam pontuação" ON public.point_entries
  FOR UPDATE TO authenticated USING (
    auth.uid() = awarded_by
    OR public.has_role(auth.uid(), 'owner')
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Autor ou admin removem pontuação" ON public.point_entries
  FOR DELETE TO authenticated USING (
    auth.uid() = awarded_by
    OR public.has_role(auth.uid(), 'owner')
    OR public.has_role(auth.uid(), 'admin')
  );

-- Seed inicial de atividades comuns
INSERT INTO public.activities (name, description, default_points, category, icon) VALUES
  ('Participação em atividade', 'Presença ativa na atividade do dia', 10, 'Comportamento', 'Star'),
  ('Ajudou um colega', 'Cooperação e empatia com os colegas', 15, 'Valores', 'Heart'),
  ('Tarefa concluída', 'Concluiu tarefa proposta pelo educador', 20, 'Aprendizagem', 'CheckCircle'),
  ('Destaque do dia', 'Destaque especial escolhido pelo educador', 30, 'Reconhecimento', 'Trophy'),
  ('Boa convivência', 'Respeito e boa convivência com o grupo', 10, 'Valores', 'Users');
