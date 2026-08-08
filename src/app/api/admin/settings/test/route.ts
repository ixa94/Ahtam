import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/security/admin-auth";

async function testTelegram(chatId: string): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return { ok: false, error: "TELEGRAM_BOT_TOKEN не задан в .env" };

  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: "✅ Тест успешен! Бот банкетного зала АХТАМ подключён.",
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      return { ok: false, error: err.description ?? "Ошибка Telegram API" };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Telegram недоступен (заблокирован в РФ)" };
  }
}

async function testMax(chatId: string): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.MAX_BOT_TOKEN;
  if (!token) return { ok: false, error: "MAX_BOT_TOKEN не задан в .env" };

  try {
    const r = await fetch(
      `https://botapi.max.ru/messages?access_token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: { user_id: Number(chatId) },
          type: "message",
          body: { text: "✅ Тест успешен! Бот банкетного зала АХТАМ подключён. Вы будете получать уведомления о новых заявках." },
        }),
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      return { ok: false, error: err.message ?? "Ошибка MAX API" };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "MAX API недоступен" };
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { chatId, type } = await request.json();
  if (typeof chatId !== "string" || !chatId.trim() || chatId.length > 64 || !["max", "telegram"].includes(type)) {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  const result = type === "max" ? await testMax(chatId) : await testTelegram(chatId);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
