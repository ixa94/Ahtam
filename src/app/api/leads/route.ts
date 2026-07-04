import { NextResponse } from "next/server";
import { bookingSchema } from "@/lib/forms/booking-schema";
import { readJson, writeJson } from "@/lib/data/file-store";
import { sendLeadEmail } from "@/lib/email/sender";
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

function checkAuth(request: Request) {
  const password = process.env.ADMIN_PASSWORD;
  const auth = request.headers.get("x-admin-password");
  return !!(password && auth === password);
}

async function sendTelegram(chatId: string, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
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
  ]
    .filter(Boolean)
    .join("\n");

  const htmlText = text.replace("Новая заявка", "<b>Новая заявка</b>").replace(lead.phone, `<b>${lead.phone}</b>`);

  const jobs: Promise<void>[] = [];

  if (process.env.TELEGRAM_BOT_TOKEN && settings.telegramChatIds?.length) {
    jobs.push(...settings.telegramChatIds.map((id) => sendTelegram(id, htmlText)));
  }
  if (process.env.MAX_BOT_TOKEN && settings.maxChatIds?.length) {
    jobs.push(...settings.maxChatIds.map((id) => sendMax(id, text)));
  }

  await Promise.allSettled(jobs);
}

export async function GET(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const leads = await readJson<Lead[]>("leads.json", []);
  return NextResponse.json({ leads: leads.slice().reverse() });
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = bookingSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: "validation_error" }, { status: 400 });
    }
    if (parsed.data.trap) {
      return NextResponse.json({ ok: true });
    }

    const lead: Lead = {
      id: Date.now().toString(),
      name: parsed.data.name,
      phone: parsed.data.phone,
      eventDate: parsed.data.eventDate,
      guestCount: parsed.data.guestCount,
      message: parsed.data.message,
      createdAt: new Date().toISOString(),
    };

    const leads = await readJson<Lead[]>("leads.json", []);
    leads.push(lead);
    await writeJson("leads.json", leads);

    // Параллельно — не блокируем ответ
    void notifyAll(lead);
    void sendLeadEmail(lead);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id, all } = await request.json();
  if (all) {
    await writeJson("leads.json", []);
    return NextResponse.json({ ok: true });
  }
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const leads = await readJson<Lead[]>("leads.json", []);
  await writeJson("leads.json", leads.filter((l) => l.id !== id));
  return NextResponse.json({ ok: true });
}
