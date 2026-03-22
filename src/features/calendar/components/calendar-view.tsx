"use client";

import { useState } from "react";
import { CycleEntryCard } from "@/features/cycle/components/cycle-entry-card";
import { IntimacyLogCard } from "@/features/intimacy/components/intimacy-log-card";
import { formatShortDate } from "@/lib/format-date";
import { useCycleEntries } from "@/lib/cycle-entry-store";
import { useIntimacyEntries } from "@/lib/intimacy-store";

const weekDayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toDateKey(input: Date | string) {
  if (typeof input === "string") {
    return input;
  }

  const year = input.getFullYear();
  const month = String(input.getMonth() + 1).padStart(2, "0");
  const day = String(input.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function buildCalendarDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const startOffset = firstDayOfMonth.getDay();
  const calendarStart = new Date(year, month, 1 - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(calendarStart);
    date.setDate(calendarStart.getDate() + index);

    return {
      date,
      key: toDateKey(date),
      isCurrentMonth: date.getMonth() === month,
    };
  });
}

function getCycleCellVariant(dayEntries: string[]) {
  if (dayEntries.includes("Period started")) {
    return "period-start";
  }

  if (dayEntries.includes("Period ended")) {
    return "period-end";
  }

  if (dayEntries.includes("Ovulation signs")) {
    return "ovulation";
  }

  if (dayEntries.length > 0) {
    return "cycle";
  }

  return "none";
}

export function CalendarView() {
  const today = new Date();
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState(toDateKey(today));

  const cycleEntries = useCycleEntries();
  const intimacyEntries = useIntimacyEntries();

  const days = buildCalendarDays(visibleMonth);
  const intimacyDateKeys = new Set(intimacyEntries.map((entry) => entry.date));

  const selectedCycleEntries = cycleEntries.filter(
    (entry) => entry.date === selectedDate,
  );
  const selectedIntimacyEntries = intimacyEntries.filter(
    (entry) => entry.date === selectedDate,
  );

  function goToPreviousMonth() {
    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1),
    );
  }

  function goToNextMonth() {
    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1),
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_18px_60px_rgba(160,73,98,0.12)] backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={goToPreviousMonth}
            data-testid="calendar-previous-month"
            className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium transition hover:bg-surface-muted"
          >
            Prev
          </button>
          <div className="text-center">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-accent-strong/70">
              Calendar
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">
              {getMonthLabel(visibleMonth)}
            </h2>
          </div>
          <button
            type="button"
            onClick={goToNextMonth}
            data-testid="calendar-next-month"
            className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium transition hover:bg-surface-muted"
          >
            Next
          </button>
        </div>

        <div className="mt-5 grid grid-cols-7 gap-2 text-center">
          {weekDayLabels.map((label) => (
            <div
              key={label}
              className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/46"
            >
              {label}
            </div>
          ))}

          {days.map((day) => {
            const dayCycleTypes = cycleEntries
              .filter((entry) => entry.date === day.key)
              .map((entry) => entry.logType);
            const cycleVariant = getCycleCellVariant(dayCycleTypes);
            const hasCycleEntries = cycleVariant !== "none";
            const hasIntimacyEntries = intimacyDateKeys.has(day.key);
            const isSelected = day.key === selectedDate;

            return (
              <button
                key={day.key}
                type="button"
                onClick={() => setSelectedDate(day.key)}
                data-testid={`calendar-day-${day.key}`}
                className={[
                  "min-h-18 rounded-2xl border px-2 py-2 text-left transition",
                  isSelected
                    ? "border-accent bg-accent text-white shadow-[0_12px_28px_rgba(169,52,86,0.18)]"
                    : day.isCurrentMonth
                      ? cycleVariant === "period-start"
                        ? "border-2 border-accent-strong bg-accent-soft hover:bg-accent-soft/80"
                        : cycleVariant === "period-end"
                          ? "border-2 border-dashed border-accent/55 bg-accent-soft hover:bg-accent-soft/80"
                          : cycleVariant === "ovulation"
                            ? "border-2 border-[#c6a7e2] bg-accent-soft hover:bg-accent-soft/80"
                          : hasCycleEntries
                            ? "border-line bg-accent-soft hover:bg-accent-soft/80"
                            : "border-line bg-white hover:bg-surface-muted"
                      : "border-line/60 bg-white/55 text-foreground/40 hover:bg-white",
                ].join(" ")}
              >
                <div className="flex min-h-14 flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <span className="block text-sm font-semibold">
                      {day.date.getDate()}
                    </span>
                  </div>

                  <div className="flex min-h-3 items-end justify-center">
                    {hasIntimacyEntries ? (
                      <span
                        aria-label="Intimacy entry logged"
                        className="inline-flex h-2.5 w-2.5 items-center justify-center"
                      >
                        <svg
                          viewBox="0 0 12 12"
                          className={[
                            "h-2.5 w-2.5",
                            isSelected ? "text-white" : "text-accent-strong",
                          ].join(" ")}
                          fill="currentColor"
                          aria-hidden="true"
                          focusable="false"
                        >
                          <path d="M6 10.4 5.2 9.7C2.4 7.2 1 5.9 1 4.2 1 2.9 2 2 3.2 2c.7 0 1.5.3 2 .9.5-.6 1.3-.9 2-.9C8.4 2 9.4 2.9 9.4 4.2c0 1.7-1.4 3-4.2 5.5L6 10.4Z" />
                        </svg>
                      </span>
                    ) : null}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_18px_60px_rgba(160,73,98,0.12)] backdrop-blur">
        <div className="mb-4">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-accent-strong/70">
            Selected day
          </p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight">
            {formatShortDate(selectedDate)}
          </h3>
        </div>

        <div className="space-y-5">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">Cycle entries</p>
              <span className="text-sm text-foreground/54">
                {selectedCycleEntries.length}
              </span>
            </div>

            <div className="space-y-3">
              {selectedCycleEntries.length > 0 ? (
                selectedCycleEntries.map((entry) => (
                  <CycleEntryCard key={entry.id} entry={entry} />
                ))
              ) : (
                <article className="rounded-[1.5rem] border border-dashed border-line bg-white/75 px-4 py-5 text-sm leading-6 text-foreground/58">
                  No cycle entries logged for this day.
                </article>
              )}
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">Intimacy entries</p>
              <span className="text-sm text-foreground/54">
                {selectedIntimacyEntries.length}
              </span>
            </div>

            <div className="space-y-3">
              {selectedIntimacyEntries.length > 0 ? (
                selectedIntimacyEntries.map((entry) => (
                  <IntimacyLogCard key={entry.id} entry={entry} />
                ))
              ) : (
                <article className="rounded-[1.5rem] border border-dashed border-line bg-white/75 px-4 py-5 text-sm leading-6 text-foreground/58">
                  No intimacy entries logged for this day.
                </article>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
