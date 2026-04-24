-- =========================================
-- RiskRadar schema
-- =========================================
create extension if not exists "uuid-ossp";

-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  company_name text,
  industry text,
  company_size text,
  plan text not null default 'free' check (plan in ('free','pro','business')),
  stripe_customer_id text,
  stripe_subscription_id text,
  assessments_used_this_month int not null default 0,
  usage_reset_at timestamptz not null default date_trunc('month', now()) + interval '1 month',
  created_at timestamptz not null default now()
);

-- QUESTIONS
create table public.questions (
  id uuid primary key default uuid_generate_v4(),
  category text not null check (category in ('network','access','data','compliance','incident')),
  question_text text not null,
  weight numeric not null default 1.0,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

-- ASSESSMENTS
create table public.assessments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  industry text,
  company_size text,
  status text not null default 'draft' check (status in ('draft','scored','exported')),
  risk_score int,
  risk_level text check (risk_level in ('low','medium','high','critical')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RESPONSES
create table public.responses (
  id uuid primary key default uuid_generate_v4(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  answer text not null check (answer in ('yes','no','partial','na')),
  notes text,
  created_at timestamptz not null default now(),
  unique (assessment_id, question_id)
);

-- AI REPORTS
create table public.ai_reports (
  id uuid primary key default uuid_generate_v4(),
  assessment_id uuid not null unique references public.assessments(id) on delete cascade,
  summary text not null,
  recommendations jsonb not null default '[]',
  priority_matrix jsonb not null default '{}',
  quick_wins jsonb not null default '[]',
  generated_at timestamptz not null default now()
);

-- SUBSCRIPTIONS
create table public.subscriptions (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  stripe_customer text,
  stripe_subscription text,
  plan text not null default 'free',
  status text,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  updated_at timestamptz not null default now()
);

-- INDEXES
create index on public.assessments(user_id);
create index on public.responses(assessment_id);
create index on public.questions(category, order_index);

-- AUTO-CREATE PROFILE ON SIGNUP
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name',''));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- UPDATED_AT
create or replace function public.touch_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger trg_assessments_updated
  before update on public.assessments
  for each row execute function public.touch_updated_at();

-- =========================================
-- ROW LEVEL SECURITY
-- =========================================
alter table public.profiles enable row level security;
alter table public.assessments enable row level security;
alter table public.responses enable row level security;
alter table public.ai_reports enable row level security;
alter table public.subscriptions enable row level security;
alter table public.questions enable row level security;

-- profiles
create policy "profiles self read"   on public.profiles for select using (auth.uid() = id);
create policy "profiles self update" on public.profiles for update using (auth.uid() = id);

-- assessments
create policy "assessments self all" on public.assessments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- responses
create policy "responses via assessment" on public.responses
  for all using (exists (
    select 1 from public.assessments a where a.id = assessment_id and a.user_id = auth.uid()
  )) with check (exists (
    select 1 from public.assessments a where a.id = assessment_id and a.user_id = auth.uid()
  ));

-- ai_reports
create policy "reports via assessment" on public.ai_reports
  for select using (exists (
    select 1 from public.assessments a where a.id = assessment_id and a.user_id = auth.uid()
  ));

-- subscriptions
create policy "subscriptions self" on public.subscriptions for select using (auth.uid() = user_id);

-- questions are public-read (authenticated)
create policy "questions read" on public.questions for select using (auth.role() = 'authenticated');
