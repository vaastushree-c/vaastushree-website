import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "../../../../lib/adminAuth";
import { cancelBooking } from "../../../../lib/bookings";

export async function POST(request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { bookingId, reason } = await request.json();
    if (!bookingId) return NextResponse.json({ error: "Booking ID is required." }, { status: 400 });
    const booking = await cancelBooking(bookingId, reason || "Cancelled by admin");
    return NextResponse.json({ ok: true, booking });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to cancel appointment." }, { status: 500 });
  }
}
