import { getMostRecentPeriodStart, getStartOfLocalDay, getTodayDate } from "@/features/cycle/lib/today-cycle";
import type { CycleEntry, IntimacyEntry } from "@/types/tracking";

type SummaryItem = {
  label: string;
  testId: string;
  value: string;
};

type DashboardSummary = {
  items: SummaryItem[];
  nextPeriodHelperText?: string;
};

const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;
const MIN_PERIOD_STARTS_FOR_ESTIMATE = 2;

function getDayDifference(startDate: string, endDate: string) {
  return Math.round(
    (getStartOfLocalDay(endDate).getTime() - getStartOfLocalDay(startDate).getTime()) /
      MILLISECONDS_PER_DAY,
  );
}

function formatCycleDay(cycleEntries: CycleEntry[]) {
  const latestPeriodStart = getMostRecentPeriodStart(cycleEntries);

  if (!latestPeriodStart) {
    return "—";
  }

  const cycleDay = Math.max(getDayDifference(latestPeriodStart.date, toDateKey(getTodayDate())) + 1, 1);

  return `${cycleDay}`;
}

function formatNextPeriodEstimate(cycleEntries: CycleEntry[]) {
  const periodStarts = cycleEntries
    .filter((entry) => entry.logType === "Period started")
    .sort((left, right) => left.date.localeCompare(right.date));

  if (periodStarts.length < MIN_PERIOD_STARTS_FOR_ESTIMATE) {
    return {
      helperText: "* Add 2 cycles to unlock predictions",
      value: "N/A",
    };
  }

  const cycleLengths: number[] = [];

  for (let index = 1; index < periodStarts.length; index += 1) {
    cycleLengths.push(getDayDifference(periodStarts[index - 1].date, periodStarts[index].date));
  }

  const averageCycleLength = Math.round(
    cycleLengths.reduce((total, length) => total + length, 0) / cycleLengths.length,
  );
  const latestPeriodStart = periodStarts[periodStarts.length - 1];
  const elapsedDays = getDayDifference(latestPeriodStart.date, toDateKey(getTodayDate()));
  const daysUntilNextPeriod = averageCycleLength - elapsedDays;

  if (daysUntilNextPeriod <= 0) {
    return { value: "Soon" };
  }

  return { value: `${daysUntilNextPeriod} days` };
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function countLogsThisWeek(cycleEntries: CycleEntry[], intimacyEntries: IntimacyEntry[]) {
  const today = getTodayDate();

  const isWithinLastSevenDays = (date: string) => {
    const difference = Math.round(
      (today.getTime() - getStartOfLocalDay(date).getTime()) / MILLISECONDS_PER_DAY,
    );

    return difference >= 0 && difference < 7;
  };

  return [...cycleEntries, ...intimacyEntries].filter((entry) =>
    isWithinLastSevenDays(entry.date),
  ).length;
}

export function getDashboardSummary(
  cycleEntries: CycleEntry[],
  intimacyEntries: IntimacyEntry[],
): DashboardSummary {
  const nextPeriod = formatNextPeriodEstimate(cycleEntries);

  return {
    items: [
      {
        label: "Cycle Day",
        testId: "dashboard-summary-cycle-day",
        value: formatCycleDay(cycleEntries),
      },
      {
        label: "Next Period",
        testId: "dashboard-summary-next-period",
        value: nextPeriod.value,
      },
      {
        label: "Logs This Week",
        testId: "dashboard-summary-logs-this-week",
        value: `${countLogsThisWeek(cycleEntries, intimacyEntries)}`,
      },
    ],
    nextPeriodHelperText: nextPeriod.helperText,
  };
}
