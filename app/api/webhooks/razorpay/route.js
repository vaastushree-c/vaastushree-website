import crypto from "crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabase/admin";
import { confirmPaidBooking, getBooking } from "../../../../lib/bookings";
import { refundBookingPayment } from "../../../../lib/refunds";

export const dynamic = "force-dynamic";

function validSignature(rawBody, signature, secret) {
  if (!signature || !secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  if (expected.length !== signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export async function POST(request) {
  const rawBody = await request.text();
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) return NextResponse.json({ error: "Webhook secret is not configured." }, { status: 500 });
  if (!validSignature(rawBody, request.headers.get("x-razorpay-signature"), webhookSecret)) return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });

  try {
    const payload = JSON.parse(rawBody);
    const event = payload?.event;
    const payment = payload?.payload?.payment?.entity;
    if (!payment?.id) return NextResponse.json({ ok: true });

    const supabase = getSupabaseAdmin();
    const orderId = payment.order_id;
    const { data: booking, error } = await supabase.from("bookings").select("*").eq("razorpay_order_id", orderId).maybeSingle();
    if (error) throw error;
    if (!booking) return NextResponse.json({ ok: true });

    if (event === "payment.captured") {
      if (Number(payment.amount) !== Number(booking.amount_paise) || payment.currency !== booking.currency) {
        await supabase.from("bookings").update({ error_message: "Webhook payment amount/currency mismatch.", updated_at: new Date().toISOString() }).eq("id", booking.id);
        return NextResponse.json({ error: "Payment validation failed." }, { status: 400 });
      }

      if (["cancelled", "expired"].includes(booking.status)) {
        if (booking.razorpay_payment_id !== payment.id) {
          const updated = await supabase.from("bookings").update({ razorpay_payment_id: payment.id, payment_verified_at: new Date().toISOString(), refund_status: "pending" }).eq("id", booking.id).select("*").single();
          if (updated.error) throw updated.error;
          try { await refundBookingPayment(updated.data); } catch (refundError) {
            await supabase.from("bookings").update({ refund_status: "failed", error_message: `Payment was captured after the booking expired; automatic refund failed: ${refundError.message}`, updated_at: new Date().toISOString() }).eq("id", booking.id);
            return NextResponse.json({ error: "Refund required but could not be completed." }, { status: 502 });
          }
        }
        return NextResponse.json({ ok: true });
      }

      await confirmPaidBooking(booking.id, payment.id);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Razorpay webhook error", error);
    return NextResponse.json({ error: error.message || "Webhook processing failed." }, { status: 500 });
  }
}
