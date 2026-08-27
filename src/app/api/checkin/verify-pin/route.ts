import { NextResponse } from "next/server";
import { getPaidAttendees } from "@/lib/registrations-store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { pin } = await request.json();
  if (!process.env.ORGANISER_PIN || pin !== process.env.ORGANISER_PIN) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const attendees = await getPaidAttendees();
  return NextResponse.json({ ok: true, attendees });
}
