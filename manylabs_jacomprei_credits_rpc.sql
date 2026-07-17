-- Credit operations for Já Comprei.
-- These functions are intentionally callable only by service_role. The API
-- authenticates the user before invoking them, keeping the private schema out
-- of the browser and making credit consumption atomic.

create or replace function public.jacomprei_get_credit_status(p_user_id uuid)
returns table (
  allowed boolean,
  is_privileged boolean,
  role text,
  balance integer
)
language sql
security definer
set search_path = ''
as $$
  select
    (coalesce(p.subscription_tier, 'user') in ('dev', 'admin') or coalesce(p.credits_balance, 0) > 0) as allowed,
    (coalesce(p.subscription_tier, 'user') in ('dev', 'admin')) as is_privileged,
    coalesce(p.subscription_tier, 'user') as role,
    coalesce(p.credits_balance, 0) as balance
  from jacomprei.profiles p
  where p.id = p_user_id;
$$;

create or replace function public.jacomprei_consume_credit(p_user_id uuid)
returns table (
  allowed boolean,
  is_privileged boolean,
  role text,
  balance integer,
  consumed boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_balance integer;
  current_role text;
begin
  select coalesce(credits_balance, 0), coalesce(subscription_tier, 'user')
    into current_balance, current_role
  from jacomprei.profiles
  where id = p_user_id
  for update;

  if not found then
    return query select false, false, 'user'::text, 0, false;
    return;
  end if;

  if current_role in ('dev', 'admin') then
    return query select true, true, current_role, current_balance, false;
    return;
  end if;

  if current_balance <= 0 then
    return query select false, false, current_role, current_balance, false;
    return;
  end if;

  update jacomprei.profiles
     set credits_balance = current_balance - 1,
         updated_at = now()
   where id = p_user_id;

  insert into jacomprei.credit_transactions (user_id, amount, description)
  values (p_user_id, -1, 'Geração de Receita');

  return query select true, false, current_role, current_balance - 1, true;
end;
$$;

revoke all on function public.jacomprei_get_credit_status(uuid) from public, anon, authenticated;
revoke all on function public.jacomprei_consume_credit(uuid) from public, anon, authenticated;
grant execute on function public.jacomprei_get_credit_status(uuid) to service_role;
grant execute on function public.jacomprei_consume_credit(uuid) to service_role;
