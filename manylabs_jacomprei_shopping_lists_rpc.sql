begin;

create or replace function public.jacomprei_create_shopping_list(
  p_user_id uuid,
  p_title text,
  p_items jsonb
)
returns table (id uuid, title text, items jsonb, created_at timestamptz)
language plpgsql
security definer
set search_path = jacomprei, public, pg_temp
as $$
begin
  if nullif(btrim(p_title), '') is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'invalid_shopping_list';
  end if;

  return query
  insert into jacomprei.shopping_lists (user_id, title, items)
  values (p_user_id, btrim(p_title), p_items)
  returning shopping_lists.id, shopping_lists.title, shopping_lists.items, shopping_lists.created_at;
end;
$$;

create or replace function public.jacomprei_get_shopping_lists(p_user_id uuid)
returns table (id uuid, title text, items jsonb, created_at timestamptz)
language sql
security definer
set search_path = jacomprei, public, pg_temp
as $$
  select id, title, items, created_at
  from jacomprei.shopping_lists
  where user_id = p_user_id
  order by created_at desc;
$$;

create or replace function public.jacomprei_get_shopping_list(p_user_id uuid, p_list_id uuid)
returns table (id uuid, title text, items jsonb, created_at timestamptz)
language sql
security definer
set search_path = jacomprei, public, pg_temp
as $$
  select id, title, items, created_at
  from jacomprei.shopping_lists
  where user_id = p_user_id and id = p_list_id;
$$;

create or replace function public.jacomprei_delete_shopping_list(p_user_id uuid, p_list_id uuid)
returns boolean
language plpgsql
security definer
set search_path = jacomprei, public, pg_temp
as $$
begin
  delete from jacomprei.shopping_lists
  where user_id = p_user_id and id = p_list_id;
  return found;
end;
$$;

revoke all on function public.jacomprei_create_shopping_list(uuid, text, jsonb) from public, anon, authenticated;
revoke all on function public.jacomprei_get_shopping_lists(uuid) from public, anon, authenticated;
revoke all on function public.jacomprei_get_shopping_list(uuid, uuid) from public, anon, authenticated;
revoke all on function public.jacomprei_delete_shopping_list(uuid, uuid) from public, anon, authenticated;

grant execute on function public.jacomprei_create_shopping_list(uuid, text, jsonb) to service_role;
grant execute on function public.jacomprei_get_shopping_lists(uuid) to service_role;
grant execute on function public.jacomprei_get_shopping_list(uuid, uuid) to service_role;
grant execute on function public.jacomprei_delete_shopping_list(uuid, uuid) to service_role;

commit;
