-- Vaastushree booking system for Supabase/Postgres
create extension if not exists pgcrypto;

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  service text not null check (service in ('Vastu Property Consultation', 'Tarot Reading', 'Numerology Consultation')),
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  appointment_date date not null,
  appointment_time time not null,
  appointment_start timestamptz not null,
  appointment_end timestamptz not null,
  timezone text not null default 'Asia/Kolkata',
  question text,
  amount_paise integer not null check (amount_paise > 0),
  currency text not null default 'INR',
  status text not null default 'payment_pending' check (status in ('payment_pending','paid','confirmed','cancelled','expired','calendar_failed','paid_calendar_conflict')),
  razorpay_order_id text unique,
  razorpay_payment_id text unique,
  google_event_id text unique,
  google_event_html_link text,
  hold_expires_at timestamptz,
  payment_verified_at timestamptz,
  confirmed_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bookings_appointment_date_idx on public.bookings (appointment_date);
create index if not exists bookings_status_idx on public.bookings (status);
create index if not exists bookings_razorpay_order_idx on public.bookings (razorpay_order_id);

-- One website booking can own a slot at a time. Pending holds expire in application code.
create unique index if not exists bookings_active_slot_unique
on public.bookings (appointment_start)
where status in ('payment_pending','paid','confirmed','calendar_failed','paid_calendar_conflict');

alter table public.bookings enable row level security;

-- No public client access is required; server routes use Supabase's secret/service-role key.
-- This policy intentionally does not grant anon/authenticated access.
revoke all on public.bookings from anon, authenticated;
grant all on public.bookings to service_role;

comment on table public.bookings is 'Paid consultation appointments and temporary checkout holds for Vaastushree.';
