"use client";

import { useEffect, useState } from "react";

type BlockedDate = { date: string; note?: string };

const MONTH_NAMES = [
  "Январь","Февраль","Март","Апрель","Май","Июнь",
  "Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"
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

function MonthPanel({
  year,
  month,
  blocked,
  todayIso,
  onSelect,
}: {
  year: number;
  month: number;
  blocked: Set<string>;
  todayIso: string;
  onSelect: (iso: string) => void;
}) {
  const cells = buildGrid(year, month);

  return (
    <div>
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
          const isBlocked = blocked.has(iso);

          let cls =
            "flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors mx-auto ";
          if (isPast) {
            cls += "text-ink-muted/40 cursor-default";
          } else if (isBlocked) {
            cls += "bg-red-100 text-red-700 cursor-default";
          } else {
            cls += "bg-green-50 text-green-800 hover:bg-green-200 cursor-pointer";
          }

          return (
            <div key={i}>
              <button
                type="button"
                className={cls}
                disabled={isPast || isBlocked}
                title={isBlocked ? "Занято" : isPast ? "" : "Свободно — нажмите чтобы забронировать"}
                onClick={() => !isPast && !isBlocked && onSelect(iso)}
              >
                {day}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AvailabilityCalendar() {
  const [blocked, setBlocked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const todayIso = toIso(today.getFullYear(), today.getMonth(), today.getDate());

  const [baseYear, setBaseYear] = useState(today.getFullYear());
  const [baseMonth, setBaseMonth] = useState(today.getMonth());

  const next = addMonths(baseYear, baseMonth, 1);

  useEffect(() => {
    fetch("/api/blocked-dates")
      .then((r) => r.json())
      .then((data: { dates: BlockedDate[] }) => {
        setBlocked(new Set(data.dates.map((d) => d.date)));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleSelect(iso: string) {
    window.dispatchEvent(new CustomEvent("kenderi:dateSelected", { detail: iso }));
    setTimeout(() => {
      document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
    }, 80);
  }

  function prevPair() {
    const p = addMonths(baseYear, baseMonth, -1);
    if (p.year < today.getFullYear() || (p.year === today.getFullYear() && p.month < today.getMonth())) return;
    setBaseYear(p.year);
    setBaseMonth(p.month);
  }

  function nextPair() {
    const n = addMonths(baseYear, baseMonth, 1);
    setBaseYear(n.year);
    setBaseMonth(n.month);
  }

  const isPrevDisabled =
    baseYear < today.getFullYear() ||
    (baseYear === today.getFullYear() && baseMonth <= today.getMonth());

  return (
    <section id="calendar" className="container-page py-20">
      <div className="max-w-2xl">
        <span className="eyebrow">Доступность зала</span>
        <h2 className="section-title mt-4 text-brand">Свободные даты для бронирования</h2>
        <p className="mt-3 text-sm text-ink-soft">
          Нажмите на свободную дату — она автоматически подставится в форму заявки.
        </p>
      </div>

      <div className="mt-10 rounded-2xl border border-line bg-white p-6 shadow-soft">
        {/* Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={prevPair}
            disabled={isPrevDisabled}
            className="flex h-9 w-9 items-center justify-center rounded-full text-lg transition-colors hover:bg-gold/10 disabled:opacity-25"
            aria-label="Предыдущий период"
          >
            ←
          </button>
          <span className="text-sm text-ink-muted">Нажмите на зелёную дату чтобы выбрать</span>
          <button
            onClick={nextPair}
            className="flex h-9 w-9 items-center justify-center rounded-full text-lg transition-colors hover:bg-gold/10"
            aria-label="Следующий период"
          >
            →
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-ink-muted">Загрузка...</div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 md:divide-x md:divide-line">
            <MonthPanel
              year={baseYear}
              month={baseMonth}
              blocked={blocked}
              todayIso={todayIso}
              onSelect={handleSelect}
            />
            <div className="md:pl-8">
              <MonthPanel
                year={next.year}
                month={next.month}
                blocked={blocked}
                todayIso={todayIso}
                onSelect={handleSelect}
              />
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-5 border-t border-line pt-5 text-xs text-ink-soft">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-full bg-green-100 border border-green-300" />
            Свободно — нажмите чтобы выбрать
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-full bg-red-100 border border-red-300" />
            Занято
          </span>
        </div>
      </div>
    </section>
  );
}
