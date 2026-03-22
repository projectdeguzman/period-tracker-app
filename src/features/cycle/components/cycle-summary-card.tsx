import Link from "next/link";
import type { CycleEntry } from "@/types/tracking";

type CycleSummaryCardProps = {
  entries: CycleEntry[];
};

function getStartOfLocalDay(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);

  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

function getTodayDate() {
  const now = new Date();

  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function getLatestPeriodStart(entries: CycleEntry[]) {
  return entries
    .filter((entry) => entry.logType === "Period started")
    .sort((left, right) => right.date.localeCompare(left.date))[0] ?? null;
}

function getCycleDay(periodStartDate: string) {
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const elapsedDays = Math.floor(
    (getTodayDate().getTime() - getStartOfLocalDay(periodStartDate).getTime()) /
      millisecondsPerDay,
  );

  return Math.max(elapsedDays + 1, 1);
}

function formatStartDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(getStartOfLocalDay(date));
}

export function CycleSummaryCard({ entries }: CycleSummaryCardProps) {
  const latestPeriodStart = getLatestPeriodStart(entries);

  if (!latestPeriodStart) {
    return (
      <article
        className="rounded-[1.75rem] bg-accent px-5 py-5 text-white shadow-[0_16px_40px_rgba(169,52,86,0.24)]"
        data-testid="today-cycle-card-empty"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <p className="text-sm uppercase tracking-[0.2em] text-white/72">Today</p>
            <h2 className="mt-2 text-2xl font-semibold">No current cycle day yet</h2>
            <p className="mt-4 text-sm leading-6 text-white/84">
              Log your next period start to begin tracking your current cycle day here.
            </p>
          </div>

          <div className="rounded-full bg-white/18 px-3 py-1 text-sm font-medium">
            Incomplete
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/logs/cycle/new"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-accent-strong transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-accent"
            data-testid="log-period-start-cta"
            aria-label="Log Period Start"
          >
            Log Period Start
          </Link>
          <span className="inline-flex items-center rounded-full border border-white/20 px-3 py-1.5 text-sm text-white/84">
            Start dates power today&apos;s cycle day.
          </span>
        </div>
      </article>
    );
  }

  const currentDay = getCycleDay(latestPeriodStart.date);
  const summaryTags = latestPeriodStart.symptoms.slice(0, 3);
  const moodLabel = latestPeriodStart.mood || "Tracking";

  return (
    <article
      className="rounded-[1.75rem] bg-accent px-5 py-5 text-white shadow-[0_16px_40px_rgba(169,52,86,0.24)]"
      data-testid="today-cycle-card-active"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm uppercase tracking-[0.2em] text-white/72">Today</p>
          <h2 className="mt-2 text-2xl font-semibold">
            Day <span data-testid="today-cycle-day">{currentDay}</span>
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/84" data-testid="today-cycle-start-date">
            Counting from your most recent period start on {formatStartDate(latestPeriodStart.date)}.
          </p>
        </div>
        <div className="rounded-full bg-white/18 px-3 py-1 text-sm font-medium capitalize">
          {moodLabel}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div>
          <p className="text-sm leading-6 text-white/84">
            The first day you log as <span className="font-semibold text-white">Period started</span> is Day 1,
            and each day after that updates automatically.
          </p>

          {summaryTags.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2" data-testid="today-cycle-symptoms">
              {summaryTags.map((symptom) => (
                <span
                  key={symptom}
                  className="rounded-full bg-white/16 px-3 py-1.5 text-sm"
                >
                  {symptom}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <Link
          href="/logs/cycle/new"
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/24 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-accent"
          data-testid="today-log-cycle-entry"
        >
          Log cycle update
        </Link>
      </div>
    </article>
  );
}
