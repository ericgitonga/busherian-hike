import { NextResponse } from "next/server";
import { verifyPin } from "@/lib/auth";
import {
  clientIpFromHeaders,
  isLockedOut,
  PIN_AUTH_RATE_LIMIT,
  recordAuthFailure,
} from "@/lib/rate-limit";
import { toCsv } from "@/lib/csv";
import { getAllRegistrations } from "@/lib/registrations-store";

export const dynamic = "force-dynamic";

const COLUMNS = [
  "id",
  "name",
  "age_group",
  "school",
  "year_left",
  "guest_count",
  "next_of_kin_name",
  "next_of_kin_contact",
  "needs_bus",
  "ticket_type",
  "email",
  "paid",
  "paid_at",
  "checked_in",
  "checked_in_at",
  "is_test_row",
  "created_at",
];

const ROUTE = "export";

// Same shared secret as /checkin (see SKILL.md's "Organiser check-in" section for why) — this
// is the "only Luchiri and named committee members" gate from the brief, not a separate one.
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

  const rows = await getAllRegistrations();
  const csv = toCsv(rows, COLUMNS);
  const filename = `registrations-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
