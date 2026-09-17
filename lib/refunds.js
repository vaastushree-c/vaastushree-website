import { getSupabaseAdmin } from "./supabase/admin";

function razorpayAuth() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error("Razorpay credentials are not configured on the server.");
  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
}

export async function createRazorpayRefund({ paymentId, amountPaise, notes = {} }) {
  const response = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}/refund`, {
    method: "POST",
    headers: { Authorization: razorpayAuth(), "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: Number(amountPaise),
      speed: "normal",
      notes,
    }),
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok) {
    const message = data?.error?.description || data?.error?.reason || "Unable to create Razorpay refund.";
    const error = new Error(message);
    error.status = response.status;
    error.razorpay = data;
    throw error;
  }
  return data;
}

export async function refundBookingPayment(booking) {
  if (!booking?.razorpay_payment_id) {
    return { refunded: false, status: "not_applicable", reason: "No captured Razorpay payment is attached to this booking." };
  }
  if (booking.refund_status === "refunded" && booking.razorpay_refund_id) {
    return {
      refunded: true,
      status: "refunded",
      refundId: booking.razorpay_refund_id,
      amountPaise: booking.refunded_amount_paise,
    };
  }

  const supabase = getSupabaseAdmin();
  const amountPaise = Number(booking.amount_paise);
  const refund = await createRazorpayRefund({
    paymentId: booking.razorpay_payment_id,
    amountPaise,
    notes: { booking_id: booking.id, reason: booking.cancellation_reason || "Cancelled by admin" },
  });

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("bookings")
    .update({
      refund_status: "refunded",
      razorpay_refund_id: refund.id,
      refunded_amount_paise: Number(refund.amount || amountPaise),
      refunded_at: now,
      status: "cancelled",
      updated_at: now,
    })
    .eq("id", booking.id)
    .select("*")
    .single();
  if (error) throw error;

  return { refunded: true, status: "refunded", refundId: refund.id, amountPaise: data.refunded_amount_paise, booking: data };
}
