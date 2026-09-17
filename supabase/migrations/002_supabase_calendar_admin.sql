-- Supabase becomes the single source of truth for appointments.
-- Run after 001_booking_system.sql.

create table if not exists public.blocked_slots (
  id uuid primary key default gen_random_uuid(),
  appointment_date date not null,
  appointment_time time not null,
  reason text,
  created_at timestamptz not null default now(),
  unique (appointment_date, appointment_time)
);

create index if not exists blocked_slots_date_idx on public.blocked_slots (appointment_date);

alter table public.blocked_slots enable row level security;
revoke all on public.blocked_slots from anon, authenticated;
grant all on public.blocked_slots to service_role;

-- Keep legacy calendar columns for backward-compatible data, but new bookings no longer use them.
comment on column public.bookings.google_event_id is 'Legacy field; unused when Supabase is the calendar source of truth.';
comment on column public.bookings.google_event_html_link is 'Legacy field; unused when Supabase is the calendar source of truth.';

-- Ensure only active booking states reserve a slot.
drop index if exists public.bookings_active_slot_unique;
create unique index if not exists bookings_active_slot_unique
on public.bookings (appointment_start)
where status in ('payment_pending','paid','confirmed');
