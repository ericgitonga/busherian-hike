import { NextResponse } from "next/server";
import { isPastRetentionWindow } from "@/lib/retention";
import { purgeContactFields } from "@/lib/registrations-store";

export const dynamic = "force-dynamic";

// Vercel Cron (see vercel.json) automatically sends `Authorization: Bearer $CRON_SECRET` on
// scheduled invocations — this rejects any other caller, including a guessed URL hit directly.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (!isPastRetentionWindow(new Date())) {
    return NextResponse.json({ purged: false, reason: "before retention cutoff" });
  }

  const count = await purgeContactFields();
  return NextResponse.json({ purged: true, count });
}
