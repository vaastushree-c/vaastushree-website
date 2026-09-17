import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "../../../../lib/adminAuth";
import { getSupabaseAdmin } from "../../../../lib/supabase/admin";

export async function POST(request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { date, time } = await request.json();
    const supabase = getSupabaseAdmin();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "") || !/^\d{2}:\d{2}$/.test(time || "")) {
      return NextResponse.json({ error: "Valid date and time are required." }, { status: 400 });
    }
    const { data, error } = await supabase
      .from("blocked_slots")
      .delete()
      .eq("appointment_date", date)
      .eq("appointment_time", time)
      .select("id");
    if (error) throw error;
    if (!data?.length) return NextResponse.json({ error: "That slot is not currently blocked." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to unblock slot." }, { status: 500 });
  }
}
