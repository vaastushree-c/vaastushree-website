import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "../../../../lib/adminAuth";
import { getSupabaseAdmin } from "../../../../lib/supabase/admin";
import { generateSlots, getCalendarConfig } from "../../../../lib/calendar";
import { getBlockedSlots, releaseExpiredPendingBookings } from "../../../../lib/bookings";

export const dynamic = "force-dynamic";

export async function GET(request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const date = request.nextUrl.searchParams.get("date");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "")) return NextResponse.json({ error: "A valid date is required." }, { status: 400 });

    await releaseExpiredPendingBookings();
    const supabase = getSupabaseAdmin();
    const [bookingResult, blocked, config] = await Promise.all([
      supabase.from("bookings").select("*").eq("appointment_date", date).order("appointment_start", { ascending: true }),
      getBlockedSlots(date),
      Promise.resolve(getCalendarConfig()),
    ]);
    if (bookingResult.error) throw bookingResult.error;

    const slots = generateSlots(date);
    const appointments = (bookingResult.data || []).filter((b) => ["payment_pending", "paid", "confirmed"].includes(b.status));
    const blockedSet = new Set(blocked.map((b) => String(b.appointment_time).slice(0, 5)));
    const appointmentSet = new Set(appointments.map((b) => String(b.appointment_time).slice(0, 5)));
    const calendar = slots.map((slot) => ({
      ...slot,
      status: blockedSet.has(slot.start) ? "blocked" : appointmentSet.has(slot.start) ? "booked" : "available",
    }));

    return NextResponse.json({ date, timezone: config.timezone, durationMinutes: config.durationMinutes, calendar, appointments, blocked });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to load appointments." }, { status: 500 });
  }
}
