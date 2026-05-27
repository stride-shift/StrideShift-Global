-- Server-side length + format checks for contact_messages so the same rules
-- enforced by the React form hold even when someone POSTs directly.
alter table public.contact_messages
  drop constraint if exists contact_messages_first_name_chk,
  drop constraint if exists contact_messages_last_name_chk,
  drop constraint if exists contact_messages_email_chk,
  drop constraint if exists contact_messages_company_chk,
  drop constraint if exists contact_messages_message_chk;

alter table public.contact_messages
  add constraint contact_messages_first_name_chk
    check (char_length(first_name) between 1 and 80),
  add constraint contact_messages_last_name_chk
    check (char_length(last_name) between 1 and 80),
  add constraint contact_messages_email_chk
    check (char_length(email) <= 254 and email ~* '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$'),
  add constraint contact_messages_company_chk
    check (company is null or char_length(company) <= 120),
  add constraint contact_messages_message_chk
    check (char_length(message) between 10 and 2000);

notify pgrst, 'reload schema';
