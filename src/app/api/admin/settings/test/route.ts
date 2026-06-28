import { NextResponse } from "next/server";

function checkAuth(request: Request) {
  const password = process.env.ADMIN_PASSWORD;
  const auth = request.headers.get("x-admin-password");
  return !!(password && auth === password);
}

export async function POST(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "no_token" }, { status: 503 });
  }

  const { chatId } = await request.json();
  if (!chatId) return NextResponse.json({ error: "chatId required" }, { status: 400 });

  const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: "✅ Тест успешен! Бот банкетного зала АХТАМ подключён. Вы будете получать уведомления о новых заявках.",
    }),
  });

  if (!r.ok) {
    const err = await r.json();
    return NextResponse.json({ error: err.description ?? "telegram_error" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
