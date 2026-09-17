"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Clock3, Lock, LogIn, LogOut, RefreshCw, Unlock, XCircle } from "lucide-react";

const TZ = "Asia/Kolkata";
function today() { return new Date().toLocaleDateString("en-CA", { timeZone: TZ }); }
function formatTime(value) { const [h, m] = String(value).slice(0,5).split(":").map(Number); const d = new Date(); d.setHours(h, m, 0, 0); return d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }); }
function formatDate(value) { return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }); }

export default function AdminPage() {
  const [date, setDate] = useState(today());
  const [authed, setAuthed] = useState(null);
  const [password, setPassword] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true); setError("");
    const r = await fetch(`/api/admin/appointments?date=${date}`, { cache: "no-store" });
    const j = await r.json();
    if (r.status === 401) { setAuthed(false); setData(null); setLoading(false); return; }
    if (!r.ok) { setError(j.error || "Unable to load appointments."); setLoading(false); return; }
    setAuthed(true); setData(j); setLoading(false);
  }
  useEffect(() => { load(); }, [date]);

  async function login(e) {
    e.preventDefault(); setError("");
    const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    const j = await r.json();
    if (!r.ok) return setError(j.error || "Unable to sign in.");
    setPassword(""); setAuthed(true); await load();
  }
  async function logout() { await fetch("/api/admin/logout", { method: "POST" }); setAuthed(false); setData(null); }
  async function action(url, body) {
    setError(""); setMessage("");
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json();
    if (r.status === 401) return setAuthed(false);
    if (!r.ok) return setError(j.error || "Action failed.");
    setMessage("Updated successfully."); await load();
  }

  const appointments = useMemo(() => data?.appointments || [], [data]);

  if (authed === false) return <main className="admin-shell"><section className="admin-card admin-login"><div className="admin-brand">Vaastushree <span>Admin</span></div><h1>Appointment Dashboard</h1><p>Sign in to manage availability and appointments.</p><form onSubmit={login}><label>Admin password<input type="password" autoFocus value={password} onChange={e => setPassword(e.target.value)} /></label>{error && <div className="admin-error">{error}</div>}<button className="primary-btn" type="submit"><LogIn size={16}/> Sign in</button></form></section></main>;

  if (authed === null || loading && !data) return <main className="admin-shell"><div className="admin-loading">Loading dashboard…</div></main>;

  return <main className="admin-shell">
    <header className="admin-header"><div><div className="admin-brand">Vaastushree <span>Admin</span></div><h1>Appointments</h1><p>{formatDate(date)} · Asia/Kolkata</p></div><button className="ghost-btn" onClick={logout}><LogOut size={16}/> Log out</button></header>
    <section className="admin-toolbar"><div><label>Date<input type="date" value={date} min={today()} onChange={e => setDate(e.target.value)} /></label></div><button className="ghost-btn" onClick={load}><RefreshCw size={16}/> Refresh</button></section>
    {error && <div className="admin-error">{error}</div>}{message && <div className="admin-success">{message}</div>}
    <section className="admin-grid">
      <div className="admin-card"><div className="admin-card-head"><div><h2>Daily calendar</h2><p>Bookings are the source of truth. You can block open slots manually.</p></div><CalendarDays size={22}/></div><div className="admin-slots">{(data?.calendar || []).map(slot => { const booking = appointments.find(a => String(a.appointment_time).slice(0,5) === slot.start); return <div key={slot.start} className={`admin-slot ${slot.status}`}><div><strong>{formatTime(slot.start)}</strong><span>{formatTime(slot.end)}</span></div><div>{slot.status === "booked" ? <span className="slot-state"><CheckCircle2 size={15}/> {booking?.customer_name || "Booked"}</span> : slot.status === "blocked" ? <button className="mini-btn" onClick={() => action("/api/admin/unblock", { date, time: slot.start })}><Unlock size={14}/> Unblock</button> : <button className="mini-btn" onClick={() => action("/api/admin/block", { date, time: slot.start })}><Lock size={14}/> Block</button>}</div></div>})}</div></div>
      <div className="admin-card"><div className="admin-card-head"><div><h2>Appointments</h2><p>{appointments.length} active record{appointments.length === 1 ? "" : "s"}</p></div><Clock3 size={22}/></div>{appointments.length ? appointments.map(a => <div className="admin-appointment" key={a.id}><div><strong>{formatTime(a.appointment_time)} · {a.service}</strong><span>{a.customer_name} · {a.customer_phone}</span><span>{a.customer_email || "No email"}</span><span>₹{(Number(a.amount_paise)/100).toLocaleString("en-IN")} · {a.status}</span></div><button className="mini-danger" onClick={() => action("/api/admin/cancel", { bookingId: a.id })}><XCircle size={14}/> Cancel & Refund</button></div>) : <div className="admin-empty">No confirmed or active bookings for this date.</div>}</div>
    </section>
    <section className="admin-card admin-note"><h3>Manual blocks</h3><p>Use Block on any open slot to stop customers from booking it. Existing paid/confirmed appointments cannot be blocked from this screen.</p></section>
  </main>;
}
