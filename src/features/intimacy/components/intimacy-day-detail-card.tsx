import Link from "next/link";
import { formatShortDate } from "@/lib/format-date";
import type { IntimacyEntry } from "@/types/tracking";

type IntimacyDayDetailCardProps = {
  entry: IntimacyEntry;
};

export function IntimacyDayDetailCard({ entry }: IntimacyDayDetailCardProps) {
  return (
    <article
      data-testid={`calendar-intimacy-day-card-${entry.id}`}
      className="rounded-[1.5rem] border border-line bg-white px-4 py-4 shadow-[0_10px_30px_rgba(34,27,40,0.05)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold">{entry.partnerLabel}</p>
          <p className="mt-1 text-sm text-foreground/58">
            {formatShortDate(entry.date)}
          </p>
        </div>
        <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent-strong">
          Intimacy
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent-strong">
            {entry.mood}
          </span>
          <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-foreground/68">
            {entry.protectionUsed ? "Protection used" : "No protection logged"}
          </span>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/46">
            Notes
          </p>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-foreground/74">
            {entry.note || "No notes added."}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end border-t border-line/70 pt-4 text-sm">
        <Link
          href={`/logs/intimacy/${entry.id}`}
          data-testid={`calendar-view-intimacy-details-${entry.id}`}
          className="font-medium text-accent-strong"
        >
          View details
        </Link>
      </div>
    </article>
  );
}
