-- Invite-only sign-up: only emails sitting in public.pending_invitations
-- (consumed_at is null) may create an auth.users row. Replaces the previous
-- domain-restricted handle_new_user trigger.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  inv record;
begin
  -- Look up a fresh invitation for this email.
  select * into inv from public.pending_invitations
    where email = lower(new.email) and consumed_at is null limit 1;

  -- No invitation? Block the sign-up entirely.
  -- (Raising here aborts the transaction so the auth.users row is rolled back.)
  if inv.id is null then
    raise exception 'No invitation found for %. Ask an admin to invite you first.', new.email
      using errcode = 'check_violation';
  end if;

  insert into public.profiles (id, email, full_name, display_name, is_admin)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    coalesce(inv.display_name, new.raw_user_meta_data->>'full_name'),
    coalesce(inv.is_admin, false)
  )
  on conflict (id) do update set
    display_name = coalesce(excluded.display_name, public.profiles.display_name),
    is_admin = coalesce(excluded.is_admin, public.profiles.is_admin);

  update public.pending_invitations set consumed_at = now() where id = inv.id;

  return new;
end;
$$;

notify pgrst, 'reload schema';
