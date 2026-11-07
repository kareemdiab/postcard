-- Run this once in the Supabase SQL editor for a fresh project.

-- Profiles -----------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row whenever someone signs up
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Friendships ----------------------------------------------------------------
create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  addressee_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  unique (requester_id, addressee_id),
  check (requester_id <> addressee_id)
);

alter table public.friendships enable row level security;

create policy "Users can view friendships they're part of"
  on public.friendships for select
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

create policy "Users can send friend requests"
  on public.friendships for insert
  with check (auth.uid() = requester_id);

create policy "Recipients can respond to friend requests"
  on public.friendships for update
  using (auth.uid() = addressee_id)
  with check (auth.uid() = addressee_id);

create policy "Either side can remove a friendship"
  on public.friendships for delete
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- Bypasses RLS (security definer) so it can be used inside the postcards policy below.
create function public.are_friends(a uuid, b uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.friendships
    where status = 'accepted'
      and ((requester_id = a and addressee_id = b) or (requester_id = b and addressee_id = a))
  );
$$;

-- Postcards --------------------------------------------------------------
create table public.postcards (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  image_url text not null,
  message text not null,
  visibility text not null check (visibility in ('public', 'friends', 'direct')),
  stamp_id text not null default 'compass',
  created_at timestamptz not null default now()
);

-- Postcard recipients (drives the mailbox for direct sends) ------------------
-- Created before the postcards RLS policies below, since one of them references this table.
create table public.postcard_recipients (
  postcard_id uuid not null references public.postcards(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  read_at timestamptz,
  primary key (postcard_id, recipient_id)
);

-- These two tables' RLS policies each need to check a fact about the other
-- table (is this postcard addressed to me / do I own this postcard). A plain
-- EXISTS subquery on the other table would re-trigger that table's own RLS,
-- which loops back here — infinite recursion. Security-definer functions
-- bypass RLS so the check runs once, plainly, with no re-triggering.
create function public.owns_postcard(p_postcard_id uuid, p_user_id uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.postcards where id = p_postcard_id and sender_id = p_user_id
  );
$$;

create function public.is_postcard_recipient(p_postcard_id uuid, p_user_id uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.postcard_recipients
    where postcard_id = p_postcard_id and recipient_id = p_user_id
  );
$$;

alter table public.postcards enable row level security;

create policy "Postcards are viewable by their audience"
  on public.postcards for select
  using (
    visibility = 'public'
    or sender_id = auth.uid()
    or (visibility = 'friends' and public.are_friends(sender_id, auth.uid()))
    or (visibility = 'direct' and public.is_postcard_recipient(id, auth.uid()))
  );

create policy "Users can send their own postcards"
  on public.postcards for insert
  with check (auth.uid() = sender_id);

create policy "Senders can delete their own postcards"
  on public.postcards for delete
  using (auth.uid() = sender_id);

alter table public.postcard_recipients enable row level security;

create policy "Sender or recipient can view mailbox rows"
  on public.postcard_recipients for select
  using (
    auth.uid() = recipient_id
    or public.owns_postcard(postcard_id, auth.uid())
  );

create policy "Senders can address their own postcards"
  on public.postcard_recipients for insert
  with check (public.owns_postcard(postcard_id, auth.uid()));

create policy "Recipients can mark their own mail as read"
  on public.postcard_recipients for update
  using (auth.uid() = recipient_id)
  with check (auth.uid() = recipient_id);

-- Storage ------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('postcard-images', 'postcard-images', true)
on conflict (id) do nothing;

create policy "Postcard images are publicly viewable"
  on storage.objects for select
  using (bucket_id = 'postcard-images');

create policy "Authenticated users can upload postcard images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'postcard-images');
