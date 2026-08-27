import { NextResponse } from "next/server";
import { verifyPin } from "@/lib/auth";
import {
  clientIpFromHeaders,
  isLockedOut,
  PIN_AUTH_RATE_LIMIT,
  recordAuthFailure,
} from "@/lib/rate-limit";
import { markCheckedIn } from "@/lib/registrations-store";

export const dynamic = "force-dynamic";

const ROUTE = "checkin-mark";

// Rate limiting here only ever consumes budget on a *wrong* PIN (see recordAuthFailure below) —
// this route is called once per attendee scanned by an already-authenticated organiser, so a
// call-every-request limit would lock out real check-in traffic within minutes on event day.
export async function POST(request: Request) {
  const ip = clientIpFromHeaders(request.headers);
  if (await isLockedOut(ROUTE, ip, PIN_AUTH_RATE_LIMIT)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  const { pin, registrationId } = await request.json();
  if (!verifyPin(pin)) {
    await recordAuthFailure(ROUTE, ip, PIN_AUTH_RATE_LIMIT);
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  if (typeof registrationId !== "string" || !registrationId) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  await markCheckedIn(registrationId);
  return NextResponse.json({ ok: true });
}
