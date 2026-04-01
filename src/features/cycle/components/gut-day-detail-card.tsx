import { GutStreakIndicator } from "@/features/cycle/components/gut-streak-indicator";
import { formatShortDate } from "@/lib/format-date";
import type { GutTrackingEntry } from "@/types/tracking";

type GutDayDetailCardProps = {
  entry: GutTrackingEntry;
};

export function GutDayDetailCard({ entry }: GutDayDetailCardProps) {
  return (
    <article
      data-testid={`calendar-gut-day-card-${entry.id}`}
      className="rounded-[1.5rem] border border-line bg-white px-4 py-4 shadow-[0_10px_30px_rgba(34,27,40,0.05)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold capitalize">{entry.poopType}</p>
          <p className="mt-1 text-sm text-foreground/58">
            {formatShortDate(entry.logDate)}
          </p>
        </div>
        <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent-strong">
          Gut check
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-medium capitalize text-accent-strong">
            {entry.poopType}
          </span>
          <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-foreground/68">
            {entry.effort ? `Effort: ${entry.effort}` : "Effort not recorded"}
          </span>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/46">
            Notes
          </p>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-foreground/74">
            {entry.notes || "No gut notes added."}
          </p>
        </div>

        <div className="border-t border-line/70 pt-2">
          <GutStreakIndicator date={entry.logDate} />
        </div>
      </div>
    </article>
  );
}
