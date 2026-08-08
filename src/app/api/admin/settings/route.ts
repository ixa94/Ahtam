import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { readJson, writeJson } from "@/lib/data/file-store";
import { isAdminAuthenticated } from "@/lib/security/admin-auth";

export type Settings = {
  telegramChatIds: string[];
  maxChatIds: string[];
};

const DEFAULT: Settings = { telegramChatIds: [], maxChatIds: [] };

const settingsSchema = z.object({
  telegramChatIds: z.array(z.string().trim().min(1).max(64)).max(20),
  maxChatIds: z.array(z.string().trim().min(1).max(64)).max(20),
}).strict();

export async function GET(request: NextRequest) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const settings = await readJson<Settings>("settings.json", DEFAULT);
  return NextResponse.json({ ...DEFAULT, ...settings });
}

export async function POST(request: NextRequest) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const parsed = settingsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "validation_error" }, { status: 400 });
  await writeJson("settings.json", parsed.data);
  return NextResponse.json({ ok: true });
}
