import { NextResponse } from "next/server";
import { CAPACITY_CAP } from "@/lib/capacity";
import { getSlotsRemaining } from "@/lib/registrations-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const remaining = await getSlotsRemaining();
  return NextResponse.json({ cap: CAPACITY_CAP, remaining });
}
