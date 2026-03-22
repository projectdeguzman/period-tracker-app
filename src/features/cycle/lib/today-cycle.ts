import type { CycleEntry } from "@/types/tracking";

export type TodayCycleState =
  | {
      kind: "no-start";
    }
  | {
      kind: "period-in-progress";
      startEntry: CycleEntry;
      currentDay: number;
    }
  | {
      kind: "cycle-in-progress";
      startEntry: CycleEntry;
      endEntry: CycleEntry;
      currentDay: number;
      periodLengthDays: number;
    };

const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

export function getStartOfLocalDay(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);

  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function getTodayDate() {
  const now = new Date();

  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function sortEntriesByDateDescending(entries: CycleEntry[]) {
  return [...entries].sort((left, right) => right.date.localeCompare(left.date));
}

export function getMostRecentPeriodStart(entries: CycleEntry[]) {
  return (
    sortEntriesByDateDescending(entries).find(
      (entry) => entry.logType === "Period started",
    ) ?? null
  );
}

export function getMatchingPeriodEnd(
  entries: CycleEntry[],
  periodStart: CycleEntry,
) {
  return (
    sortEntriesByDateDescending(entries).find(
      (entry) =>
        entry.logType === "Period ended" && entry.date >= periodStart.date,
    ) ?? null
  );
}

export function getDayCountFromStart(periodStartDate: string) {
  const elapsedDays = Math.floor(
    (getTodayDate().getTime() - getStartOfLocalDay(periodStartDate).getTime()) /
      MILLISECONDS_PER_DAY,
  );

  return Math.max(elapsedDays + 1, 1);
}

export function getInclusiveDayCount(startDate: string, endDate: string) {
  const elapsedDays = Math.floor(
    (getStartOfLocalDay(endDate).getTime() - getStartOfLocalDay(startDate).getTime()) /
      MILLISECONDS_PER_DAY,
  );

  return Math.max(elapsedDays + 1, 1);
}

export function getTodayCycleState(entries: CycleEntry[]): TodayCycleState {
  const latestPeriodStart = getMostRecentPeriodStart(entries);

  if (!latestPeriodStart) {
    return { kind: "no-start" };
  }

  const currentDay = getDayCountFromStart(latestPeriodStart.date);
  const matchingPeriodEnd = getMatchingPeriodEnd(entries, latestPeriodStart);

  if (!matchingPeriodEnd) {
    return {
      kind: "period-in-progress",
      startEntry: latestPeriodStart,
      currentDay,
    };
  }

  return {
    kind: "cycle-in-progress",
    startEntry: latestPeriodStart,
    endEntry: matchingPeriodEnd,
    currentDay,
    periodLengthDays: getInclusiveDayCount(
      latestPeriodStart.date,
      matchingPeriodEnd.date,
    ),
  };
}
