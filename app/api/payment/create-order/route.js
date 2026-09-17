import { NextResponse } from "next/server";
import { generateSlots } from "../../../../lib/calendar";
import { getAvailableSlots, createPendingBooking, cancelBooking } from "../../../../lib/bookings";

const SERVICES = {
  "Vastu Property Consultation": process.env.VASTU_PRICE,
  "Tarot Reading": process.env.TAROT_PRICE,
  "Numerology Consultation": process.env.NUMEROLOGY_PRICE,
};

export async function POST(request) {
  try {
    const { service, booking } = await request.json();
    const amountInRupees = SERVICES[service];

    if (!service || !amountInRupees) return NextResponse.json({ error: "Invalid service or price not configured." }, { status: 400 });
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) return NextResponse.json({ error: "Razorpay credentials are not configured on the server." }, { status: 500 });

    const amount = Math.round(Number(amountInRupees) * 100);
    if (!Number.isFinite(amount) || amount <= 0) return NextResponse.json({ error: "Invalid service price." }, { status: 500 });
    if (!booking?.date || !booking?.time) return NextResponse.json({ error: "Please choose an appointment date and time." }, { status: 400 });
    const phone = String(booking?.phone || "").replace(/\s+/g, "");
    if (!/^(?:\+91)?[6-9]\d{9}$/.test(phone)) return NextResponse.json({ error: "Please enter a valid Indian phone number." }, { status: 400 });

    const available = (await getAvailableSlots(booking.date, generateSlots)).some((slot) => slot.start === booking.time);
    if (!available) return NextResponse.json({ error: "That appointment slot is no longer available. Please choose another time." }, { status: 409 });

    let pendingBooking;
    try {
      pendingBooking = await createPendingBooking({ service, name: booking.name, phone: booking.phone, email: booking.email || "", date: booking.date, time: booking.time, question: booking.question || "", amount: amountInRupees });
    } catch (error) {
      if (error.code === "SLOT_CONFLICT") return NextResponse.json({ error: error.message }, { status: 409 });
      throw error;
    }

    const receipt = `vaastu_${pendingBooking.id.replace(/-/g, "").slice(0, 20)}`;
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
      body: JSON.stringify({ amount, currency: "INR", receipt, notes: { service, booking_id: pendingBooking.id } }),
      cache: "no-store",
    });
    const data = await response.json();

    if (!response.ok) {
      await cancelBooking(pendingBooking.id, data?.error?.description || "Unable to create Razorpay order.");
      return NextResponse.json({ error: data?.error?.description || "Unable to create Razorpay order." }, { status: response.status });
    }

    const { getSupabaseAdmin } = await import("../../../../lib/supabase/admin");
    const supabase = getSupabaseAdmin();
    const { error: updateError } = await supabase.from("bookings").update({ razorpay_order_id: data.id, updated_at: new Date().toISOString() }).eq("id", pendingBooking.id);
    if (updateError) { await cancelBooking(pendingBooking.id, "Unable to save Razorpay order ID."); throw updateError; }

    return NextResponse.json({ bookingId: pendingBooking.id, orderId: data.id, amount: data.amount, currency: data.currency, keyId, service });
  } catch (error) {
    console.error("Create order error", error);
    return NextResponse.json({ error: error.message || "Unable to create payment order." }, { status: 500 });
  }
}
