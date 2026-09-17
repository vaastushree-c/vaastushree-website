import crypto from "crypto";
import { NextResponse } from "next/server";
import { generateSlots } from "../../../../lib/calendar";
import { getAvailableSlots, getBooking, updateBooking, releaseExpiredPendingBookings } from "../../../../lib/bookings";

const SERVICES = {
  "Vastu Property Consultation": process.env.VASTU_PRICE,
  "Tarot Reading": process.env.TAROT_PRICE,
  "Numerology Consultation": process.env.NUMEROLOGY_PRICE,
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { orderId, paymentId, signature, booking, bookingId } = body;
    if (!orderId || !paymentId || !signature || !bookingId || !booking?.service || !booking?.date || !booking?.time || !booking?.name || !booking?.phone) {
      return NextResponse.json({ error: "Missing payment or booking details." }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    const keyId = process.env.RAZORPAY_KEY_ID;
    if (!secret || !keyId) return NextResponse.json({ error: "Razorpay credentials are not configured on the server." }, { status: 500 });

    const expectedSignature = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
    const isValid = expectedSignature.length === signature.length && crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature));
    if (!isValid) return NextResponse.json({ verified: false, error: "Invalid payment signature." }, { status: 400 });

    const orderResponse = await fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(orderId)}`, { headers: { Authorization: `Basic ${Buffer.from(`${keyId}:${secret}`).toString("base64")}` }, cache: "no-store" });
    const order = await orderResponse.json();
    if (!orderResponse.ok) return NextResponse.json({ error: "Unable to validate the Razorpay order." }, { status: 502 });

    await releaseExpiredPendingBookings();
    const storedBooking = await getBooking(bookingId);
    if (storedBooking.razorpay_order_id && storedBooking.razorpay_order_id !== orderId) return NextResponse.json({ verified: false, error: "This payment does not match the booking." }, { status: 400 });
    if (storedBooking.status === "confirmed" && storedBooking.razorpay_payment_id === paymentId) return NextResponse.json({ verified: true, appointmentCreated: true, bookingId, paymentId, orderId });

    const normalizeTime = (value) => String(value || "").slice(0, 5);
    const bookingMatches = storedBooking.service === booking.service && String(storedBooking.appointment_date) === String(booking.date) && normalizeTime(storedBooking.appointment_time) === normalizeTime(booking.time) && String(storedBooking.customer_name || "").trim() === String(booking.name || "").trim() && String(storedBooking.customer_phone || "").trim() === String(booking.phone || "").trim();
    const expectedAmount = Number(storedBooking.amount_paise);
    const orderAmountMatches = Number(order.amount) === expectedAmount;
    const servicePriceMatches = Number(SERVICES[booking.service]) * 100 === expectedAmount;
    if (!bookingMatches || !SERVICES[booking.service] || !orderAmountMatches || !servicePriceMatches || order.currency !== "INR") return NextResponse.json({ verified: false, error: "Payment amount or booking details do not match the server record." }, { status: 400 });

    if (storedBooking.status === "cancelled" || storedBooking.status === "expired") return NextResponse.json({ verified: false, error: "This booking hold has expired. Please choose another appointment slot." }, { status: 409 });

    await updateBooking(bookingId, { razorpay_payment_id: paymentId, payment_verified_at: new Date().toISOString(), status: "paid" });

    const available = (await getAvailableSlots(storedBooking.appointment_date, generateSlots)).some((slot) => slot.start === normalizeTime(storedBooking.appointment_time));
    if (!available && storedBooking.status !== "payment_pending") {
      await updateBooking(bookingId, { status: "paid", error_message: "Payment verified; slot was already confirmed by this booking." });
    }

    const saved = await updateBooking(bookingId, { status: "confirmed", confirmed_at: new Date().toISOString(), error_message: null });
    return NextResponse.json({ verified: true, appointmentCreated: true, bookingId: saved.id, paymentId, orderId });
  } catch (error) {
    console.error("Payment verification error", error);
    return NextResponse.json({ error: error.message || "Payment verification failed." }, { status: 500 });
  }
}
