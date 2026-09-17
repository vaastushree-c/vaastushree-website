-- Refunds + webhook recovery. Run after 002_supabase_calendar_admin.sql.
alter table public.bookings
  add column if not exists refund_status text not null default 'not_applicable' check (refund_status in ('not_applicable','pending','refunded','failed')),
  add column if not exists razorpay_refund_id text unique,
  add column if not exists refunded_amount_paise integer,
  add column if not exists refunded_at timestamptz,
  add column if not exists cancellation_reason text;

create index if not exists bookings_refund_status_idx on public.bookings (refund_status);
create index if not exists bookings_payment_id_idx on public.bookings (razorpay_payment_id);

comment on column public.bookings.refund_status is 'Automatic Razorpay refund state for paid appointments cancelled by admin.';
comment on column public.bookings.razorpay_refund_id is 'Razorpay refund identifier.';
