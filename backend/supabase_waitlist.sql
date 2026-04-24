create table if not exists public.waitlist_customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text,
  phone text,
  message text not null,
  source text not null default 'legacyx',
  created_at timestamptz not null default now()
);

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'waitlist_customers_email_key'
  ) then
    alter table public.waitlist_customers
      drop constraint waitlist_customers_email_key;
  end if;
end $$;

create unique index if not exists waitlist_customers_email_source_key
  on public.waitlist_customers (email, source);

alter table public.waitlist_customers enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'waitlist_customers'
      and policyname = 'Allow insert for anon'
  ) then
    create policy "Allow insert for anon"
      on public.waitlist_customers
      for insert
      to anon, authenticated
      with check (true);
  end if;
end $$;
