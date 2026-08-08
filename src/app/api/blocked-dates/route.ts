import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson } from "@/lib/data/file-store";
import { isAdminAuthenticated } from "@/lib/security/admin-auth";

type BlockedDate = { date: string; note: string | null };

export async function GET() {
  const dates = await readJson<BlockedDate[]>("blocked-dates.json", []);
  const today = new Date().toISOString().slice(0, 10);
  return NextResponse.json({ dates: dates.filter((d) => d.date >= today) });
}

export async function POST(request: NextRequest) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { date, note } = await request.json();
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "valid date required" }, { status: 400 });
  }
  if (note != null && (typeof note !== "string" || note.length > 300)) {
    return NextResponse.json({ error: "invalid note" }, { status: 400 });
  }

  const dates = await readJson<BlockedDate[]>("blocked-dates.json", []);
  if (!dates.find((d) => d.date === date)) {
    dates.push({ date, note: note ?? null });
    dates.sort((a, b) => a.date.localeCompare(b.date));
    await writeJson("blocked-dates.json", dates);
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { date } = await request.json();
  if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });

  const dates = await readJson<BlockedDate[]>("blocked-dates.json", []);
  await writeJson("blocked-dates.json", dates.filter((d) => d.date !== date));
  return NextResponse.json({ ok: true });
}
