-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES
create table public.profiles (
  id uuid references auth.users not null primary key,
  username text unique,
  avatar_stage int default 1,
  streak int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_active timestamp with time zone default timezone('utc'::text, now())
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- HABITS
create table public.habits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  title text not null,
  category text not null, -- 'training', 'nutrition', 'recovery', 'knowledge'
  frequency text default 'daily',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.habits enable row level security;

create policy "Users can view own habits."
  on habits for select
  using ( auth.uid() = user_id );

create policy "Users can insert own habits."
  on habits for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own habits."
  on habits for update
  using ( auth.uid() = user_id );

create policy "Users can delete own habits."
  on habits for delete
  using ( auth.uid() = user_id );

-- LOGS
create table public.logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  habit_id uuid references public.habits(id) on delete cascade not null,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  date_string text not null -- 'YYYY-MM-DD'
);

alter table public.logs enable row level security;

create policy "Users can view own logs."
  on logs for select
  using ( auth.uid() = user_id );

create policy "Users can insert own logs."
  on logs for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete own logs."
  on logs for delete
  using ( auth.uid() = user_id );

-- RIVALS
create table public.rivals (
  id uuid default uuid_generate_v4() primary key,
  requester_id uuid references public.profiles(id) not null,
  target_id uuid references public.profiles(id) not null,
  status text check (status in ('pending', 'accepted')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.rivals enable row level security;

create policy "Users can view their own rivalries."
  on rivals for select
  using ( auth.uid() = requester_id or auth.uid() = target_id );

create policy "Users can request rivalries."
  on rivals for insert
  with check ( auth.uid() = requester_id );

create policy "Users can update rivalries involved in."
  on rivals for update
  using ( auth.uid() = target_id );

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_stage, streak)
  values (new.id, new.raw_user_meta_data->>'username', 1, 0);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
