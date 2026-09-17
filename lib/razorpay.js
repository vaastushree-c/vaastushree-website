export function startRazorpayPayment({ service, prefill, notes, booking, onStatus }) {
  return new Promise(async (resolve, reject) => {
    try {
      onStatus?.("Creating secure payment...");
      const orderResponse = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service, booking }),
      });
      const order = await orderResponse.json();
      if (!orderResponse.ok) throw new Error(order.error || "Unable to start payment.");

      await loadRazorpay();

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Vaastushree",
        description: order.service,
        order_id: order.orderId,
        prefill,
        notes: { ...notes, appointment_date: booking?.date, appointment_time: booking?.time },
        theme: { color: "#b88a3b" },
        handler: async (response) => {
          try {
            onStatus?.("Verifying payment & reserving your appointment...");
            const verifyResponse = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                booking,
                bookingId: order.bookingId,
              }),
            });
            const result = await verifyResponse.json();
            if (!verifyResponse.ok || !result.verified || !result.appointmentCreated) {
              throw new Error(result.error || "Payment succeeded, but appointment confirmation failed. Please contact us.");
            }
            resolve({ ...response, ...result });
          } catch (error) {
            reject(error);
          }
        },
        modal: {
          ondismiss: () => {
            onStatus?.("");
            reject(new Error("Payment window closed. No appointment was confirmed."));
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", (response) => reject(new Error(response?.error?.description || "Payment failed. Please try again.")));
      razorpay.open();
    } catch (error) {
      reject(error);
    }
  });
}

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const src = "https://checkout.razorpay.com/v1/checkout.js";
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", () => reject(new Error("Unable to load Razorpay checkout.")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error("Unable to load Razorpay checkout."));
    document.body.appendChild(script);
  });
}
