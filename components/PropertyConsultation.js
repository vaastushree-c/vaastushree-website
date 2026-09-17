"use client";

import { Building2, Check, Home, CreditCard, Store, ArrowRight, Loader2 } from "lucide-react";
import { startRazorpayPayment } from "../lib/razorpay";
import { useState } from "react";
import AppointmentPicker from "./AppointmentPicker";

const WHATSAPP_NUMBER = "9199937656959";

const types = [
  {
    id: "home",
    icon: Home,
    title: "Home / Residential",
    text: "Vastu consultation for apartments, houses, villas and residential properties.",
    points: ["Main entrance & directions", "Bedroom & kitchen placement", "Puja / meditation space", "Practical Vastu suggestions"],
    image: "https://images.pexels.com/photos/10610731/pexels-photo-10610731.jpeg?auto=compress&cs=tinysrgb&w=2200&dpr=2"
  },
  {
    id: "office",
    icon: Building2,
    title: "Office",
    text: "Vastu guidance for workspaces, cabins, reception areas and office layouts.",
    points: ["Owner & cabin placement", "Workstation planning", "Reception & meeting areas", "Entrance & directional guidance"],
    image: "https://images.pexels.com/photos/28461045/pexels-photo-28461045.jpeg?auto=compress&cs=tinysrgb&w=2200&dpr=2"
  },
  {
    id: "commercial",
    icon: Store,
    title: "Commercial Property",
    text: "Vastu consultation for shops, showrooms, clinics, restaurants and other commercial spaces.",
    points: ["Customer entrance & flow", "Cash counter placement", "Staff & storage areas", "Commercial layout guidance"],
    image: "https://images.pexels.com/photos/36757760/pexels-photo-36757760.jpeg?auto=compress&cs=tinysrgb&w=2200&dpr=2"
  }
];

export default function PropertyConsultation() {
  const [selected, setSelected] = useState("home");
  const [form, setForm] = useState({
    name: "", phone: "", email: "", property: "Home / Residential",
    location: "", size: "", preferred: "", appointmentDate: "", time: "", details: ""
  });
  const [status, setStatus] = useState("");

  const choose = (item) => {
    setSelected(item.id);
    setForm({ ...form, property: item.title });
  };

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.appointmentDate || !form.time) { setStatus("Please choose an available appointment date and time."); return; }
    setStatus("Creating secure payment...");
    try {
      await startRazorpayPayment({
        service: "Vastu Property Consultation",
        prefill: { name: form.name, contact: form.phone, email: form.email || undefined },
        notes: { property_type: form.property, property_location: form.location },
        booking: {
          name: form.name, phone: form.phone, email: form.email || "",
          service: "Vastu Property Consultation", date: form.appointmentDate, time: form.time,
          question: [
            `Property Type: ${form.property}`,
            `Property Location: ${form.location}`,
            `Property Size: ${form.size || "Not provided"}`,
            `Property Details: ${form.details || "Not provided"}`,
          ].join("\n"),
        },
        onStatus: setStatus,
      });
      setStatus("Appointment confirmed successfully. Your booking has been recorded.");
    } catch (error) { setStatus(error.message || "Something went wrong. Please try again."); }
  };

  return (
    <section className="section property-consultation" id="property-consultation">
      <div className="container">
        <div className="property-intro-grid">
          <div className="property-intro-copy">
            <div className="eyebrow" style={{textAlign:"left"}}>Vastu Property Consultation</div>
            <h1 className="title" style={{textAlign:"left",marginLeft:0}}>
              Bring Balance to <span className="gold">Your Property.</span>
            </h1>
            <p className="copy" style={{textAlign:"left",marginLeft:0}}>
              Practical Vastu guidance for homes, offices and commercial properties — designed to help you understand your space and make confident decisions.
            </p>
          </div>
          <div className="property-hero-image"><img src="https://images.pexels.com/photos/14686150/pexels-photo-14686150.jpeg?auto=compress&cs=tinysrgb&w=2400&dpr=2" alt="Contemporary luxury home surrounded by greenery" /></div>
        </div>
        <div className="property-intro-note">Select your property type below and request a convenient call.</div>

        <div className="property-cards">
          {types.map((item) => {
            const Icon = item.icon;
            const active = selected === item.id;

            return (
              <button
                type="button"
                className={`property-card card ${active ? "property-card-active" : ""}`}
                key={item.id}
                onClick={() => choose(item)}
              >
                <div className={`property-card-image property-card-image-${item.id}`}><img src={item.image} alt={item.title} loading="lazy" /></div>
                <div className="property-icon"><Icon size={29} /></div>
                <h2>{item.title}</h2>
                <p>{item.text}</p>
                <ul>
                  {item.points.map((point) => (
                    <li key={point}><Check size={15} /> {point}</li>
                  ))}
                </ul>
                <span className="property-select">
                  {active ? "Selected" : "Choose This"} <ArrowRight size={16} />
                </span>
              </button>
            );
          })}
        </div>

        <form className="property-form card" onSubmit={submit}>
          <div className="form-heading">
            <div>
              <div className="eyebrow">Request a Call</div>
              <h2>Book Your Property Consultation</h2>
            </div>
            <div className="selected-property">{form.property}</div>
          </div>

          <div className="form-grid">
            <Field label="Your Name *" name="name" value={form.name} onChange={update} placeholder="Full name" required />
            <Field label="WhatsApp / Phone *" name="phone" value={form.phone} onChange={update} placeholder="+91 98765 43210" type="tel" required />
            <Field label="Email" name="email" value={form.email} onChange={update} placeholder="you@example.com" type="email" />
            <Field label="Property Location *" name="location" value={form.location} onChange={update} placeholder="City / Area" required />
            <Field label="Property Size" name="size" value={form.size} onChange={update} placeholder="e.g. 1200 sq. ft." />

            <div className="field">
              <label htmlFor="property">Property Type *</label>
              <select
                id="property"
                name="property"
                value={form.property}
                onChange={update}
              >
                <option>Home / Residential</option>
                <option>Office</option>
                <option>Commercial Property</option>
              </select>
            </div>

            <AppointmentPicker date={form.appointmentDate} time={form.time} onChange={(next) => setForm((current) => ({ ...current, appointmentDate: next.date ?? current.appointmentDate, time: next.time ?? current.time }))} />

            <div className="field full">
              <label htmlFor="details">Tell Us About the Property</label>
              <textarea
                id="details"
                name="details"
                value={form.details}
                onChange={update}
                placeholder="New construction, existing property, floor plan concern, entrance issue, business goals, etc."
              />
            </div>

            <button className="btn btn-gold booking-submit full" disabled={status.includes("Creating secure payment") || status.includes("Verifying payment")} type="submit">
              {status === "Creating secure payment..." || status === "Verifying payment..." ? <Loader2 size={19} className="spin" /> : <CreditCard size={19} />}
              {status.includes("Creating secure payment") || status.includes("Verifying payment") ? status : "Pay & Confirm Appointment"}
            </button>
            {status && <p className="booking-status full" role="status">{status}</p>}
          </div>
        </form>

        <p className="property-note">
          Keep your floor plan, measurements or property details ready if the
          practitioner asks for them during the consultation.
        </p>
      </div>
    </section>
  );
}

function sanitizePhone(value) {
  const raw = String(value || "");
  const hasPlus = raw.trimStart().startsWith("+");
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length > 10) return "+91" + digits.slice(2, 12);
  if (hasPlus) return "+" + digits.slice(0, 12);
  return digits.slice(0, 10);
}

function Field({ label, name, value, onChange, placeholder, type = "text", required = false }) {
  const isPhone = name === "phone";
  const handleChange = (e) => {
    if (!isPhone) return onChange(e);
    const value = sanitizePhone(e.target.value);
    onChange({ target: { name: e.target.name, value } });
  };
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={handleChange}
        autoComplete={isPhone ? "tel" : name === "name" ? "name" : name === "email" ? "email" : "off"}
        autoCapitalize="none"
        autoCorrect="off"
        placeholder={placeholder}
        required={required}
        inputMode={isPhone ? "tel" : undefined}
        pattern={isPhone ? "(?:\\+91)?[6-9]\\d{9}" : undefined}
        maxLength={isPhone ? 13 : undefined}
      />
    </div>
  );
}
