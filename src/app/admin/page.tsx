"use client";

import { useState } from "react";

type BlockedDate = { date: string; note?: string | null };
type Lead = {
  id: string;
  name?: string;
  phone: string;
  eventDate?: string;
  guestCount?: number;
  message?: string;
  createdAt: string;
};
type Settings = { telegramChatIds: string[] };

const MONTH_NAMES = [
  "Январь","Февраль","Март","Апрель","Май","Июнь",
  "Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь",
];
const DAY_NAMES = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];

function buildGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
function toIso(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
function addMonths(year: number, month: number, delta: number) {
  const d = new Date(year, month + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() };
}
function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

export default function AdminPage() {
  // Auth
  const [pwdInput, setPwdInput] = useState("");
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Tabs
  const [tab, setTab] = useState<"calendar" | "leads" | "settings">("calendar");

  // Data
  const [blocked, setBlocked] = useState<BlockedDate[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [settings, setSettings] = useState<Settings>({ telegramChatIds: [] });

  // Calendar state
  const today = new Date();
  const todayIso = toIso(today.getFullYear(), today.getMonth(), today.getDate());
  const [baseYear, setBaseYear] = useState(today.getFullYear());
  const [baseMonth, setBaseMonth] = useState(today.getMonth());
  const next = addMonths(baseYear, baseMonth, 1);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [calMsg, setCalMsg] = useState("");

  // Settings state
  const [newChatId, setNewChatId] = useState("");
  const [settingsMsg, setSettingsMsg] = useState("");
  const [testLoading, setTestLoading] = useState(false);

  const blockedSet = new Set(blocked.map((b) => b.date));

  // ── Auth ──────────────────────────────────────────
  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!pwdInput.trim()) return;
    setAuthLoading(true);
    setAuthError("");

    const r = await fetch("/api/leads", {
      headers: { "x-admin-password": pwdInput },
    });
    if (r.status === 401) {
      setAuthError("Неверный пароль");
      setAuthLoading(false);
      return;
    }

    const [leadsData, datesData, settingsData] = await Promise.all([
      r.json(),
      fetch("/api/blocked-dates").then((res) => res.json()),
      fetch("/api/admin/settings", {
        headers: { "x-admin-password": pwdInput },
      }).then((res) => res.json()),
    ]);

    setLeads(leadsData.leads ?? []);
    setBlocked(datesData.dates ?? []);
    setSettings(settingsData ?? { telegramChatIds: [] });
    setPassword(pwdInput);
    setAuthed(true);
    setAuthLoading(false);
  }

  function logout() {
    setAuthed(false);
    setPwdInput("");
    setPassword("");
    setBlocked([]);
    setLeads([]);
    setSettings({ telegramChatIds: [] });
  }

  // ── Calendar ──────────────────────────────────────
  async function toggleDate(iso: string) {
    setSaving(true);
    setCalMsg("");
    if (blockedSet.has(iso)) {
      const r = await fetch("/api/blocked-dates", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ date: iso }),
      });
      if (r.status === 401) { logout(); return; }
      if (r.ok) setBlocked((prev) => prev.filter((b) => b.date !== iso));
    } else {
      const r = await fetch("/api/blocked-dates", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ date: iso, note: note || null }),
      });
      if (r.status === 401) { logout(); return; }
      if (r.ok) {
        setBlocked((prev) => [...prev, { date: iso, note: note || null }]);
        setCalMsg(`✓ ${formatDate(iso)} помечена как занятая`);
        setNote("");
      }
    }
    setSaving(false);
  }

  async function clearPastBlocked() {
    const past = blocked.filter((b) => b.date < todayIso);
    for (const b of past) {
      await fetch("/api/blocked-dates", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ date: b.date }),
      });
    }
    setBlocked((prev) => prev.filter((b) => b.date >= todayIso));
    setCalMsg(`✓ Удалено прошедших дат: ${past.length}`);
  }

  function prevPair() {
    const p = addMonths(baseYear, baseMonth, -1);
    if (p.year < today.getFullYear() || (p.year === today.getFullYear() && p.month < today.getMonth())) return;
    setBaseYear(p.year); setBaseMonth(p.month);
  }
  function nextPair() {
    const n = addMonths(baseYear, baseMonth, 1);
    setBaseYear(n.year); setBaseMonth(n.month);
  }
  const isPrevDisabled =
    baseYear < today.getFullYear() ||
    (baseYear === today.getFullYear() && baseMonth <= today.getMonth());

  // ── Leads ─────────────────────────────────────────
  async function deleteLead(id: string) {
    const r = await fetch("/api/leads", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ id }),
    });
    if (r.ok) setLeads((prev) => prev.filter((l) => l.id !== id));
  }

  async function clearAllLeads() {
    if (!confirm("Удалить все заявки?")) return;
    const r = await fetch("/api/leads", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ all: true }),
    });
    if (r.ok) setLeads([]);
  }

  // ── Settings ──────────────────────────────────────
  async function saveSettings(updated: Settings) {
    const r = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify(updated),
    });
    if (r.ok) {
      setSettings(updated);
      setSettingsMsg("✓ Сохранено");
      setTimeout(() => setSettingsMsg(""), 3000);
    }
  }

  async function addChatId() {
    const id = newChatId.trim();
    if (!id || settings.telegramChatIds.includes(id)) return;
    const updated = { ...settings, telegramChatIds: [...settings.telegramChatIds, id] };
    await saveSettings(updated);
    setNewChatId("");
  }

  async function removeChatId(id: string) {
    const updated = { ...settings, telegramChatIds: settings.telegramChatIds.filter((c) => c !== id) };
    await saveSettings(updated);
  }

  async function sendTestMessage(chatId: string) {
    setTestLoading(true);
    await fetch(`/api/admin/settings/test`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ chatId }),
    });
    setTestLoading(false);
    setSettingsMsg("✓ Тестовое сообщение отправлено");
    setTimeout(() => setSettingsMsg(""), 4000);
  }

  // ── Login screen ──────────────────────────────────
  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9F5ED]">
        <form onSubmit={handleAuth} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-soft">
          <h1 className="font-display text-2xl font-bold text-brand">Вход в админку</h1>
          <p className="mt-2 text-sm text-ink-soft">Пароль из файла .env (ADMIN_PASSWORD)</p>
          <input
            type="password"
            value={pwdInput}
            onChange={(e) => setPwdInput(e.target.value)}
            placeholder="Пароль"
            className="field mt-5"
            autoFocus
          />
          {authError && <p className="mt-2 text-sm text-red-600">{authError}</p>}
          <button type="submit" disabled={authLoading} className="btn btn-gold mt-4 w-full">
            {authLoading ? "Проверяем..." : "Войти"}
          </button>
        </form>
      </div>
    );
  }

  // ── Main UI ───────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F9F5ED]">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-brand">Панель управления</h1>
          <button onClick={logout} className="text-sm text-ink-muted hover:text-brand">Выйти</button>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 rounded-xl border border-line bg-white p-1 w-fit">
          {(["calendar", "leads", "settings"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                tab === t ? "bg-brand text-white" : "text-ink-soft hover:text-brand"
              }`}
            >
              {t === "calendar" ? "Занятые даты" : t === "leads" ? `Заявки (${leads.length})` : "Настройки"}
            </button>
          ))}
        </div>

        {/* ── CALENDAR ── */}
        {tab === "calendar" && (
          <>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Комментарий к занятой дате (необязательно)"
                className="field max-w-xs"
              />
              {blocked.some((b) => b.date < todayIso) && (
                <button
                  onClick={clearPastBlocked}
                  className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink-soft hover:text-red-600"
                >
                  Очистить прошедшие
                </button>
              )}
            </div>
            {calMsg && <p className="mb-3 text-sm text-green-700">{calMsg}</p>}
            <p className="mb-4 text-sm text-ink-soft">
              Нажмите на дату — зелёная станет занятой, красная освободится.
            </p>

            <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
              <div className="mb-6 flex items-center justify-between">
                <button onClick={prevPair} disabled={isPrevDisabled}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-lg hover:bg-gold/10 disabled:opacity-25">←</button>
                <span className="text-sm text-ink-muted">Нажмите на дату чтобы изменить статус</span>
                <button onClick={nextPair}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-lg hover:bg-gold/10">→</button>
              </div>

              <div className="grid gap-8 md:grid-cols-2 md:divide-x md:divide-line">
                {[{ year: baseYear, month: baseMonth }, { year: next.year, month: next.month }].map(({ year, month }, idx) => {
                  const cells = buildGrid(year, month);
                  return (
                    <div key={`${year}-${month}`} className={idx === 1 ? "md:pl-8" : ""}>
                      <p className="mb-4 text-center font-display font-semibold text-brand">
                        {MONTH_NAMES[month]} {year}
                      </p>
                      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-ink-muted">
                        {DAY_NAMES.map((d) => <div key={d}>{d}</div>)}
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {cells.map((day, i) => {
                          if (!day) return <div key={i} />;
                          const iso = toIso(year, month, day);
                          const isPast = iso < todayIso;
                          const isBlocked = blockedSet.has(iso);
                          const entry = blocked.find((b) => b.date === iso);
                          let cls = "flex h-10 w-10 mx-auto items-center justify-center rounded-full text-sm font-medium transition-colors ";
                          if (isPast) cls += "text-ink-muted/40 cursor-default";
                          else if (isBlocked) cls += "bg-red-100 text-red-700 hover:bg-red-200 cursor-pointer";
                          else cls += "bg-green-50 text-green-800 hover:bg-green-200 cursor-pointer";
                          return (
                            <div key={i}>
                              <button className={cls} disabled={isPast || saving}
                                onClick={() => !isPast && toggleDate(iso)}
                                title={entry?.note ?? (isBlocked ? "Занято — нажмите чтобы снять" : "Свободно — нажмите чтобы заблокировать")}>
                                {day}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 flex gap-5 border-t border-line pt-4 text-xs text-ink-soft">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-3 w-3 rounded-full bg-green-100 border border-green-300" />Свободно
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-3 w-3 rounded-full bg-red-100 border border-red-300" />Занято
                </span>
              </div>
            </div>

            {blocked.length > 0 && (
              <div className="mt-6 rounded-2xl border border-line bg-white p-6">
                <h2 className="font-display font-semibold text-brand mb-4">Все занятые даты</h2>
                <ul className="divide-y divide-line">
                  {[...blocked].sort((a, b) => a.date.localeCompare(b.date)).map((b) => (
                    <li key={b.date} className="flex items-center justify-between py-2 text-sm">
                      <span className={b.date < todayIso ? "text-ink-muted/50" : "text-ink"}>
                        {formatDate(b.date)}{b.note ? ` — ${b.note}` : ""}
                      </span>
                      <button onClick={() => toggleDate(b.date)} disabled={saving}
                        className="ml-4 text-xs text-red-500 hover:text-red-700">Удалить</button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {/* ── LEADS ── */}
        {tab === "leads" && (
          <div>
            {leads.length > 0 && (
              <div className="mb-4 flex justify-end">
                <button onClick={clearAllLeads}
                  className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                  Удалить все заявки
                </button>
              </div>
            )}
            {leads.length === 0 ? (
              <div className="rounded-2xl border border-line bg-white p-8 text-center text-ink-soft">
                Заявок пока нет
              </div>
            ) : (
              <div className="space-y-4">
                {leads.map((lead) => (
                  <div key={lead.id} className="rounded-2xl border border-line bg-white p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-ink">{lead.name || "Имя не указано"}</p>
                        <a href={`tel:${lead.phone.replace(/[^+\d]/g, "")}`}
                          className="text-sm text-gold hover:underline">{lead.phone}</a>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-xs text-ink-muted">
                          {new Date(lead.createdAt).toLocaleString("ru-RU")}
                        </p>
                        <button onClick={() => deleteLead(lead.id)}
                          className="text-xs text-red-400 hover:text-red-700">Удалить</button>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-sm">
                      {lead.eventDate && (
                        <span className="rounded-lg bg-brand/5 px-3 py-1 text-brand">
                          📅 {formatDate(lead.eventDate)}
                        </span>
                      )}
                      {lead.guestCount && (
                        <span className="rounded-lg bg-brand/5 px-3 py-1 text-brand">
                          👥 {lead.guestCount} гостей
                        </span>
                      )}
                    </div>
                    {lead.message && (
                      <p className="mt-3 border-t border-line pt-3 text-sm text-ink-soft">
                        {lead.message}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SETTINGS ── */}
        {tab === "settings" && (
          <div className="space-y-6">
            {/* Telegram */}
            <div className="rounded-2xl border border-line bg-white p-6">
              <h2 className="font-display text-lg font-semibold text-brand">Telegram уведомления</h2>
              <p className="mt-2 text-sm text-ink-soft">
                Добавьте Chat ID пользователей которые будут получать уведомления о новых заявках.
                Можно добавить до нескольких администраторов.
              </p>

              <div className="mt-4 rounded-xl bg-[#F9F5ED] p-4 text-sm text-ink-soft space-y-1">
                <p className="font-medium text-ink">Как узнать свой Chat ID:</p>
                <p>1. Откройте Telegram, напишите боту <span className="font-mono bg-white px-1 rounded">@userinfobot</span></p>
                <p>2. Он ответит вашим ID — скопируйте число</p>
                <p>3. Напишите вашему боту любое сообщение (иначе он не сможет вам писать)</p>
              </div>

              {settingsMsg && (
                <p className="mt-3 text-sm text-green-700">{settingsMsg}</p>
              )}

              {/* Existing chat IDs */}
              {settings.telegramChatIds.length > 0 && (
                <ul className="mt-4 divide-y divide-line rounded-xl border border-line">
                  {settings.telegramChatIds.map((id) => (
                    <li key={id} className="flex items-center justify-between px-4 py-3 text-sm">
                      <span className="font-mono text-ink">{id}</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => sendTestMessage(id)}
                          disabled={testLoading}
                          className="text-xs text-ink-muted hover:text-brand"
                        >
                          Тест
                        </button>
                        <button
                          onClick={() => removeChatId(id)}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Удалить
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {/* Add new */}
              <div className="mt-4 flex gap-3">
                <input
                  value={newChatId}
                  onChange={(e) => setNewChatId(e.target.value)}
                  placeholder="Введите Chat ID (например: 123456789)"
                  className="field flex-1"
                  onKeyDown={(e) => e.key === "Enter" && addChatId()}
                />
                <button
                  onClick={addChatId}
                  disabled={!newChatId.trim()}
                  className="btn btn-dark whitespace-nowrap"
                >
                  Добавить
                </button>
              </div>
            </div>

            {/* Bot token info */}
            <div className="rounded-2xl border border-line bg-white p-6">
              <h2 className="font-display text-lg font-semibold text-brand">Токен бота</h2>
              <p className="mt-2 text-sm text-ink-soft">
                Токен хранится в файле <span className="font-mono bg-[#F9F5ED] px-1 rounded">.env</span> на сервере.
                Переменная: <span className="font-mono bg-[#F9F5ED] px-1 rounded">TELEGRAM_BOT_TOKEN</span>
              </p>
              <p className="mt-2 text-sm text-ink-soft">
                После изменения токена нужно перезапустить сервер.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
