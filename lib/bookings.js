import { DateTime } from "luxon";
import { getSupabaseAdmin } from "./supabase/admin";
import { slotEndToUtc, slotToUtc } from "./calendar";

const TIMEZONE = process.env.BOOKING_TIMEZONE || "Asia/Kolkata";

export async function releaseExpiredPendingBookings() {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("bookings")
    .update({ status: "expired", updated_at: now })
    .eq("status", "payment_pending")
    .lt("hold_expires_at", now);
  if (error) throw error;
}

export async function createPendingBooking({ service, name, phone, email, date, time, question, amount }) {
  await releaseExpiredPendingBookings();
  const supabase = getSupabaseAdmin();
  const start = slotToUtc(date, time);
  const end = slotEndToUtc(date, time);
  const holdMinutes = Number(process.env.BOOKING_HOLD_MINUTES || 10);
  const expires = DateTime.utc().plus({ minutes: holdMinutes }).toISO();

  const payload = {
    service,
    customer_name: name,
    customer_phone: phone,
    customer_email: email || null,
    appointment_date: date,
    appointment_start: start,
    appointment_end: end,
    appointment_time: time,
    timezone: TIMEZONE,
    question: question || null,
    amount_paise: Math.round(Number(amount) * 100),
    currency: "INR",
    status: "payment_pending",
    hold_expires_at: expires,
  };

  const { data, error } = await supabase.from("bookings").insert(payload).select("id, status, hold_expires_at").single();
  if (error) {
    if (error.code === "23505") {
      const conflict = new Error("That appointment slot is currently being booked by another customer. Please choose another time.");
      conflict.code = "SLOT_CONFLICT";
      throw conflict;
    }
    throw error;
  }
  return data;
}

export async function getBooking(id) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("bookings").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function updateBooking(id, values) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("bookings")
    .update({ ...values, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function confirmPaidBooking(id, paymentId) {
  const booking = await getBooking(id);

  // Idempotent: Razorpay can deliver the same webhook more than once.
  if (booking.status === "confirmed" && booking.razorpay_payment_id === paymentId) {
    return booking;
  }

  if (["cancelled", "expired"].includes(booking.status)) {
    throw new Error("Cannot confirm a cancelled or expired booking.");
  }

  return updateBooking(id, {
    razorpay_payment_id: paymentId,
    payment_verified_at: booking.payment_verified_at || new Date().toISOString(),
    status: "confirmed",
    confirmed_at: booking.confirmed_at || new Date().toISOString(),
    error_message: null,
  });
}

export async function cancelBooking(id, reason = "") {
  return updateBooking(id, { status: "cancelled", error_message: reason || null });
}

function normalizeTime(value) {
  return String(value || "").slice(0, 5);
}

export async function getHeldSlots(date) {
  await releaseExpiredPendingBookings();
  const supabase = getSupabaseAdmin();
  const now = DateTime.utc();
  const { data, error } = await supabase
    .from("bookings")
    .select("appointment_time, status, hold_expires_at")
    .eq("appointment_date", date)
    .in("status", ["payment_pending", "paid", "confirmed"]);
  if (error) throw error;
  return (data || [])
    .filter((row) => row.status !== "payment_pending" || (row.hold_expires_at && DateTime.fromISO(row.hold_expires_at) > now))
    .map((row) => normalizeTime(row.appointment_time));
}

export async function getBlockedSlots(date) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("blocked_slots")
    .select("appointment_time, reason")
    .eq("appointment_date", date);
  if (error) throw error;
  return (data || []).map((row) => ({
    ...row,
    appointment_time: normalizeTime(row.appointment_time),
  }));
}

export async function getAvailableSlots(date, generateSlots) {
  const [held, blocked] = await Promise.all([getHeldSlots(date), getBlockedSlots(date)]);
  const unavailable = new Set([
    ...held,
    ...blocked.map((row) => row.appointment_time),
  ]);
  return generateSlots(date).filter((slot) => !unavailable.has(slot.start));
}
