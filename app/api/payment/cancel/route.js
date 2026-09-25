import { NextResponse } from "next/server";
import { getBooking, releasePendingBooking } from "../../../../lib/bookings";

export async function POST(request) {
  try {
    const { bookingId, orderId } = await request.json();
    if (!bookingId || !orderId) {
      return NextResponse.json({ released: false, error: "Missing booking details." }, { status: 400 });
    }

    const booking = await getBooking(bookingId);
    if (!booking) return NextResponse.json({ released: false }, { status: 404 });

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return NextResponse.json({ released: false, error: "Payment configuration is unavailable." }, { status: 500 });
    }

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const response = await fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(orderId)}`, {
      headers: { Authorization: `Basic ${auth}` },
      cache: "no-store",
    });
    const order = await response.json();

    // If payment has already completed, never release the appointment hold here.
    if (response.ok && order?.status === "paid") {
      return NextResponse.json({ released: false, paid: true });
    }

    const released = await releasePendingBooking(bookingId, "Customer closed or cancelled Razorpay checkout.");
    return NextResponse.json({ released });
  } catch (error) {
    console.error("Release payment hold error", error);
    return NextResponse.json({ released: false, error: "Unable to release the payment hold." }, { status: 500 });
  }
}
