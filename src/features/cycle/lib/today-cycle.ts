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
      kind: "between-cycles-no-prediction";
      startEntry: CycleEntry;
      endEntry: CycleEntry;
      currentDay: number;
      periodLengthDays: number;
    }
  | {
      kind: "between-cycles-prediction";
      startEntry: CycleEntry;
      endEntry: CycleEntry;
      currentDay: number;
      periodLengthDays: number;
      predictedStartDate: string;
      daysUntilPredictedStart: number;
    }
  | {
      kind: "predicted-start-window";
      startEntry: CycleEntry;
      endEntry: CycleEntry;
      currentDay: number;
      periodLengthDays: number;
      predictedStartDate: string;
    }
  | {
      kind: "late-for-period";
      startEntry: CycleEntry;
      endEntry: CycleEntry;
      currentDay: number;
      periodLengthDays: number;
      predictedStartDate: string;
      daysLate: number;
    };

const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;
const MIN_PERIOD_STARTS_FOR_PREDICTION = 3;
const PREDICTED_START_WINDOW_DAYS = 1;

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

function sortEntriesByDateAscending(entries: CycleEntry[]) {
  return [...entries].sort((left, right) => left.date.localeCompare(right.date));
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(dateString: string, days: number) {
  const date = getStartOfLocalDay(dateString);
  date.setDate(date.getDate() + days);

  return toDateKey(date);
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

function getPeriodStarts(entries: CycleEntry[]) {
  return sortEntriesByDateAscending(entries).filter(
    (entry) => entry.logType === "Period started",
  );
}

function getPredictedStartDate(entries: CycleEntry[]) {
  const periodStarts = getPeriodStarts(entries);

  if (periodStarts.length < MIN_PERIOD_STARTS_FOR_PREDICTION) {
    return null;
  }

  const cycleLengths: number[] = [];

  for (let index = 1; index < periodStarts.length; index += 1) {
    cycleLengths.push(
      getInclusiveDayCount(periodStarts[index - 1].date, periodStarts[index].date) - 1,
    );
  }

  const averageCycleLength = Math.round(
    cycleLengths.reduce((total, length) => total + length, 0) / cycleLengths.length,
  );
  const latestPeriodStart = periodStarts[periodStarts.length - 1];

  return addDays(latestPeriodStart.date, averageCycleLength);
}

function getDaysBetween(startDate: string, endDate: string) {
  return Math.floor(
    (getStartOfLocalDay(endDate).getTime() - getStartOfLocalDay(startDate).getTime()) /
      MILLISECONDS_PER_DAY,
  );
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

  const periodLengthDays = getInclusiveDayCount(
    latestPeriodStart.date,
    matchingPeriodEnd.date,
  );
  const predictedStartDate = getPredictedStartDate(entries);

  if (!predictedStartDate) {
    return {
      kind: "between-cycles-no-prediction",
      startEntry: latestPeriodStart,
      endEntry: matchingPeriodEnd,
      currentDay,
      periodLengthDays,
    };
  }

  const todayDateKey = toDateKey(getTodayDate());
  const predictedWindowStart = addDays(predictedStartDate, -PREDICTED_START_WINDOW_DAYS);
  const predictedWindowEnd = addDays(predictedStartDate, PREDICTED_START_WINDOW_DAYS);

  if (todayDateKey >= predictedWindowStart && todayDateKey <= predictedWindowEnd) {
    return {
      kind: "predicted-start-window",
      startEntry: latestPeriodStart,
      endEntry: matchingPeriodEnd,
      currentDay,
      periodLengthDays,
      predictedStartDate,
    };
  }

  if (todayDateKey > predictedWindowEnd) {
    return {
      kind: "late-for-period",
      startEntry: latestPeriodStart,
      endEntry: matchingPeriodEnd,
      currentDay,
      periodLengthDays,
      predictedStartDate,
      daysLate: Math.max(getDaysBetween(predictedWindowEnd, todayDateKey), 1),
    };
  }

  return {
    kind: "between-cycles-prediction",
    startEntry: latestPeriodStart,
    endEntry: matchingPeriodEnd,
    currentDay,
    periodLengthDays,
    predictedStartDate,
    daysUntilPredictedStart: Math.max(getDaysBetween(todayDateKey, predictedStartDate), 1),
  };
}
