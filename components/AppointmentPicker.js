"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, Loader2 } from "lucide-react";

function today() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

function formatTime(value) {
  const [hour, minute] = value.split(":").map(Number);
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

export default function AppointmentPicker({ date, time, onChange }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const minDate = useMemo(() => today(), []);

  useEffect(() => {
    if (!date) {
      setSlots([]);
      onChange({ time: "" });
      return;
    }

    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        let result = null;
        let lastError = null;

        // Availability can occasionally fail because of a transient auth/session
        // response from the backend. Retry those failures automatically so the
        // customer does not have to change the date and select it again.
        for (let attempt = 0; attempt < 3; attempt += 1) {
          try {
            const response = await fetch(`/api/calendar/availability?date=${encodeURIComponent(date)}`, {
              cache: "no-store",
              headers: { Accept: "application/json" },
            });
            const data = await response.json().catch(() => ({}));

            if (response.ok) {
              result = data;
              break;
            }

            const message = String(data?.error || "");
            const transientAuthError = response.status === 401 || response.status === 403 || /jwt|token|auth|session/i.test(message);
            lastError = new Error(transientAuthError ? "Temporary availability error" : (message || "Unable to load available times."));

            if (!transientAuthError || attempt === 2) break;
            await new Promise((resolve) => setTimeout(resolve, 350 * (attempt + 1)));
          } catch (fetchError) {
            lastError = fetchError;
            if (attempt === 2) break;
            await new Promise((resolve) => setTimeout(resolve, 350 * (attempt + 1)));
          }
        }

        if (!result) throw lastError || new Error("Unable to load available times.");

        if (!cancelled) {
          setSlots(result.slots || []);
          if (time && !(result.slots || []).some((slot) => slot.start === time)) onChange({ time: "" });
        }
      } catch (err) {
        if (!cancelled) {
          setSlots([]);
          // Never expose internal JWT/auth details to customers.
          setError("Unable to load available times right now. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [date]);

  return (
    <div className="field full appointment-picker">
      <label htmlFor="appointment-date"><CalendarDays size={15} /> Choose Appointment Date *</label>
      <input
        id="appointment-date"
        type="date"
        min={minDate}
        value={date}
        onChange={(e) => onChange({ date: e.target.value, time: "" })}
        required
      />
      {date && (
        <div className="appointment-slots-wrap">
          <div className="appointment-slots-label"><Clock3 size={15} /> Available times</div>
          {loading ? (
            <div className="appointment-loading"><Loader2 size={16} className="spin" /> Checking appointment availability…</div>
          ) : error ? (
            <div className="appointment-error">{error}</div>
          ) : slots.length ? (
            <div className="appointment-slots">
              {slots.map((slot) => (
                <button
                  type="button"
                  key={slot.start}
                  className={`appointment-slot ${time === slot.start ? "active" : ""}`}
                  onClick={() => onChange({ time: slot.start })}
                >
                  {formatTime(slot.start)}
                </button>
              ))}
            </div>
          ) : (
            <div className="appointment-empty">No available appointments on this date. Please choose another date.</div>
          )}
        </div>
      )}
      {time && <input type="hidden" name="appointment_time" value={time} required readOnly />}
    </div>
  );
}
