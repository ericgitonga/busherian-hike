import { NextResponse } from "next/server";
import { verifyPin } from "@/lib/auth";
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
  "attending_after_party",
  "email",
  "paid",
  "paid_at",
  "checked_in",
  "checked_in_at",
  "created_at",
];

// Same shared secret as /checkin (see SKILL.md's "Organiser check-in" section for why) — this
// is the "only Luchiri and named committee members" gate from the brief, not a separate one.
export async function POST(request: Request) {
  const { pin } = await request.json();
  if (!verifyPin(pin)) {
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
