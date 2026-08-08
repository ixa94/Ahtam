import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { bookingSchema } from "@/lib/forms/booking-schema";
import { readJson, updateJson, writeJson } from "@/lib/data/file-store";
import { sendLeadEmail } from "@/lib/email/sender";
import { isAdminAuthenticated } from "@/lib/security/admin-auth";
import { getClientIp, takeRateLimit } from "@/lib/security/rate-limit";
import type { Settings } from "@/app/api/admin/settings/route";

type Lead = {
  id: string;
  name?: string;
  phone: string;
  eventDate?: string;
  guestCount?: number;
  message?: string;
  createdAt: string;
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char] || char);
}

async function sendTelegram(chatId: string, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    signal: AbortSignal.timeout(8000),
  }).catch(() => {});
}

async function sendMax(chatId: string, text: string) {
  const token = process.env.MAX_BOT_TOKEN;
  if (!token) return;
  await fetch(`https://botapi.max.ru/messages?access_token=${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { user_id: Number(chatId) },
      type: "message",
      body: { text },
    }),
    signal: AbortSignal.timeout(8000),
  }).catch(() => {});
}

async function notifyAll(lead: Lead) {
  const settings = await readJson<Settings>("settings.json", {
    telegramChatIds: [],
    maxChatIds: [],
  });

  const text = [
    "📋 Новая заявка с сайта АХТАМ",
    `👤 Имя: ${lead.name || "не указано"}`,
    `📞 Телефон: ${lead.phone}`,
    `📅 Дата: ${lead.eventDate || "не указана"}`,
    `👥 Гостей: ${lead.guestCount ?? "не указано"}`,
    lead.message ? `💬 ${lead.message}` : null,
  ].filter(Boolean).join("\n");

  const safeText = escapeHtml(text);
  const safePhone = escapeHtml(lead.phone);
  const htmlText = safeText
    .replace("Новая заявка", "<b>Новая заявка</b>")
    .replace(safePhone, `<b>${safePhone}</b>`);

  const jobs: Promise<void>[] = [];
  if (process.env.TELEGRAM_BOT_TOKEN && settings.telegramChatIds?.length) {
    jobs.push(...settings.telegramChatIds.map((id) => sendTelegram(id, htmlText)));
  }
  if (process.env.MAX_BOT_TOKEN && settings.maxChatIds?.length) {
    jobs.push(...settings.maxChatIds.map((id) => sendMax(id, text)));
  }
  await Promise.allSettled(jobs);
}

export async function GET(request: NextRequest) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const leads = await readJson<Lead[]>("leads.json", []);
  return NextResponse.json({ leads: leads.slice().reverse() });
}

export async function POST(request: NextRequest) {
  try {
    const rate = takeRateLimit(`lead:${getClientIp(request)}`, 5, 15 * 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "too_many_requests" },
        { status: 429, headers: { "Retry-After": String(rate.retryAfter) } },
      );
    }

    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > 16_384) return NextResponse.json({ error: "request_too_large" }, { status: 413 });

    const parsed = bookingSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "validation_error" }, { status: 400 });
    if (parsed.data.trap) return NextResponse.json({ ok: true });

    const lead: Lead = {
      id: randomUUID(),
      name: parsed.data.name,
      phone: parsed.data.phone,
      eventDate: parsed.data.eventDate,
      guestCount: parsed.data.guestCount,
      message: parsed.data.message,
      createdAt: new Date().toISOString(),
    };

    await updateJson<Lead[]>("leads.json", [], (leads) => {
      leads.push(lead);
      if (leads.length > 5_000) leads.splice(0, leads.length - 5_000);
      return leads;
    });

    void notifyAll(lead);
    void sendLeadEmail(lead);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => null) as { id?: unknown; all?: unknown } | null;
  if (body?.all === true) {
    await writeJson("leads.json", []);
    return NextResponse.json({ ok: true });
  }
  if (typeof body?.id !== "string" || body.id.length > 100) {
    return NextResponse.json({ error: "valid id required" }, { status: 400 });
  }
  await updateJson<Lead[]>("leads.json", [], (leads) => leads.filter((lead) => lead.id !== body.id));
  return NextResponse.json({ ok: true });
}
