-- Run this once in the Supabase SQL editor for this project.
-- Records real, anonymous page visits for the Live Activity page.
-- No identifiers: just which page loaded and when. See privacy.html.

create table if not exists public.site_visits (
  id bigint generated always as identity primary key,
  path text not null,
  created_at timestamptz not null default now()
);

-- Marks the first page a visitor hits in a browser tab session (sessionStorage-scoped,
-- cleared when the tab closes — not a persistent identifier). See privacy.html.
alter table public.site_visits add column if not exists is_entry boolean not null default false;

alter table public.site_visits enable row level security;

drop policy if exists "Anyone can record a visit" on public.site_visits;
create policy "Anyone can record a visit"
  on public.site_visits for insert
  to anon
  with check (true);

drop policy if exists "Public can read visit counts" on public.site_visits;
create policy "Public can read visit counts"
  on public.site_visits for select
  to anon
  using (true);

-- Aggregate-only stats, used by impact.html instead of fetching raw rows.
drop function if exists public.get_visit_stats();
create or replace function public.get_visit_stats()
returns table(total_visits bigint, learner_sessions bigint, top_pages jsonb)
language sql
stable
as $$
  select
    (select count(*) from public.site_visits) as total_visits,
    (select count(*) from public.site_visits where is_entry) as learner_sessions,
    (select coalesce(jsonb_agg(jsonb_build_object('path', path, 'count', cnt) order by cnt desc), '[]'::jsonb)
       from (select path, count(*) as cnt from public.site_visits group by path order by count(*) desc limit 10) t
    ) as top_pages;
$$;

grant execute on function public.get_visit_stats() to anon;
