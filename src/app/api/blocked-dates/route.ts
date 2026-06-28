import { NextResponse } from "next/server";
import { readJson, writeJson } from "@/lib/data/file-store";

type BlockedDate = { date: string; note: string | null };

export async function GET() {
  const dates = await readJson<BlockedDate[]>("blocked-dates.json", []);
  const today = new Date().toISOString().slice(0, 10);
  return NextResponse.json({ dates: dates.filter((d) => d.date >= today) });
}

export async function POST(request: Request) {
  const password = process.env.ADMIN_PASSWORD;
  const auth = request.headers.get("x-admin-password");
  if (!password || auth !== password) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { date, note } = await request.json();
  if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });

  const dates = await readJson<BlockedDate[]>("blocked-dates.json", []);
  if (!dates.find((d) => d.date === date)) {
    dates.push({ date, note: note ?? null });
    dates.sort((a, b) => a.date.localeCompare(b.date));
    await writeJson("blocked-dates.json", dates);
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const password = process.env.ADMIN_PASSWORD;
  const auth = request.headers.get("x-admin-password");
  if (!password || auth !== password) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { date } = await request.json();
  if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });

  const dates = await readJson<BlockedDate[]>("blocked-dates.json", []);
  await writeJson("blocked-dates.json", dates.filter((d) => d.date !== date));
  return NextResponse.json({ ok: true });
}
