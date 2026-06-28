import { NextResponse } from "next/server";
import { readJson, writeJson } from "@/lib/data/file-store";

export type Settings = {
  telegramChatIds: string[];
};

const DEFAULT: Settings = { telegramChatIds: [] };

function checkAuth(request: Request) {
  const password = process.env.ADMIN_PASSWORD;
  const auth = request.headers.get("x-admin-password");
  return !!(password && auth === password);
}

export async function GET(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const settings = await readJson<Settings>("settings.json", DEFAULT);
  return NextResponse.json(settings);
}

export async function POST(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const current = await readJson<Settings>("settings.json", DEFAULT);
  const updated: Settings = { ...current, ...body };
  await writeJson("settings.json", updated);
  return NextResponse.json({ ok: true });
}
