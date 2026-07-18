begin;

create or replace function public.jacomprei_save_recipe(
  p_user_id uuid,
  p_title text,
  p_slug text,
  p_ingredients jsonb,
  p_instructions jsonb,
  p_visual_tag text,
  p_image_url text,
  p_is_public boolean default false
)
returns table (
  id uuid,
  title text,
  slug text,
  ingredients jsonb,
  instructions jsonb,
  visual_tag text,
  image_url text,
  user_id uuid,
  is_public boolean,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_slug text := nullif(btrim(p_slug), '');
begin
  if nullif(btrim(p_title), '') is null or v_slug is null then
    raise exception 'invalid_recipe';
  end if;
  if jsonb_typeof(coalesce(p_ingredients, '[]'::jsonb)) <> 'array'
     or jsonb_typeof(coalesce(p_instructions, '[]'::jsonb)) <> 'array' then
    raise exception 'invalid_recipe_payload';
  end if;

  if exists (select 1 from jacomprei.recipes r where r.slug = v_slug) then
    v_slug := v_slug || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8);
  end if;

  return query
  insert into jacomprei.recipes (
    title, slug, ingredients, instructions, visual_tag, image_url, user_id, is_public
  )
  values (
    btrim(p_title), v_slug, coalesce(p_ingredients, '[]'::jsonb),
    coalesce(p_instructions, '[]'::jsonb), nullif(btrim(p_visual_tag), ''),
    nullif(btrim(p_image_url), ''), p_user_id, coalesce(p_is_public, false)
  )
  returning recipes.id, recipes.title, recipes.slug, recipes.ingredients,
    recipes.instructions, recipes.visual_tag, recipes.image_url, recipes.user_id,
    recipes.is_public, recipes.created_at;
end;
$$;

create or replace function public.jacomprei_get_saved_recipes(p_user_id uuid)
returns table (
  id uuid, title text, slug text, ingredients jsonb, instructions jsonb,
  visual_tag text, image_url text, user_id uuid, is_public boolean, created_at timestamptz
)
language sql
security definer
set search_path = ''
as $$
  select r.id, r.title, r.slug, r.ingredients, r.instructions, r.visual_tag,
    r.image_url, r.user_id, r.is_public, r.created_at
  from jacomprei.recipes r
  where r.user_id = p_user_id
  order by r.created_at desc;
$$;

create or replace function public.jacomprei_get_saved_recipe(p_user_id uuid, p_slug text)
returns table (
  id uuid, title text, slug text, ingredients jsonb, instructions jsonb,
  visual_tag text, image_url text, user_id uuid, is_public boolean, created_at timestamptz
)
language sql
security definer
set search_path = ''
as $$
  select r.id, r.title, r.slug, r.ingredients, r.instructions, r.visual_tag,
    r.image_url, r.user_id, r.is_public, r.created_at
  from jacomprei.recipes r
  where r.slug = p_slug and (r.user_id = p_user_id or r.is_public = true)
  limit 1;
$$;

revoke all on function public.jacomprei_save_recipe(uuid, text, text, jsonb, jsonb, text, text, boolean) from public, anon, authenticated;
revoke all on function public.jacomprei_get_saved_recipes(uuid) from public, anon, authenticated;
revoke all on function public.jacomprei_get_saved_recipe(uuid, text) from public, anon, authenticated;

grant execute on function public.jacomprei_save_recipe(uuid, text, text, jsonb, jsonb, text, text, boolean) to service_role;
grant execute on function public.jacomprei_get_saved_recipes(uuid) to service_role;
grant execute on function public.jacomprei_get_saved_recipe(uuid, text) to service_role;

commit;
