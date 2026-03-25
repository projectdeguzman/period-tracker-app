import Link from "next/link";
import type { ReactNode } from "react";
import type { CycleEntry } from "@/types/tracking";
import { getTodayCycleState } from "@/features/cycle/lib/today-cycle";
import { formatShortDate } from "@/lib/format-date";

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

  let body: ReactNode;
  let cardTestId = "today-cycle-card-no-start";
  let ctaHref = "/logs/cycle/new?logType=Period%20started";
  let ctaLabel = "Log Period Start";
  let ctaTestId = "today-log-period-start-cta";

  if (todayState.kind === "no-start") {
    body = (
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.2em] text-white/72">Today</p>
        <h2 className="text-2xl font-semibold tracking-tight">Ready to start tracking?</h2>
        <p className="text-sm leading-6 text-white/78">
          Log your next period start to begin.
        </p>
      </div>
    );
  } else if (todayState.kind === "period-in-progress") {
    cardTestId = "today-cycle-card-period-in-progress";
    ctaHref = "/logs/cycle/new?logType=Period%20ended";
    ctaLabel = "Log Period End";
    ctaTestId = "today-log-period-end-cta";

    body = (
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.2em] text-white/72">Today</p>
        <div className="space-y-2">
          <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Day <span data-testid="today-cycle-day">{todayState.currentDay}</span>
          </h2>
          <p className="text-base font-medium text-white/92" data-testid="today-cycle-status">
            Period in progress
          </p>
        </div>
      </div>
    );
  } else if (todayState.kind === "between-cycles-no-prediction") {
    cardTestId = "today-cycle-card-between-cycles-no-prediction";
    ctaHref = "/logs/cycle/new?logType=Symptoms";
    ctaLabel = "Log symptoms";
    ctaTestId = "today-log-symptoms-cta";

    body = (
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.2em] text-white/72">Today</p>
        <h2 className="text-2xl font-semibold tracking-tight">Cycle in progress</h2>
        <p className="text-sm leading-6 text-white/78">
          Keep tracking symptoms and future period starts to unlock predictions.
        </p>
      </div>
    );
  } else if (todayState.kind === "between-cycles-prediction") {
    cardTestId = "today-cycle-card-between-cycles-prediction";
    ctaHref = "/logs/cycle/new?logType=Symptoms";
    ctaLabel = "Log symptoms";
    ctaTestId = "today-log-symptoms-cta";

    body = (
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.2em] text-white/72">Today</p>
        <h2 className="text-2xl font-semibold tracking-tight">Cycle in progress</h2>
        <p className="text-sm leading-6 text-white/78">
          Next period expected around{" "}
          <span data-testid="today-predicted-start-date">
            {formatShortDate(todayState.predictedStartDate)}
          </span>
          .
        </p>
      </div>
    );
  } else if (todayState.kind === "predicted-start-window") {
    cardTestId = "today-cycle-card-predicted-start-window";

    body = (
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.2em] text-white/72">Today</p>
        <h2 className="text-2xl font-semibold tracking-tight">Your period may start soon</h2>
        <p className="text-sm leading-6 text-white/78">
          Expected around{" "}
          <span data-testid="today-predicted-start-date">
            {formatShortDate(todayState.predictedStartDate)}
          </span>
          . Log your period start if bleeding begins.
        </p>
      </div>
    );
  } else {
    cardTestId = "today-cycle-card-late-for-period";

    body = (
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.2em] text-white/72">Today</p>
        <h2 className="text-2xl font-semibold tracking-tight">Waiting for your next period</h2>
        <p className="text-sm leading-6 text-white/78">
          Expected around{" "}
          <span data-testid="today-predicted-start-date">
            {formatShortDate(todayState.predictedStartDate)}
          </span>
          . Cycles can shift, so log your period start when it begins.
        </p>
      </div>
    );
  }

  return (
    <article
      className="rounded-[1.75rem] bg-accent px-5 py-5 text-white shadow-[0_16px_40px_rgba(169,52,86,0.24)]"
      data-testid={cardTestId}
    >
      <div className="flex flex-col gap-6">
        {body}
        <TodayCardCta href={ctaHref} label={ctaLabel} testId={ctaTestId} />
      </div>
    </article>
  );
}
