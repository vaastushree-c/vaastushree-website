"use client";

import { useState } from "react";
import { CreditCard, Loader2, ShieldCheck } from "lucide-react";
import { startRazorpayPayment } from "../lib/razorpay";
import AppointmentPicker from "./AppointmentPicker";

const SERVICES = ["Vastu Property Consultation", "Tarot Reading", "Numerology Consultation"];

export default function Booking() {
  const [form, setForm] = useState({ name:"", phone:"", email:"", reading:SERVICES[0], date:"", time:"", question:"" });
  const [status, setStatus] = useState("");
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const updateAppointment = (next) => setForm((current) => ({ ...current, ...next }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.date || !form.time) { setStatus("Please choose an available appointment date and time."); return; }
    setStatus("Creating secure payment...");
    try {
      await startRazorpayPayment({
        service: form.reading,
        prefill: { name: form.name, contact: form.phone, email: form.email || undefined },
        notes: { question: form.question || "Not specified" },
        booking: form,
        onStatus: setStatus,
      });
      setStatus("Appointment confirmed. A confirmation details will be shown after payment.");
    } catch (error) { setStatus(error.message || "Something went wrong. Please try again."); }
  };

  const busy = status.includes("Creating secure payment") || status.includes("Verifying payment");
  return (
    <section className="section booking" id="booking">
      <div className="container">
        <div className="eyebrow">Book a Consultation or Reading</div>
        <h2 className="title">Ready to <span className="gold">Get Started?</span></h2>
        <p className="copy">Choose your service, pick an available appointment slot and complete payment. Your selected time is confirmed only after payment is verified.</p>
        <form className="booking-shell card" onSubmit={submit}>
          <div className="form-grid">
            <Field l="Your Name *" n="name" v={form.name} u={update} p="Your full name" r />
            <Field l="WhatsApp / Phone *" n="phone" v={form.phone} u={update} p="+91 98765 43210" r t="tel" />
            <Field l="Email" n="email" v={form.email} u={update} p="you@example.com" t="email" />
            <div className="field">
              <label htmlFor="reading">Choose Service *</label>
              <select id="reading" name="reading" value={form.reading} onChange={update}>
                {SERVICES.map((service) => <option key={service}>{service}</option>)}
              </select>
            </div>
            <AppointmentPicker date={form.date} time={form.time} onChange={updateAppointment} />
            <div className="field full">
              <label htmlFor="question">Property / Consultation Details</label>
              <textarea id="question" name="question" value={form.question} onChange={update} placeholder="Optional — tell us about the property or what you would like the consultation to cover." />
            </div>
            {form.date && form.time && <div className="booking-summary full"><strong>Selected:</strong> {formatDate(form.date)} at {formatTime(form.time)} · {form.reading}</div>}
            <button className="btn btn-gold booking-submit full" disabled={busy} type="submit">
              {busy ? <Loader2 size={18} className="spin" /> : <CreditCard size={18} />}
              {busy ? status : "Pay & Confirm Appointment"}
            </button>
          </div>
          <div className="booking-payment-note"><ShieldCheck size={16} /><span>Secure payment via Razorpay. The server verifies your payment and confirms the appointment.</span></div>
          {status && <p className={status.startsWith("Appointment confirmed") ? "booking-confirmed" : "booking-status"} role="status">{status}</p>}
        </form>
      </div>
    </section>
  );
}

function Field({ l, n, v, u, p, r, t="text" }) { return <div className="field"><label htmlFor={n}>{l}</label><input id={n} name={n} type={t} value={v} onChange={u} placeholder={p} required={r} /></div>; }
function formatTime(value) { const [h,m]=value.split(":").map(Number); const d=new Date(); d.setHours(h,m); return d.toLocaleTimeString("en-IN",{hour:"numeric",minute:"2-digit"}); }
function formatDate(value) { return new Date(`${value}T12:00:00`).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}); }
