-- Run this once in the Supabase SQL editor before publishing feedback.html.
-- Public visitors may submit feedback. Only project administrators can read it.

create table if not exists public.feedback_submissions (
  id bigint generated always as identity primary key,
  role text not null check (role in ('learner','teacher','parent','educator','other')),
  feedback_type text not null check (feedback_type in ('content','activity','website','accessibility','teacher_resources','idea','issue','other')),
  area text not null check (area in ('overall','week_1','week_2','week_3','week_4','week_5','week_6','assessment','dashboard','teacher_resources','other')),
  rating smallint not null check (rating between 1 and 5),
  message text not null check (char_length(message) between 10 and 3000),
  email text check (email is null or char_length(email) <= 320),
  source_path text not null default '/feedback.html' check (char_length(source_path) <= 300),
  created_at timestamptz not null default now()
);

alter table public.feedback_submissions enable row level security;

drop policy if exists "Anyone can submit feedback" on public.feedback_submissions;
create policy "Anyone can submit feedback"
  on public.feedback_submissions for insert to anon
  with check (
    role in ('learner','teacher','parent','educator','other')
    and feedback_type in ('content','activity','website','accessibility','teacher_resources','idea','issue','other')
    and area in ('overall','week_1','week_2','week_3','week_4','week_5','week_6','assessment','dashboard','teacher_resources','other')
    and rating between 1 and 5
    and char_length(message) between 10 and 3000
    and (email is null or char_length(email) <= 320)
    and char_length(source_path) <= 300
  );

grant insert on table public.feedback_submissions to anon;
grant usage on sequence public.feedback_submissions_id_seq to anon;

-- No anonymous SELECT policy: visitors cannot read other submissions with the public key.
