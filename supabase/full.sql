-- Veil / Hacker114 — run this in the Supabase SQL editor (or via CLI)
-- Requires: auth schema (Supabase default), pgcrypto, storage

create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Encrypted cookie jar (values are AES-GCM ciphertext produced by the app)
-- ---------------------------------------------------------------------------
create table if not exists public.proxy_cookies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  domain text not null,
  name text not null,
  path text not null default '/',
  value_enc text not null,
  expires timestamptz,
  secure boolean not null default false,
  http_only boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (user_id, domain, name, path)
);

create index if not exists proxy_cookies_user_idx on public.proxy_cookies (user_id);
alter table public.proxy_cookies enable row level security;

drop policy if exists "cookies_select_own" on public.proxy_cookies;
create policy "cookies_select_own" on public.proxy_cookies
  for select using (auth.uid() = user_id);
drop policy if exists "cookies_insert_own" on public.proxy_cookies;
create policy "cookies_insert_own" on public.proxy_cookies
  for insert with check (auth.uid() = user_id);
drop policy if exists "cookies_update_own" on public.proxy_cookies;
create policy "cookies_update_own" on public.proxy_cookies
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "cookies_delete_own" on public.proxy_cookies;
create policy "cookies_delete_own" on public.proxy_cookies
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Settings, bookmarks, history, passwords, shortcuts, downloads metadata
-- ---------------------------------------------------------------------------
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  payload_enc text not null,
  updated_at timestamptz not null default now()
);
alter table public.user_settings enable row level security;
drop policy if exists "settings_select_own" on public.user_settings;
create policy "settings_select_own" on public.user_settings for select using (auth.uid() = user_id);
drop policy if exists "settings_insert_own" on public.user_settings;
create policy "settings_insert_own" on public.user_settings for insert with check (auth.uid() = user_id);
drop policy if exists "settings_update_own" on public.user_settings;
create policy "settings_update_own" on public.user_settings for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "settings_delete_own" on public.user_settings;
create policy "settings_delete_own" on public.user_settings for delete using (auth.uid() = user_id);

create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  url_enc text not null,
  folder text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists bookmarks_user_idx on public.bookmarks (user_id);
alter table public.bookmarks enable row level security;
drop policy if exists "bookmarks_select_own" on public.bookmarks;
create policy "bookmarks_select_own" on public.bookmarks for select using (auth.uid() = user_id);
drop policy if exists "bookmarks_insert_own" on public.bookmarks;
create policy "bookmarks_insert_own" on public.bookmarks for insert with check (auth.uid() = user_id);
drop policy if exists "bookmarks_update_own" on public.bookmarks;
create policy "bookmarks_update_own" on public.bookmarks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "bookmarks_delete_own" on public.bookmarks;
create policy "bookmarks_delete_own" on public.bookmarks for delete using (auth.uid() = user_id);

create table if not exists public.history_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  url_enc text not null,
  visited_at timestamptz not null default now()
);
create index if not exists history_user_idx on public.history_entries (user_id, visited_at desc);
alter table public.history_entries enable row level security;
drop policy if exists "history_select_own" on public.history_entries;
create policy "history_select_own" on public.history_entries for select using (auth.uid() = user_id);
drop policy if exists "history_insert_own" on public.history_entries;
create policy "history_insert_own" on public.history_entries for insert with check (auth.uid() = user_id);
drop policy if exists "history_delete_own" on public.history_entries;
create policy "history_delete_own" on public.history_entries for delete using (auth.uid() = user_id);

create table if not exists public.saved_passwords (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  origin_enc text not null,
  username_enc text not null,
  password_enc text not null,
  updated_at timestamptz not null default now()
);
alter table public.saved_passwords enable row level security;
drop policy if exists "passwords_select_own" on public.saved_passwords;
create policy "passwords_select_own" on public.saved_passwords for select using (auth.uid() = user_id);
drop policy if exists "passwords_insert_own" on public.saved_passwords;
create policy "passwords_insert_own" on public.saved_passwords for insert with check (auth.uid() = user_id);
drop policy if exists "passwords_update_own" on public.saved_passwords;
create policy "passwords_update_own" on public.saved_passwords for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "passwords_delete_own" on public.saved_passwords;
create policy "passwords_delete_own" on public.saved_passwords for delete using (auth.uid() = user_id);

create table if not exists public.shortcut_bindings (
  user_id uuid not null references auth.users (id) on delete cascade,
  action text not null,
  combo text not null,
  primary key (user_id, action)
);
alter table public.shortcut_bindings enable row level security;
drop policy if exists "shortcuts_select_own" on public.shortcut_bindings;
create policy "shortcuts_select_own" on public.shortcut_bindings for select using (auth.uid() = user_id);
drop policy if exists "shortcuts_insert_own" on public.shortcut_bindings;
create policy "shortcuts_insert_own" on public.shortcut_bindings for insert with check (auth.uid() = user_id);
drop policy if exists "shortcuts_update_own" on public.shortcut_bindings;
create policy "shortcuts_update_own" on public.shortcut_bindings for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "shortcuts_delete_own" on public.shortcut_bindings;
create policy "shortcuts_delete_own" on public.shortcut_bindings for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Filesystem (Chrome / Finder style). Blobs live in storage buckets.
-- ---------------------------------------------------------------------------
create table if not exists public.fs_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  parent_id uuid references public.fs_entries (id) on delete cascade,
  name text not null,
  kind text not null check (kind in ('file', 'folder')),
  mime text,
  size bigint not null default 0,
  storage_path text,
  source_url_enc text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists fs_entries_user_parent_idx on public.fs_entries (user_id, parent_id);
alter table public.fs_entries enable row level security;
drop policy if exists "fs_select_own" on public.fs_entries;
create policy "fs_select_own" on public.fs_entries for select using (auth.uid() = user_id);
drop policy if exists "fs_insert_own" on public.fs_entries;
create policy "fs_insert_own" on public.fs_entries for insert with check (auth.uid() = user_id);
drop policy if exists "fs_update_own" on public.fs_entries;
create policy "fs_update_own" on public.fs_entries for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "fs_delete_own" on public.fs_entries;
create policy "fs_delete_own" on public.fs_entries for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Storage buckets
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit)
values
  ('downloads', 'downloads', false, 52428800),
  ('files', 'files', false, 52428800)
on conflict (id) do nothing;

-- Storage RLS: users may only touch objects under {user_id}/
drop policy if exists "downloads_select_own" on storage.objects;
drop policy if exists "downloads_insert_own" on storage.objects;
drop policy if exists "downloads_update_own" on storage.objects;
drop policy if exists "downloads_delete_own" on storage.objects;
drop policy if exists "files_select_own" on storage.objects;
drop policy if exists "files_insert_own" on storage.objects;
drop policy if exists "files_update_own" on storage.objects;
drop policy if exists "files_delete_own" on storage.objects;

create policy "downloads_select_own" on storage.objects
  for select using (bucket_id = 'downloads' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "downloads_insert_own" on storage.objects
  for insert with check (bucket_id = 'downloads' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "downloads_update_own" on storage.objects
  for update using (bucket_id = 'downloads' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "downloads_delete_own" on storage.objects
  for delete using (bucket_id = 'downloads' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "files_select_own" on storage.objects
  for select using (bucket_id = 'files' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "files_insert_own" on storage.objects
  for insert with check (bucket_id = 'files' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "files_update_own" on storage.objects
  for update using (bucket_id = 'files' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "files_delete_own" on storage.objects
  for delete using (bucket_id = 'files' and auth.uid()::text = (storage.foldername(name))[1]);
