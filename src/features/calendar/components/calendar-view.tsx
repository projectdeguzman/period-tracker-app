"use client";

import { useState, useSyncExternalStore } from "react";
import { CycleDayDetailCard } from "@/features/cycle/components/cycle-day-detail-card";
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

function fromDateKey(input: string) {
  const [year, month, day] = input.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function addDays(input: string, days: number) {
  const date = fromDateKey(input);
  date.setDate(date.getDate() + days);

  return toDateKey(date);
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

function subscribeToClientReady() {
  return () => {};
}

function getServerSnapshot() {
  return false;
}

function getClientSnapshot() {
  return true;
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

function buildPeriodRangeKeys(cycleEntries: Array<{ date: string; logType: string }>) {
  const sortedEntries = [...cycleEntries].sort((left, right) =>
    left.date.localeCompare(right.date),
  );
  const rangeKeys = new Set<string>();
  let activeStart: string | null = null;

  for (const entry of sortedEntries) {
    if (entry.logType === "Period started") {
      activeStart = entry.date;
      rangeKeys.add(entry.date);
      continue;
    }

    if (entry.logType === "Period ended" && activeStart) {
      let cursor = activeStart;

      while (cursor <= entry.date) {
        rangeKeys.add(cursor);
        cursor = addDays(cursor, 1);
      }

      activeStart = null;
    }
  }

  return rangeKeys;
}

export function CalendarView() {
  const today = new Date();
  const isMounted = useSyncExternalStore(
    subscribeToClientReady,
    getClientSnapshot,
    getServerSnapshot,
  );
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState(toDateKey(today));

  const cycleEntries = useCycleEntries();
  const intimacyEntries = useIntimacyEntries();

  const days = buildCalendarDays(visibleMonth);
  const intimacyDateKeys = new Set(intimacyEntries.map((entry) => entry.date));
  const periodRangeKeys = buildPeriodRangeKeys(cycleEntries);

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

  if (!isMounted) {
    return (
      <div className="space-y-5">
        <section className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_18px_60px_rgba(160,73,98,0.12)] backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div className="h-10 w-16 rounded-full bg-surface-muted" />
            <div className="text-center">
              <div className="mx-auto h-3 w-20 rounded-full bg-surface-muted" />
              <div className="mx-auto mt-2 h-6 w-32 rounded-full bg-surface-muted" />
            </div>
            <div className="h-10 w-16 rounded-full bg-surface-muted" />
          </div>

          <div className="mt-5 grid grid-cols-7 gap-2">
            {weekDayLabels.map((label) => (
              <div
                key={label}
                className="h-4 rounded-full bg-transparent text-center text-xs font-semibold uppercase tracking-[0.16em] text-foreground/46"
              >
                {label}
              </div>
            ))}

            {Array.from({ length: 42 }, (_, index) => (
              <div
                key={index}
                className="min-h-18 rounded-2xl border border-line bg-white/75 px-2 py-2"
              >
                <div className="h-4 w-4 rounded-full bg-surface-muted" />
                <div className="mt-8 flex justify-center">
                  <div className="h-2 w-2 rounded-full bg-surface-muted" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_18px_60px_rgba(160,73,98,0.12)] backdrop-blur">
          <div className="h-3 w-24 rounded-full bg-surface-muted" />
          <div className="mt-2 h-7 w-32 rounded-full bg-surface-muted" />
          <div className="mt-6 space-y-3">
            <div className="rounded-[1.5rem] border border-dashed border-line bg-white/75 px-4 py-5">
              <div className="h-4 w-36 rounded-full bg-surface-muted" />
              <div className="mt-3 h-4 w-52 rounded-full bg-surface-muted" />
            </div>
            <div className="rounded-[1.5rem] border border-dashed border-line bg-white/75 px-4 py-5">
              <div className="h-4 w-36 rounded-full bg-surface-muted" />
              <div className="mt-3 h-4 w-52 rounded-full bg-surface-muted" />
            </div>
          </div>
        </section>
      </div>
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
            const isInPeriodRange = periodRangeKeys.has(day.key);
            const continuesFromPrevious = periodRangeKeys.has(addDays(day.key, -1));
            const continuesToNext = periodRangeKeys.has(addDays(day.key, 1));

            return (
              <button
                key={day.key}
                type="button"
                onClick={() => setSelectedDate(day.key)}
                data-testid={`calendar-day-${day.key}`}
                className={[
                  "relative min-h-18 overflow-visible rounded-2xl border px-2 py-2 text-left transition-transform duration-150",
                  isSelected
                    ? "scale-[1.02] border-accent bg-accent text-white shadow-[0_14px_30px_rgba(169,52,86,0.2)]"
                    : day.isCurrentMonth
                      ? cycleVariant === "period-start"
                        ? "border-2 border-accent-strong bg-accent-soft hover:bg-accent-soft/80"
                        : cycleVariant === "period-end"
                          ? "border-2 border-dashed border-accent/60 bg-accent-soft hover:bg-accent-soft/80"
                          : cycleVariant === "ovulation"
                            ? "border-2 border-[#c6a7e2] bg-accent-soft hover:bg-accent-soft/80"
                          : hasCycleEntries
                            ? "border-line bg-accent-soft hover:bg-accent-soft/80"
                            : "border-line bg-white hover:bg-surface-muted"
                      : "border-line/60 bg-white/55 text-foreground/40 hover:bg-white",
                ].join(" ")}
              >
                {isInPeriodRange && !isSelected ? (
                  <>
                    {continuesFromPrevious ? (
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -left-2 top-1/2 h-8 w-2 -translate-y-1/2 bg-accent-soft"
                      />
                    ) : null}
                    {continuesToNext ? (
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-2 top-1/2 h-8 w-2 -translate-y-1/2 bg-accent-soft"
                      />
                    ) : null}
                  </>
                ) : null}

                <div className="relative flex min-h-14 flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <span className="block text-sm font-semibold">
                      {day.date.getDate()}
                    </span>
                  </div>

                  <div className="min-h-3" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-1.5 flex justify-center">
                    {hasIntimacyEntries ? (
                      <span
                        aria-label="Intimacy entry logged"
                        className="inline-flex h-2.5 w-2.5 items-center justify-center"
                      >
                        <svg
                          viewBox="0 0 12 12"
                          className={[
                            "h-2.5 w-2.5",
                            isSelected ? "text-white/95" : "text-[#c97a8e]",
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
            Day details
          </p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight">
            {formatShortDate(selectedDate)}
          </h3>
          <p className="mt-2 text-sm leading-6 text-foreground/62">
            A closer look at everything logged for this date.
          </p>
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
                  <CycleDayDetailCard key={entry.id} entry={entry} />
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
