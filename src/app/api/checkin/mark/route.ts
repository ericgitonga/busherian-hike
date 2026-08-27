import { NextResponse } from "next/server";
import { markCheckedIn } from "@/lib/registrations-store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { pin, registrationId } = await request.json();
  if (!process.env.ORGANISER_PIN || pin !== process.env.ORGANISER_PIN) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  if (typeof registrationId !== "string" || !registrationId) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  await markCheckedIn(registrationId);
  return NextResponse.json({ ok: true });
}
