"use client";
import {useState} from "react";
import {ArrowRight, Hash, Compass, BriefcaseBusiness, Heart, Sparkles, CreditCard} from "lucide-react";

import { startRazorpayPayment } from "../lib/razorpay";
import AppointmentPicker from "./AppointmentPicker";


export default function Numerology(){
 const [form,setForm]=useState({name:"",phone:"",email:"",date:"",appointmentDate:"",time:"",question:""});
 const [status,setStatus]=useState("");
 const update=e=>setForm({...form,[e.target.name]:e.target.value});
 const submit=async(e)=>{
  e.preventDefault();
  if(!form.appointmentDate || !form.time){ setStatus("Please choose an available appointment date and time."); return; }
  setStatus("Creating secure payment...");
  try {
   await startRazorpayPayment({
    service:"Numerology Consultation",
    prefill:{name:form.name,contact:form.phone,email:form.email||undefined},
    notes:{date_of_birth:form.date||"Not specified",question:form.question||"Not specified"},
    booking:{...form,date:form.appointmentDate,service:"Numerology Consultation"},
    onStatus:setStatus
   });
   setStatus("Appointment confirmed successfully. Your booking has been recorded.");
  } catch(error){ setStatus(error.message || "Something went wrong. Please try again."); }
 }
 return <main className="numerology-page">
   <section className="numerology-hero">
     <div className="container numerology-hero-grid">
       <div className="numerology-hero-copy">
         <div className="eyebrow">Numerology Consultation</div>
         <h1>Discover the <span>Meaning in Your Numbers.</span></h1>
         <p>Explore your personal numbers and the patterns associated with them through a thoughtful, personalised Numerology consultation.</p>
         <a className="btn btn-gold" href="#numerology-book">Book a Numerology Consultation <ArrowRight size={18}/></a>
         <div className="numerology-trust">Private • Personalised • Reflective Guidance</div>
       </div>
       <div className="numerology-visual">
         <div className="big-number">7</div><div className="small-number n1">1</div><div className="small-number n3">3</div><div className="small-number n9">9</div>
         <div className="visual-center"><Hash size={34}/><strong>YOUR NUMBERS</strong><small>Patterns • Perspective • Possibilities</small></div>
       </div>
     </div>
   </section>

   <section className="section numerology-benefits">
    <div className="container">
      <div className="eyebrow">A Personal Perspective</div>
      <h2 className="title">Numbers can help you <span className="gold">reflect more clearly.</span></h2>
      <p className="copy">A numerology session can be used as a reflective tool to explore personality, goals, relationships and important choices without promising certainty about the future.</p>
      <div className="numerology-benefit-grid">
       <Benefit icon={Hash} title="Personal Numbers" text="Understand the key numbers associated with your date of birth and name."/>
       <Benefit icon={BriefcaseBusiness} title="Career & Goals" text="Use another perspective when thinking about direction, priorities and opportunities."/>
       <Benefit icon={Heart} title="Relationships" text="Explore personal dynamics and communication from a different perspective."/>
       <Benefit icon={Sparkles} title="Clarity" text="Step back, notice patterns and approach your next decision with intention."/>
      </div>
    </div>
   </section>

   <section className="numerology-book-section" id="numerology-book">
    <div className="container numerology-book-grid">
      <div className="numerology-book-art"><div className="book-number">3</div><div className="book-number second">8</div><div className="book-number third">1</div><p>Every number tells a story.<br/>Your consultation explores yours.</p></div>
      <form className="card numerology-form" onSubmit={submit}>
       <div className="eyebrow" style={{textAlign:"left"}}>Private Numerology Session</div>
       <h2>Book Your Consultation</h2>
       <p>Choose an available time and complete payment. The appointment is confirmed after payment verification.</p>
       <div className="form-grid">
        <Field label="Your Name *" name="name" value={form.name} onChange={update} placeholder="Full name" required/>
        <Field label="WhatsApp / Phone *" name="phone" value={form.phone} onChange={update} placeholder="+91 98765 43210" type="tel" required/>
        <Field label="Email" name="email" value={form.email} onChange={update} placeholder="you@example.com" type="email"/>
        <Field label="Date of Birth" name="date" value={form.date} onChange={update} type="date" max={new Date().toISOString().split("T")[0]}/>
        <AppointmentPicker date={form.appointmentDate || ""} time={form.time} onChange={(next)=>setForm(current=>({...current, appointmentDate: next.date ?? current.appointmentDate, time: next.time ?? current.time}))}/>
        <div className="field full"><label htmlFor="question">What would you like guidance on?</label><textarea id="question" name="question" value={form.question} onChange={update} placeholder="Optional — career, relationships, life direction, personal growth, or another area."/></div>
        <button className="btn btn-gold booking-submit full" type="submit"><CreditCard size={18}/> Pay & Confirm Appointment</button>
        {status && <p className="booking-status full" role="status">{status}</p>}
       </div>
      </form>
    </div>
   </section>
 </main>
}
function Benefit({icon:Icon,title,text}){return <article className="numerology-benefit card"><div className="numerology-benefit-icon"><Icon size={21}/></div><h3>{title}</h3><p>{text}</p></article>}
function sanitizePhone(value) {
 let cleaned=String(value||"").replace(/[^\d+]/g,"");
 if(cleaned.startsWith("+91")) return "+91"+cleaned.slice(3).replace(/\D/g,"").slice(0,10);
 if(cleaned.startsWith("+")) return "+"+cleaned.slice(1).replace(/\D/g,"").slice(0,12);
 return cleaned.replace(/\D/g,"").slice(0,10);
}
function Field({label,name,value,onChange,placeholder,type="text",required=false,max}){
 const isPhone=name==="phone";
 const handleChange=(e)=>{
  if(!isPhone) return onChange(e);
  onChange({...e,target:{...e.target,value:sanitizePhone(e.target.value)}});
 };
 return <div className="field"><label htmlFor={name}>{label}</label><input id={name} name={name} type={type} value={value} onChange={handleChange} placeholder={placeholder} required={required} max={max} inputMode={isPhone?"tel":undefined} pattern={isPhone?"(?:\\+91)?[6-9]\\d{9}":undefined} maxLength={isPhone?13:undefined}/></div>
}
