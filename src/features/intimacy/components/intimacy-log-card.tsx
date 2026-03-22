import Link from "next/link";
import { formatShortDate } from "@/lib/format-date";
import type { IntimacyEntry } from "@/types/tracking";

type IntimacyLogCardProps = {
  entry: IntimacyEntry;
};

export function IntimacyLogCard({ entry }: IntimacyLogCardProps) {
  return (
    <article
      data-testid={`intimacy-log-card-${entry.id}`}
      className="flex min-h-[180px] flex-col rounded-[1.5rem] border border-line bg-white px-4 py-4 shadow-[0_10px_30px_rgba(34,27,40,0.05)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold">{entry.partnerLabel}</p>
          <p className="mt-1 text-sm text-foreground/58">
            {formatShortDate(entry.date)}
          </p>
        </div>
        <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent-strong">
          {entry.mood}
        </span>
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-6 text-foreground/74">
        {entry.note}
      </p>

      <div
        data-testid={`intimacy-log-card-footer-${entry.id}`}
        className="mt-auto flex items-center justify-between border-t border-line/70 pt-4 text-sm text-foreground/62"
      >
        <span>
          {entry.protectionUsed ? "Protection used" : "No protection logged"}
        </span>
        <Link
          href={`/logs/intimacy/${entry.id}`}
          data-testid={`view-intimacy-details-${entry.id}`}
          className="font-medium text-accent-strong"
        >
          View details
        </Link>
      </div>
    </article>
  );
}
