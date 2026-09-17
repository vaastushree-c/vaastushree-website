import { NextResponse } from "next/server";
import { setAdminSession, adminConfigured } from "../../../../lib/adminAuth";

export async function POST(request) {
  try {
    if (!adminConfigured()) return NextResponse.json({ error: "Admin login is not configured on the server." }, { status: 500 });
    const { password } = await request.json();
    if (!password || password !== process.env.ADMIN_PASSWORD) return NextResponse.json({ error: "Incorrect admin password." }, { status: 401 });
    await setAdminSession();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to sign in." }, { status: 500 });
  }
}
