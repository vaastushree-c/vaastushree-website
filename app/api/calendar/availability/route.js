import { NextResponse } from "next/server";
import { generateSlots, getCalendarConfig } from "../../../../lib/calendar";
import { getAvailableSlots } from "../../../../lib/bookings";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const date = request.nextUrl.searchParams.get("date");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "")) {
      return NextResponse.json({ error: "A valid date is required." }, { status: 400 });
    }

    const config = getCalendarConfig();
    const slots = await getAvailableSlots(date, generateSlots);
    return NextResponse.json({ date, timezone: config.timezone, durationMinutes: config.durationMinutes, slots });
  } catch (error) {
    console.error("Availability error", error);
    return NextResponse.json({ error: error.message || "Unable to load appointment availability." }, { status: 500 });
  }
}
