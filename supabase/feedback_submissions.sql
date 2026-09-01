-- Run this in the Supabase SQL editor before publishing the impact survey.
-- It is safe to rerun and preserves submissions collected with the earlier form.

create table if not exists public.feedback_submissions (
  id bigint generated always as identity primary key,
  role text not null,
  feedback_type text not null,
  area text not null,
  rating smallint not null,
  message text not null,
  email text,
  source_path text not null default '/feedback.html',
  created_at timestamptz not null default now()
);

alter table public.feedback_submissions add column if not exists organization text;
alter table public.feedback_submissions add column if not exists country text;
alter table public.feedback_submissions add column if not exists usage_context text;
alter table public.feedback_submissions add column if not exists course_level text;
alter table public.feedback_submissions add column if not exists completion_status text;
alter table public.feedback_submissions add column if not exists learners_reached integer;
alter table public.feedback_submissions add column if not exists confidence_before smallint;
alter table public.feedback_submissions add column if not exists confidence_after smallint;
alter table public.feedback_submissions add column if not exists project_status text;
alter table public.feedback_submissions add column if not exists recommend_score smallint;
alter table public.feedback_submissions add column if not exists outcomes text[];
alter table public.feedback_submissions add column if not exists evidence_detail text;
alter table public.feedback_submissions add column if not exists quote_permission text;
alter table public.feedback_submissions add column if not exists display_name text;
alter table public.feedback_submissions add column if not exists job_title text;
alter table public.feedback_submissions add column if not exists consent_version text;

alter table public.feedback_submissions enable row level security;

drop policy if exists "Anyone can submit feedback" on public.feedback_submissions;
create policy "Anyone can submit feedback"
  on public.feedback_submissions for insert to anon
  with check (
    role in ('learner','teacher','parent','educator','other')
    and feedback_type in ('content','activity','website','accessibility','teacher_resources','idea','issue','other')
    and course_level in ('level_1','level_2','level_3','overall')
    and area in ('overall','assessment','dashboard','teacher_resources','other','level_1_week_1','level_1_week_2','level_1_week_3','level_1_week_4','level_1_week_5','level_1_week_6','level_2_week_1','level_2_week_2','level_2_week_3','level_2_week_4','level_2_week_5','level_2_week_6','level_2_week_7','level_2_week_8','level_3_week_1','level_3_week_2','level_3_week_3','level_3_week_4','level_3_week_5','level_3_week_6','level_3_week_7','level_3_week_8')
    and usage_context in ('self_learning','classroom','workshop','workplace','community','evaluation','other')
    and completion_status in ('started','partial','most','completed','selected_resources')
    and project_status in ('built','in_progress','planned','not_yet','not_applicable')
    and quote_permission in ('none','anonymous','attributed')
    and rating between 1 and 5
    and confidence_before between 1 and 5
    and confidence_after between 1 and 5
    and recommend_score between 0 and 10
    and learners_reached between 0 and 1000000
    and char_length(country) between 2 and 100
    and (organization is null or char_length(organization) <= 200)
    and cardinality(outcomes) between 1 and 6
    and outcomes <@ array['understood_concepts','built_agent','responsible_ai','taught_others','applied_work_school','none_yet']::text[]
    and char_length(evidence_detail) between 20 and 3000
    and char_length(message) between 10 and 3000
    and (display_name is null or char_length(display_name) <= 150)
    and (job_title is null or char_length(job_title) <= 150)
    and (quote_permission <> 'attributed' or (char_length(display_name) between 2 and 150 and char_length(job_title) between 2 and 150))
    and (email is null or char_length(email) <= 320)
    and char_length(source_path) <= 300
    and consent_version = '2026-08-31'
  );

grant insert on table public.feedback_submissions to anon;
grant usage on sequence public.feedback_submissions_id_seq to anon;

-- Administrative aggregate view. Reported reach is self-reported and may not be
-- deduplicated across co-facilitators, so preserve that label in external reports.
create or replace view public.feedback_impact_metrics
with (security_invoker = true)
as
select
  count(*) as total_responses,
  count(distinct nullif(lower(country), '')) as countries_or_regions,
  count(distinct nullif(lower(organization), '')) as reporting_organizations,
  coalesce(sum(learners_reached), 0) as reported_learners_reached,
  round(avg(rating)::numeric, 2) as average_experience_rating,
  round(avg((confidence_after - confidence_before))::numeric, 2) as average_self_reported_confidence_change,
  count(*) filter (where project_status = 'built') as respondents_who_built_projects,
  count(*) filter (where completion_status = 'completed') as completed_all_six_weeks,
  round(100.0 * (count(*) filter (where recommend_score >= 9) - count(*) filter (where recommend_score <= 6)) / nullif(count(*), 0), 1) as net_promoter_score,
  count(*) filter (where quote_permission = 'attributed') as attributed_quotes_available,
  min(created_at) as collection_started_at,
  max(created_at) as last_response_at,
  count(*) filter (where course_level = 'level_1') as level_1_responses,
  count(*) filter (where course_level = 'level_2') as level_2_responses,
  count(*) filter (where course_level = 'level_3') as level_3_responses
from public.feedback_submissions
where consent_version is not null;

revoke all on table public.feedback_submissions from anon;
grant insert on table public.feedback_submissions to anon;
revoke all on public.feedback_impact_metrics from anon, authenticated;
grant select on public.feedback_impact_metrics to service_role;

-- No anonymous SELECT policy: visitors cannot read submissions or aggregate metrics.
-- Export raw rows and the metrics view from Supabase with collection dates intact.
