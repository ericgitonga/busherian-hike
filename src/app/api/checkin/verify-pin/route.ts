import { NextResponse } from "next/server";
import { verifyPin } from "@/lib/auth";
import {
  clientIpFromHeaders,
  isLockedOut,
  PIN_AUTH_RATE_LIMIT,
  recordAuthFailure,
} from "@/lib/rate-limit";
import { getPaidAttendees } from "@/lib/registrations-store";

export const dynamic = "force-dynamic";

const ROUTE = "checkin-verify";

export async function POST(request: Request) {
  const ip = clientIpFromHeaders(request.headers);
  if (await isLockedOut(ROUTE, ip, PIN_AUTH_RATE_LIMIT)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  const { pin } = await request.json();
  if (!verifyPin(pin)) {
    await recordAuthFailure(ROUTE, ip, PIN_AUTH_RATE_LIMIT);
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const attendees = await getPaidAttendees();
  return NextResponse.json({ ok: true, attendees });
}
