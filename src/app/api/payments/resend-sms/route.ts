import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { PAYMENTS_SESSION_COOKIE, verifyOrganiserSessionToken } from "@/lib/auth";
import { resendSmsConfirmation } from "@/lib/confirmation";

export const dynamic = "force-dynamic";

// Auth is the session cookie only, same reasoning as payments/mark — no PIN in the body, so no
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

  const result = await resendSmsConfirmation(registrationId);
  if (result.status === "not_found") {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  // Same minimal audit trail shape as payments/mark — route, id, and outcome only, never PII.
  console.log(JSON.stringify({ route: "payments/resend-sms", registrationId, status: result.status }));
  return NextResponse.json({ ok: true, status: result.status });
}
