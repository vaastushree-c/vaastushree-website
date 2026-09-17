import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE = "vaastushree_admin_session";
const TTL_MS = 1000 * 60 * 60 * 12;

function sign(value) {
  return crypto.createHmac("sha256", process.env.ADMIN_SESSION_SECRET || "change-me").update(value).digest("base64url");
}

export async function setAdminSession() {
  const expiresAt = Date.now() + TTL_MS;
  const payload = `${expiresAt}`;
  const token = `${payload}.${sign(payload)}`;
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: TTL_MS / 1000,
    path: "/",
  });
}

export async function clearAdminSession() {
  (await cookies()).set(COOKIE, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 0, path: "/" });
}

export async function isAdminAuthenticated() {
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!password || !secret) return false;
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return false;
  const [expiresAt, signature] = token.split(".");
  if (!expiresAt || !signature || Number(expiresAt) < Date.now()) return false;
  const expected = sign(expiresAt);
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export function adminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET);
}
