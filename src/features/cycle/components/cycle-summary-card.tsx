import Link from "next/link";
import type { CycleEntry } from "@/types/tracking";
import { getTodayCycleState } from "@/features/cycle/lib/today-cycle";

type CycleSummaryCardProps = {
  entries: CycleEntry[];
};

function TodayCardCta({ href, label, testId }: { href: string; label: string; testId: string }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-black shadow-[0_12px_28px_rgba(34,27,40,0.14)] transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-accent"
      data-testid={testId}
    >
      {label}
    </Link>
  );
}

export function CycleSummaryCard({ entries }: CycleSummaryCardProps) {
  const todayState = getTodayCycleState(entries);

  if (todayState.kind === "no-start") {
    return (
      <article
        className="rounded-[1.75rem] bg-accent px-5 py-5 text-white shadow-[0_16px_40px_rgba(169,52,86,0.24)]"
        data-testid="today-cycle-card-no-start"
      >
        <div className="flex flex-col gap-6">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.2em] text-white/72">Today</p>
            <h2 className="text-2xl font-semibold tracking-tight">Ready to start tracking?</h2>
            <p className="text-sm leading-6 text-white/78">
              Log your next period start to begin.
            </p>
          </div>

          <Link
            href="/logs/cycle/new?logType=Period%20started"
            data-testid="today-log-period-start-cta"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-black shadow-[0_12px_28px_rgba(34,27,40,0.14)] transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-accent"
          >
            Log Period Start
          </Link>
        </div>
      </article>
    );
  }

  const isCycleInProgress = todayState.kind === "cycle-in-progress";
  const statusLabel = isCycleInProgress ? "Cycle in progress" : "Period in progress";
  const ctaLabel = isCycleInProgress ? "Log symptoms" : "Log Period End";
  const ctaTestId = isCycleInProgress
    ? "today-log-symptoms-cta"
    : "today-log-period-end-cta";

  return (
    <article
      className="rounded-[1.75rem] bg-accent px-5 py-5 text-white shadow-[0_16px_40px_rgba(169,52,86,0.24)]"
      data-testid={
        isCycleInProgress ? "today-cycle-card-cycle-in-progress" : "today-cycle-card-period-in-progress"
      }
    >
      <div className="flex flex-col gap-6">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-white/72">Today</p>
          <div className="space-y-2">
            <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Day <span data-testid="today-cycle-day">{todayState.currentDay}</span>
            </h2>
            <p className="text-base font-medium text-white/92" data-testid="today-cycle-status">
              {statusLabel}
            </p>
            {isCycleInProgress ? (
              <p className="text-sm text-white/78" data-testid="today-period-length">
                Period lasted {todayState.periodLengthDays} day
                {todayState.periodLengthDays === 1 ? "" : "s"}
              </p>
            ) : null}
          </div>
        </div>

        <TodayCardCta
          href={
            isCycleInProgress
              ? "/logs/cycle/new?logType=Symptoms"
              : "/logs/cycle/new?logType=Period%20ended"
          }
          label={ctaLabel}
          testId={ctaTestId}
        />
      </div>
    </article>
  );
}
