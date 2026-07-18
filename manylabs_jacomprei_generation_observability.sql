-- Structured, privacy-conscious observability for Já Comprei recipe generation.
-- Tables live in the private schema and are only written via service_role RPCs.

create table if not exists jacomprei.recipe_generation_runs (
  id uuid primary key,
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'running' check (status in ('running', 'succeeded', 'failed')),
  ingredient_count integer not null check (ingredient_count >= 0),
  recipe_count integer,
  duration_ms integer,
  error_code text,
  error_message text,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create table if not exists jacomprei.recipe_generation_events (
  id bigint generated always as identity primary key,
  run_id uuid not null references jacomprei.recipe_generation_runs(id) on delete cascade,
  event_type text not null,
  stage text not null,
  level text not null default 'info' check (level in ('debug', 'info', 'warning', 'error')),
  provider text,
  model text,
  recipe_index integer,
  duration_ms integer,
  error_code text,
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists recipe_generation_runs_user_started_idx
  on jacomprei.recipe_generation_runs (user_id, started_at desc);
create index if not exists recipe_generation_events_run_created_idx
  on jacomprei.recipe_generation_events (run_id, created_at asc);

alter table jacomprei.recipe_generation_runs enable row level security;
alter table jacomprei.recipe_generation_events enable row level security;
revoke all on table jacomprei.recipe_generation_runs from public, anon, authenticated;
revoke all on table jacomprei.recipe_generation_events from public, anon, authenticated;

create or replace function public.jacomprei_create_generation_run(
  p_run_id uuid, p_user_id uuid, p_ingredient_count integer
) returns uuid language sql security definer set search_path = '' as $$
  insert into jacomprei.recipe_generation_runs (id, user_id, ingredient_count)
  values (p_run_id, p_user_id, greatest(p_ingredient_count, 0))
  returning id;
$$;

create or replace function public.jacomprei_add_generation_event(
  p_run_id uuid, p_event_type text, p_stage text, p_level text,
  p_provider text, p_model text, p_recipe_index integer, p_duration_ms integer,
  p_error_code text, p_error_message text, p_metadata jsonb
) returns bigint language sql security definer set search_path = '' as $$
  insert into jacomprei.recipe_generation_events (
    run_id, event_type, stage, level, provider, model, recipe_index, duration_ms,
    error_code, error_message, metadata
  ) values (
    p_run_id, left(p_event_type, 80), left(p_stage, 80),
    case when p_level in ('debug', 'info', 'warning', 'error') then p_level else 'info' end,
    nullif(left(coalesce(p_provider, ''), 80), ''),
    nullif(left(coalesce(p_model, ''), 160), ''), p_recipe_index, p_duration_ms,
    nullif(left(coalesce(p_error_code, ''), 80), ''),
    nullif(left(coalesce(p_error_message, ''), 500), ''), coalesce(p_metadata, '{}'::jsonb)
  ) returning id;
$$;

create or replace function public.jacomprei_finish_generation_run(
  p_run_id uuid, p_status text, p_recipe_count integer, p_duration_ms integer,
  p_error_code text, p_error_message text
) returns boolean language sql security definer set search_path = '' as $$
  update jacomprei.recipe_generation_runs
     set status = case when p_status in ('succeeded', 'failed') then p_status else 'failed' end,
         recipe_count = p_recipe_count,
         duration_ms = p_duration_ms,
         error_code = nullif(left(coalesce(p_error_code, ''), 80), ''),
         error_message = nullif(left(coalesce(p_error_message, ''), 500), ''),
         finished_at = now()
   where id = p_run_id
  returning true;
$$;

create or replace function public.jacomprei_add_generation_client_event(
  p_run_id uuid, p_user_id uuid, p_recipe_index integer, p_event_type text, p_metadata jsonb
) returns boolean language plpgsql security definer set search_path = '' as $$
begin
  if not exists (
    select 1 from jacomprei.recipe_generation_runs
    where id = p_run_id and user_id = p_user_id
  ) then
    return false;
  end if;

  insert into jacomprei.recipe_generation_events (
    run_id, event_type, stage, level, recipe_index, metadata
  ) values (
    p_run_id,
    case when p_event_type in ('image_loaded', 'image_failed') then p_event_type else 'client_event_rejected' end,
    'client_image_render',
    case when p_event_type = 'image_failed' then 'warning' else 'info' end,
    p_recipe_index,
    coalesce(p_metadata, '{}'::jsonb)
  );
  return true;
end;
$$;

revoke all on function public.jacomprei_create_generation_run(uuid, uuid, integer) from public, anon, authenticated;
revoke all on function public.jacomprei_add_generation_event(uuid, text, text, text, text, text, integer, integer, text, text, jsonb) from public, anon, authenticated;
revoke all on function public.jacomprei_finish_generation_run(uuid, text, integer, integer, text, text) from public, anon, authenticated;
revoke all on function public.jacomprei_add_generation_client_event(uuid, uuid, integer, text, jsonb) from public, anon, authenticated;
grant execute on function public.jacomprei_create_generation_run(uuid, uuid, integer) to service_role;
grant execute on function public.jacomprei_add_generation_event(uuid, text, text, text, text, text, integer, integer, text, text, jsonb) to service_role;
grant execute on function public.jacomprei_finish_generation_run(uuid, text, integer, integer, text, text) to service_role;
grant execute on function public.jacomprei_add_generation_client_event(uuid, uuid, integer, text, jsonb) to service_role;
