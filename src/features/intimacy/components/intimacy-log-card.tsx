import { formatShortDate } from "@/lib/format-date";
import type { IntimacyEntry } from "@/types/tracking";

type IntimacyLogCardProps = {
  entry: IntimacyEntry;
};

export function IntimacyLogCard({ entry }: IntimacyLogCardProps) {
  return (
    <article className="rounded-[1.5rem] border border-line bg-white px-4 py-4 shadow-[0_10px_30px_rgba(34,27,40,0.05)]">
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

      <p className="mt-3 text-sm leading-6 text-foreground/74">{entry.note}</p>

      <div className="mt-4 flex items-center justify-between text-sm text-foreground/62">
        <span>
          {entry.protectionUsed ? "Protection used" : "No protection logged"}
        </span>
        <button className="font-medium text-accent-strong">View details</button>
      </div>
    </article>
  );
}
