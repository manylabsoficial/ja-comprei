-- Hardening ManyLabs do Já Comprei.
-- As funções que recebem um UUID arbitrário são exclusivas do backend.
-- O frontend só pode consultar o próprio acesso por meio de auth.uid().

begin;

revoke all on function public.ensure_manylabs_app_access(uuid, text, text) from public, anon, authenticated;
revoke all on function public.has_manylabs_app_access(uuid) from public, anon, authenticated;
revoke all on function public.current_user_has_manylabs_app_access() from public, anon;

grant execute on function public.ensure_manylabs_app_access(uuid, text, text) to service_role;
grant execute on function public.has_manylabs_app_access(uuid) to service_role;
grant execute on function public.current_user_has_manylabs_app_access() to authenticated, service_role;

commit;
