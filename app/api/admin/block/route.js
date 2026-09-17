import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "../../../../lib/adminAuth";
import { getSupabaseAdmin } from "../../../../lib/supabase/admin";
import { slotToUtc, slotEndToUtc } from "../../../../lib/calendar";

export async function POST(request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { date, time, reason } = await request.json();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "") || !/^\d{2}:\d{2}$/.test(time || "")) return NextResponse.json({ error: "Valid date and time are required." }, { status: 400 });
    const supabase = getSupabaseAdmin();
    const { data: conflict, error: conflictError } = await supabase
      .from("bookings")
      .select("id")
      .eq("appointment_date", date)
      .eq("appointment_time", time)
      .in("status", ["payment_pending", "paid", "confirmed"])
      .limit(1)
      .maybeSingle();
    if (conflictError) throw conflictError;
    if (conflict) return NextResponse.json({ error: "That slot already has an appointment." }, { status: 409 });

    const { data: existingBlock, error: existingBlockError } = await supabase
      .from("blocked_slots")
      .select("id")
      .eq("appointment_date", date)
      .eq("appointment_time", time)
      .limit(1)
      .maybeSingle();
    if (existingBlockError) throw existingBlockError;
    if (existingBlock) return NextResponse.json({ error: "That slot is already blocked." }, { status: 409 });

    const { error } = await supabase.from("blocked_slots").insert({
      appointment_date: date,
      appointment_time: time,
      appointment_start: slotToUtc(date, time),
      appointment_end: slotEndToUtc(date, time),
      reason: reason || "Blocked by admin",
    });
    if (error?.code === "23505") return NextResponse.json({ error: "That slot is already blocked." }, { status: 409 });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to block slot." }, { status: 500 });
  }
}
