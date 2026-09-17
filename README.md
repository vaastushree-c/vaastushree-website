# Vaastushree — Next.js + Supabase Appointments + Razorpay

This version uses **Supabase as the single source of truth for appointment availability and bookings**. Google Calendar and Microsoft Calendar are not required.

## Booking flow
1. Customer chooses a service, date, and available slot.
2. The website asks Supabase for current availability.
3. The server creates a temporary `payment_pending` booking hold.
4. Razorpay Test/Live checkout handles payment.
5. The server verifies the Razorpay signature, order amount, service, and booking details.
6. The booking becomes `confirmed` in Supabase.
7. The slot disappears from public availability.

## Admin dashboard
Open `/admin` on the site.

The dashboard is protected by an admin password and lets the practitioner:
- View a daily appointment calendar.
- See customer and payment details for active appointments.
- Block open slots manually.
- Unblock manually blocked slots.
- Cancel an appointment.

Set these environment variables:

```env
ADMIN_PASSWORD=use-a-long-random-password
ADMIN_SESSION_SECRET=use-a-long-random-random-secret
```

The admin session is stored as a signed, httpOnly cookie. Use a strong random password and session secret in production.

## Supabase setup
Run the migrations in order in Supabase SQL Editor:

```text
supabase/migrations/001_booking_system.sql
supabase/migrations/002_supabase_calendar_admin.sql
```

The booking table is protected by RLS and public users do not get direct table access. Server routes use the Supabase server secret.

## Environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SECRET_KEY=YOUR_SUPABASE_SERVER_SECRET

RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=YOUR_RAZORPAY_TEST_SECRET

VASTU_PRICE=1499
TAROT_PRICE=999
NUMEROLOGY_PRICE=999

BOOKING_TIMEZONE=Asia/Kolkata
BOOKING_START_HOUR=10
BOOKING_END_HOUR=19
BOOKING_BREAK_START_HOUR=13
BOOKING_BREAK_END_HOUR=14
BOOKING_DURATION_MINUTES=45
BOOKING_SLOT_INTERVAL_MINUTES=60
BOOKING_HOLD_MINUTES=10

ADMIN_PASSWORD=CHANGE_ME
ADMIN_SESSION_SECRET=CHANGE_ME_TO_A_LONG_RANDOM_STRING
```

## Local test
1. Create `.env.local` using the variables above.
2. Use Razorpay **Test Mode** credentials.
3. Run `npm install` and `npm run dev`.
4. Test a booking at `/property-consultation`, `/book-reading`, or `/numerology`.
5. Verify the resulting row in Supabase `public.bookings`.
6. Open `/admin` to verify the appointment appears and the slot is blocked.

## Production
Before deployment:
- Replace Razorpay test credentials with Live credentials.
- Use a strong `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET`.
- Do not commit `.env.local` or any secrets to GitHub.
- Prefer a paid Supabase plan with backups for a production business database.
