import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { PAYMENTS_SESSION_COOKIE, verifyOrganiserSessionToken } from "@/lib/auth";
import { markPaid } from "@/lib/registrations-store";

export const dynamic = "force-dynamic";

// Auth is the session cookie only (same reasoning as checkin/mark) — no PIN in the body, so no
// rate limiting is needed here either.
export async function POST(request: Request) {
  const cookieStore = await cookies();
  if (!verifyOrganiserSessionToken(cookieStore.get(PAYMENTS_SESSION_COOKIE)?.value)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { registrationId } = await request.json();
  if (typeof registrationId !== "string" || !registrationId) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const matched = await markPaid(registrationId);
  // Minimal audit trail for post-event review, same shape as checkin/mark's — route, id, and
  // outcome only, never the session token or any PII.
  console.log(JSON.stringify({ route: "payments/mark", registrationId, matched }));
  return NextResponse.json({ ok: true, matched });
}
