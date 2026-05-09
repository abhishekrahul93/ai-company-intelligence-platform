-- CareerForge production database starter schema.
-- Run this in Supabase SQL editor after creating a project.

create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Untitled Resume',
  template text not null default 'ats',
  resume jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cv_versions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resume_id uuid references public.resumes(id) on delete set null,
  name text not null,
  language text not null,
  format text not null,
  target_country text not null,
  generated_content jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text not null default 'free',
  status text not null default 'inactive',
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.billing_events (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  customer_email text,
  stripe_customer_id text,
  stripe_subscription_id text,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.resumes enable row level security;
alter table public.cv_versions enable row level security;
alter table public.subscriptions enable row level security;
alter table public.billing_events enable row level security;

create policy "Users can manage their resumes"
on public.resumes
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can manage their CV versions"
on public.cv_versions
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can read their subscription"
on public.subscriptions
for select
using (auth.uid() = user_id);

-- No public policy for billing_events. Stripe webhooks insert with the service role key only.
