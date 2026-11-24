create extension if not exists pgcrypto with schema extensions;

create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  granted_at timestamptz not null default now(),
  granted_by uuid references auth.users (id) on delete set null
);
heck (char_length(btrim(name)) between 2 and 100),
  email text not null check (char_length(btrim(email)) between 3 and 254),
  company text check (company is null or char_length(company) <= 160),
  message text not null check (char_length(btrim(message)) between 10 and 5000),
  status text not null default 'new'
    check (status in ('new', 'contacted', 'qualified', 'closed', 'spam')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index contact_requests_status_created_idx on public.contact_requests (status, created_at desc);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete restrict,
  title text not null check (char_length(btrim(title)) between 2 and 180),
  description text check (description is null or char_length(description) <= 5000),
  public_summary text check (public_summary is null or char_length(public_summary) <= 1000),
  status text not null default 'planning'
    check (status in ('planning', 'in_progress', 'review', 'completed', 'paused')),
  progress integer not null default 0 check (progress between 0 and 100),
  is_portfolio boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (not is_portfolio or public_summary is not null)
);

create index projects_client_created_idx on public.projects (client_id, created_at desc);
create index projects_portfolio_idx on public.projects (created_at desc)
  where is_portfolio and status = 'c
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users (id) on delete set null,
  name text not null check (char_length(btrim(name)) between 2 and 160),
  email text not null check (char_length(btrim(email)) between 3 and 254),
  company text check (company is null or char_length(company) <= 160),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index clients_email_lower_unique on public.clients (lower(email));
create index clients_created_at_idx on public.clients (created_at desc);

create table public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null completed';

create table public.project_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 2 and 180),
  body text not null check (char_length(btrim(body)) between 3 and 5000),
  is_visible_to_client boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index project_updates_project_created_idx on public.project_updates (project_id, created_at desc);

create table public.contact_request_rate_limits (
  visitor_fingerprint text primary key check (visitor_fingerprint ~ '^[0-9a-f]{64}$'),
  window_started_at timestamptz not null default now(),
  request_count integer not null default 1 check (request_count > 0)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger clients_set_updated_at
before update on public.clients
for each row execute function public.set_updated_at();

create trigger contact_requests_set_updated_at
before update on public.contact_requests
for each row execute function public.set_updated_at();

create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

create trigger project_updates_set_updated_at
before update on public.project_updates
for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create or replace function public.consume_contact_request_rate_limit(
  p_visitor_fingerprint text,
  p_max_requests integer default 5,
  p_window_seconds integer default 3600
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_count integer;
begin
  if p_visitor_fingerprint !~ '^[0-9a-f]{64}$'
    or p_max_requests < 1
    or p_window_seconds < 1
    or p_window_seconds > 86400 then
    raise exception 'Invalid rate limit parameters';
  end if;

  delete from public.contact_request_rate_limits
  where window_started_at < now() - interval '2 days';

  insert into public.contact_request_rate_limits as current_limit (visitor_fingerprint, window_started_at, request_count)
  values (p_visitor_fingerprint, now(), 1)
  on conflict (visitor_fingerprint) do update
  set window_started_at = case
        when now() - current_limit.window_started_at >= make_interval(secs => p_window_seconds)
          then now()
        else current_limit.window_started_at
      end,
      request_count = case
        when now() - current_limit.window_started_at >= make_interval(secs => p_window_seconds)
          then 1
        else current_limit.request_count + 1
      end
  returning request_count into current_count;

  return current_count <= p_max_requests;
end;
$$;

revoke all on function public.consume_contact_request_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_contact_request_rate_limit(text, integer, integer) to service_role;

alter table public.admin_users enable row level security;
alter table public.clients enable row level security;
alter table public.contact_requests enable row level security;
alter table public.projects enable row level security;
alter table public.project_updates enable row level security;
alter table public.contact_request_rate_limits enable row level security;

create policy "Admins can read administrator assignments"
on public.admin_users for select to authenticated
using (public.is_admin() or user_id = (select auth.uid()));

create policy "Clients can read their own profile"
on public.clients for select to authenticated
using (auth_user_id = (select auth.uid()));

create policy "Admins manage clients"
on public.clients for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins manage contact requests"
on public.contact_requests for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Clients read their own projects"
on public.projects for select to authenticated
using (
  exists (
    select 1
    from public.clients
    where clients.id = projects.client_id
      and clients.auth_user_id = (select auth.uid())
  )
);

create policy "Admins manage projects"
on public.projects for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Clients read updates shared with them"
on public.project_updates for select to authenticated
using (
  is_visible_to_client
  and exists (
    select 1
    from public.projects
    join public.clients on clients.id = projects.client_id
    where projects.id = project_updates.project_id
      and clients.auth_user_id = (select auth.uid())
  )
);

create policy "Admins manage project updates"
on public.project_updates for all to authenticated
using (public.is_admin())
with check (public.is_admin());

revoke all on public.admin_users, public.clients, public.contact_requests,
  public.projects, public.project_updates, public.contact_request_rate_limits
from anon, authenticated;
grant usage on schema public to anon, authenticated, service_role;
grant select on public.admin_users to authenticated;
grant select, insert, update, delete on public.clients, public.contact_requests,
  public.projects, public.project_updates to authenticated;
grant insert on public.contact_requests to service_role;
grant select, insert, update, delete on public.contact_request_rate_limits to service_role;

create view public.public_projects
with (security_barrier = true)
as
select id, title, public_summary, created_at
from public.projects
where is_portfolio
  and status = 'completed'
  and public_summary is not null;

revoke all on public.public_projects from public;
grant select on public.public_projects to anon, authenticated;
