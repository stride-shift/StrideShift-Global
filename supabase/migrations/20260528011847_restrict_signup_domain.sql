-- Enforce that only @strideshift.ai (and subdomains) emails get profiles.
-- The Supabase auth.users INSERT trigger handle_new_user runs SECURITY DEFINER
-- so we can RAISE EXCEPTION to abort the whole transaction — including the
-- auth.users row itself. That blocks API-level sign-ups from other domains.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  inv record;
  allowed_domain text := 'strideshift.ai';
begin
  -- Block any email that isn't on strideshift.ai or a subdomain of it.
  if new.email is null
     or lower(new.email) !~ ('@([a-z0-9-]+\.)*' || allowed_domain || '$') then
    raise exception 'Sign-up restricted to % email addresses', allowed_domain
      using errcode = 'check_violation';
  end if;

  select * into inv from public.pending_invitations
    where email = new.email and consumed_at is null limit 1;

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

  if inv.id is not null then
    update public.pending_invitations set consumed_at = now() where id = inv.id;
  end if;

  return new;
end;
$$;

notify pgrst, 'reload schema';
