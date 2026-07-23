
-- PROFILES
DROP POLICY IF EXISTS "Todos autenticados podem ver perfis" ON public.profiles;
CREATE POLICY "Usuário vê próprio perfil" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(),'owner') OR public.has_role(auth.uid(),'admin'));

-- CHILDREN
DROP POLICY IF EXISTS "Autenticados veem crianças" ON public.children;
CREATE POLICY "Equipe vê crianças" ON public.children
  FOR SELECT TO authenticated
  USING (auth.uid() = created_by OR public.has_role(auth.uid(),'owner') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'employee'));

DROP POLICY IF EXISTS "Autenticados atualizam crianças" ON public.children;
CREATE POLICY "Autor ou admin atualizam crianças" ON public.children
  FOR UPDATE TO authenticated
  USING (auth.uid() = created_by OR public.has_role(auth.uid(),'owner') OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (auth.uid() = created_by OR public.has_role(auth.uid(),'owner') OR public.has_role(auth.uid(),'admin'));

-- POINT ENTRIES
DROP POLICY IF EXISTS "Autenticados veem pontuações" ON public.point_entries;
CREATE POLICY "Equipe vê pontuações" ON public.point_entries
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'owner') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'employee'));

-- CHILD BADGES
DROP POLICY IF EXISTS "Autenticados veem conquistas de medalhas" ON public.child_badges;
CREATE POLICY "Equipe vê medalhas concedidas" ON public.child_badges
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'owner') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'employee'));

-- REWARD REDEMPTIONS
DROP POLICY IF EXISTS "Autenticados veem trocas" ON public.reward_redemptions;
CREATE POLICY "Equipe vê trocas" ON public.reward_redemptions
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'owner') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'employee'));

-- Lock down SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.time_entries_guard_status() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.time_entries_auto_approve() FROM PUBLIC, anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_current_user_role() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated;
