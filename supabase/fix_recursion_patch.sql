-- One-time patch: fixes infinite recursion between the postcards and
-- postcard_recipients RLS policies. Safe to run once against the schema
-- you already applied. (schema.sql has been updated to include this fix
-- for future fresh installs — you won't need this file again.)

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

drop policy "Postcards are viewable by their audience" on public.postcards;
create policy "Postcards are viewable by their audience"
  on public.postcards for select
  using (
    visibility = 'public'
    or sender_id = auth.uid()
    or (visibility = 'friends' and public.are_friends(sender_id, auth.uid()))
    or (visibility = 'direct' and public.is_postcard_recipient(id, auth.uid()))
  );

drop policy "Sender or recipient can view mailbox rows" on public.postcard_recipients;
create policy "Sender or recipient can view mailbox rows"
  on public.postcard_recipients for select
  using (
    auth.uid() = recipient_id
    or public.owns_postcard(postcard_id, auth.uid())
  );

drop policy "Senders can address their own postcards" on public.postcard_recipients;
create policy "Senders can address their own postcards"
  on public.postcard_recipients for insert
  with check (public.owns_postcard(postcard_id, auth.uid()));
