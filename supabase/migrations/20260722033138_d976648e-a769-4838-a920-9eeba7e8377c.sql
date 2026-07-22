
-- ============ REWARDS ============
CREATE TABLE public.rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  cost_points INT NOT NULL CHECK (cost_points >= 0),
  stock INT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rewards TO authenticated;
GRANT ALL ON public.rewards TO service_role;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Autenticados veem recompensas" ON public.rewards
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins gerenciam recompensas" ON public.rewards
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_rewards_updated_at BEFORE UPDATE ON public.rewards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ REWARD REDEMPTIONS ============
CREATE TABLE public.reward_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES public.rewards(id) ON DELETE RESTRICT,
  points_spent INT NOT NULL CHECK (points_spent >= 0),
  notes TEXT,
  redeemed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reward_redemptions TO authenticated;
GRANT ALL ON public.reward_redemptions TO service_role;
ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Autenticados veem trocas" ON public.reward_redemptions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Equipe registra trocas" ON public.reward_redemptions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = redeemed_by);
CREATE POLICY "Admins gerenciam trocas" ON public.reward_redemptions
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins removem trocas" ON public.reward_redemptions
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'));

-- ============ BADGES ============
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL DEFAULT 'Medal',
  required_points INT NOT NULL DEFAULT 0 CHECK (required_points >= 0),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.badges TO authenticated;
GRANT ALL ON public.badges TO service_role;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Autenticados veem medalhas" ON public.badges
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins gerenciam medalhas" ON public.badges
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_badges_updated_at BEFORE UPDATE ON public.badges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ CHILD BADGES ============
CREATE TABLE public.child_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  awarded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (child_id, badge_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.child_badges TO authenticated;
GRANT ALL ON public.child_badges TO service_role;
ALTER TABLE public.child_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Autenticados veem conquistas de medalhas" ON public.child_badges
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Equipe concede medalhas" ON public.child_badges
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = awarded_by);
CREATE POLICY "Admins removem medalhas" ON public.child_badges
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'));

-- ============ SEED ============
INSERT INTO public.badges (name, description, icon, required_points) VALUES
  ('Primeiros Passos', 'Alcançou 50 pontos.', 'Sparkles', 50),
  ('Estrela Brilhante', 'Alcançou 200 pontos.', 'Star', 200),
  ('Herói SCFV', 'Alcançou 500 pontos.', 'Trophy', 500),
  ('Lenda', 'Alcançou 1000 pontos.', 'Award', 1000);

INSERT INTO public.rewards (name, description, cost_points, stock, active) VALUES
  ('Lápis Colorido', 'Kit de lápis de cor.', 30, NULL, true),
  ('Kit Escolar', 'Caderno + caneta + apontador.', 80, NULL, true),
  ('Livro Infantil', 'Livro de história a escolher.', 120, NULL, true),
  ('Bola Esportiva', 'Bola oficial de futebol/vôlei.', 250, NULL, true);
