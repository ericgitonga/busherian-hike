import { NextResponse } from "next/server";
import { verifyPin } from "@/lib/auth";
import { getPaidAttendees } from "@/lib/registrations-store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { pin } = await request.json();
  if (!verifyPin(pin)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const attendees = await getPaidAttendees();
  return NextResponse.json({ ok: true, attendees });
}
