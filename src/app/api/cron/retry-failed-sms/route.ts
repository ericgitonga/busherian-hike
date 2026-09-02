import { NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/auth";
import { resendSmsConfirmation } from "@/lib/confirmation";
import { getFailedSmsRegistrations } from "@/lib/registrations-store";

export const dynamic = "force-dynamic";

// Vercel Cron (see vercel.json), same auth pattern as purge-contact-fields. Retries every row
// whose last SMS attempt failed (issue #96) — e.g. SasaSignal float ran out at the time of the
// original send — so a top-up gets the confirmation through without the organiser having to
// manually Resend every affected row from /payments. Runs once daily — the `egm2` Vercel team is
// on the Hobby plan, which caps Cron Jobs at one invocation/day, same constraint
// purge-contact-fields already lives under; the /payments Resend button is the path for anything
// more time-sensitive than "by tomorrow morning."
export async function GET(request: Request) {
  if (!verifyCronSecret(request.headers.get("authorization"))) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const failed = await getFailedSmsRegistrations();
  let retried = 0;
  let stillFailed = 0;

  for (const row of failed) {
    const result = await resendSmsConfirmation(row.id);
    retried += 1;
    if (result.status !== "sent") stillFailed += 1;
  }

  return NextResponse.json({ retried, succeeded: retried - stillFailed, stillFailed });
}
