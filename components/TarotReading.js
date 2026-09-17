"use client";
import { useState } from "react";
import { ArrowRight, Check, Heart, Compass, Sparkles, CreditCard } from "lucide-react";

import { startRazorpayPayment } from "../lib/razorpay";
import AppointmentPicker from "./AppointmentPicker";

export default function TarotReading() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", date: "", time: "", question: "" });
  const [status, setStatus] = useState("");
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    if (!form.date || !form.time) { setStatus("Please choose an available appointment date and time."); return; }
    setStatus("Creating secure payment...");
    try {
      await startRazorpayPayment({
        service: "Tarot Reading",
        prefill: { name: form.name, contact: form.phone, email: form.email || undefined },
        notes: { question: form.question || "Not specified" },
        booking: { ...form, service: "Tarot Reading" },
        onStatus: setStatus,
      });
      setStatus("Appointment confirmed successfully. Your booking has been recorded.");
    } catch(error) { setStatus(error.message || "Something went wrong. Please try again."); }
  };

  return (
    <main className="tarot-page">
      <section className="tarot-hero">
        <div className="tarot-hero-image"><img src="https://images.pexels.com/photos/31584175/pexels-photo-31584175.jpeg?auto=compress&cs=tinysrgb&w=2400&dpr=2" alt="Tarot cards, crystals and candles" /></div>
        <div className="tarot-hero-overlay" />
        <div className="container tarot-hero-content">
          <div className="eyebrow tarot-eyebrow">Tarot Reading</div>
          <h1>Clarity for <span>Your Journey.</span></h1>
          <p>Gain a fresh perspective and thoughtful guidance through a private tarot session focused on the question or situation that matters to you.</p>
          <a className="btn tarot-btn" href="#tarot-book">Book a Tarot Reading <ArrowRight size={18}/></a>
          <div className="tarot-trust">Private • Confidential • Personalised Session</div>
        </div>
        <div className="floating-card floating-card-one">✦</div>
        <div className="floating-card floating-card-two">☾</div>
      </section>

      <section className="section tarot-benefits">
        <div className="container">
          <div className="eyebrow">A quieter kind of guidance</div>
          <h2 className="title">Use the cards to <span className="gold">see more clearly.</span></h2>
          <p className="copy">Tarot can be used as a reflective tool to explore possibilities, patterns and the choices in front of you — without promising certainty about the future.</p>
          <div className="tarot-benefit-grid">
            <Benefit icon={Heart} title="Relationships" text="Explore emotions, communication and relationship dynamics." />
            <Benefit icon={Compass} title="Life Direction" text="Bring structure to questions around choices, priorities and next steps." />
            <Benefit icon={Sparkles} title="Personal Growth" text="Reflect on patterns, confidence and opportunities for change." />
            <Benefit icon={Check} title="A Fresh Perspective" text="Step back from a situation and approach it with greater clarity." />
          </div>
        </div>
      </section>

      <section className="tarot-book-section" id="tarot-book">
        <div className="container tarot-book-grid">
          <div className="tarot-detail-image"><img src="https://images.pexels.com/photos/31584175/pexels-photo-31584175.jpeg?auto=compress&cs=tinysrgb&w=2200&dpr=2" alt="Tarot cards with crystals and candle" loading="lazy" /></div>
          <form className="card tarot-form" onSubmit={submit}>
            <div className="eyebrow" style={{textAlign:"left"}}>Private Tarot Session</div>
            <h2>Book Your Tarot Reading</h2>
            <p>Choose an available time and complete payment. The selected appointment is confirmed after payment verification.</p>
            <div className="form-grid">
              <Field label="Your Name *" name="name" value={form.name} onChange={update} placeholder="Full name" required />
              <Field label="WhatsApp / Phone *" name="phone" value={form.phone} onChange={update} placeholder="+91 98765 43210" type="tel" required />
              <Field label="Email" name="email" value={form.email} onChange={update} placeholder="you@example.com" type="email" />
              <AppointmentPicker date={form.date} time={form.time} onChange={(next) => setForm((current) => ({ ...current, ...next }))} />
              <div className="field full">
                <label htmlFor="question">What would you like guidance on?</label>
                <textarea id="question" name="question" value={form.question} onChange={update} placeholder="Optional — relationship, career, decision, personal growth, or another question." />
              </div>
              <button className="btn btn-gold booking-submit full" type="submit"><CreditCard size={18}/> Pay & Confirm Appointment</button>
              {status && <p className="booking-status full" role="status">{status}</p>}
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

function Benefit({ icon: Icon, title, text }) {
  return <article className="tarot-benefit card"><div className="tarot-benefit-icon"><Icon size={21}/></div><h3>{title}</h3><p>{text}</p></article>;
}

function sanitizePhone(value) {
  let cleaned = String(value || "").replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+91")) return "+91" + cleaned.slice(3).replace(/\D/g, "").slice(0, 10);
  if (cleaned.startsWith("+")) return "+" + cleaned.slice(1).replace(/\D/g, "").slice(0, 12);
  return cleaned.replace(/\D/g, "").slice(0, 10);
}

function Field({ label, name, value, onChange, placeholder, type = "text", required = false }) {
  const isPhone = name === "phone";
  const handleChange = (e) => {
    if (!isPhone) return onChange(e);
    onChange({ ...e, target: { ...e.target, value: sanitizePhone(e.target.value) } });
  };
  return <div className="field"><label htmlFor={name}>{label}</label><input id={name} name={name} type={type} value={value} onChange={handleChange} placeholder={placeholder} required={required} inputMode={isPhone ? "tel" : undefined} pattern={isPhone ? "(?:\\+91)?[6-9]\\d{9}" : undefined} maxLength={isPhone ? 13 : undefined}/></div>;
}
