import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { CHECKIN_SESSION_COOKIE, verifyCheckinSessionToken } from "@/lib/auth";
import { markCheckedIn } from "@/lib/registrations-store";

export const dynamic = "force-dynamic";

// Auth is the session cookie only (issue #27) — no PIN in the body, so no rate limiting is
// needed here either: there's no secret to guess against a 128-bit HMAC session token the way
// there was against a 6-digit PIN. Called once per attendee scanned by an already-authenticated
// organiser, so this needs to support real check-in throughput with no artificial cap.
export async function POST(request: Request) {
  const cookieStore = await cookies();
  if (!verifyCheckinSessionToken(cookieStore.get(CHECKIN_SESSION_COOKIE)?.value)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { registrationId } = await request.json();
  if (typeof registrationId !== "string" || !registrationId) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  await markCheckedIn(registrationId);
  return NextResponse.json({ ok: true });
}
