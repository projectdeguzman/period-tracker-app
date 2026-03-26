import Link from "next/link";
import { formatShortDate } from "@/lib/format-date";
import type { CycleEntry } from "@/types/tracking";

type CycleDayDetailCardProps = {
  entry: CycleEntry;
};

export function CycleDayDetailCard({ entry }: CycleDayDetailCardProps) {
  return (
    <article
      data-testid={`calendar-cycle-day-card-${entry.id}`}
      className="rounded-[1.5rem] border border-line bg-white px-4 py-4 shadow-[0_10px_30px_rgba(34,27,40,0.05)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold">{entry.logType}</p>
          <p className="mt-1 text-sm text-foreground/58">
            {formatShortDate(entry.date)}
          </p>
        </div>
        <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent-strong">
          Cycle
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/46">
            Symptoms
          </p>
          {entry.symptoms.length > 0 ? (
            <p className="mt-1 line-clamp-2 text-sm leading-6 text-foreground/74">
              {entry.symptoms.join(", ")}
            </p>
          ) : (
            <p className="mt-1 text-sm leading-6 text-foreground/52">
              No symptoms logged.
            </p>
          )}
        </div>

        {entry.notes ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/46">
              Notes
            </p>
            <p className="mt-1 line-clamp-2 text-sm leading-6 text-foreground/74">
              {entry.notes}
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-end border-t border-line/70 pt-4 text-sm">
        <Link
          href={`/logs/cycle/${entry.id}`}
          data-testid={`calendar-view-cycle-details-${entry.id}`}
          className="font-medium text-accent-strong"
        >
          View details
        </Link>
      </div>
    </article>
  );
}
