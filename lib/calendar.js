import { DateTime } from "luxon";

const DEFAULT_TIMEZONE = process.env.BOOKING_TIMEZONE || "Asia/Kolkata";

export function getCalendarConfig() {
  return {
    timezone: DEFAULT_TIMEZONE,
    startHour: Number(process.env.BOOKING_START_HOUR || 10),
    endHour: Number(process.env.BOOKING_END_HOUR || 19),
    breakStartHour: Number(process.env.BOOKING_BREAK_START_HOUR || 13),
    breakEndHour: Number(process.env.BOOKING_BREAK_END_HOUR || 14),
    durationMinutes: Number(process.env.BOOKING_DURATION_MINUTES || 45),
    slotIntervalMinutes: Number(process.env.BOOKING_SLOT_INTERVAL_MINUTES || 60),
  };
}

function minutesToTime(totalMinutes) {
  const h = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
  const m = (totalMinutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

export function generateSlots(date) {
  const config = getCalendarConfig();
  const slots = [];
  const now = DateTime.now().setZone(config.timezone);
  const requestedDate = DateTime.fromISO(date, { zone: config.timezone });

  if (!requestedDate.isValid) return [];
  if (requestedDate.startOf("day") < now.startOf("day")) return [];

  for (
    let startMinutes = config.startHour * 60;
    startMinutes + config.durationMinutes <= config.endHour * 60;
    startMinutes += config.slotIntervalMinutes
  ) {
    if (startMinutes >= config.breakStartHour * 60 && startMinutes < config.breakEndHour * 60) continue;

    const startTime = minutesToTime(startMinutes);
    const endTime = minutesToTime(startMinutes + config.durationMinutes);
    const slotStart = DateTime.fromISO(`${date}T${startTime}`, { zone: config.timezone });

    if (requestedDate.hasSame(now, "day") && slotStart <= now) continue;

    slots.push({ start: startTime, end: endTime });
  }

  return slots;
}

export function slotToUtc(date, startTime) {
  return DateTime.fromISO(`${date}T${startTime}`, { zone: DEFAULT_TIMEZONE }).toUTC().toISO();
}

export function slotEndToUtc(date, startTime) {
  const config = getCalendarConfig();
  return DateTime.fromISO(`${date}T${startTime}`, { zone: DEFAULT_TIMEZONE })
    .plus({ minutes: config.durationMinutes })
    .toUTC()
    .toISO();
}

export function addMinutes(hhmm, minutes) {
  const [h, m] = hhmm.split(":").map(Number);
  return minutesToTime(h * 60 + m + minutes);
}
