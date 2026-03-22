import type { CycleSnapshot } from "@/types/tracking";

type CycleSummaryCardProps = {
  snapshot: CycleSnapshot;
};

export function CycleSummaryCard({ snapshot }: CycleSummaryCardProps) {
  return (
    <article className="rounded-[1.75rem] bg-accent px-5 py-5 text-white shadow-[0_16px_40px_rgba(169,52,86,0.24)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-white/72">
            Today
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            Day {snapshot.currentDay}, {snapshot.phase} phase
          </h2>
        </div>
        <div className="rounded-full bg-white/18 px-3 py-1 text-sm font-medium">
          {snapshot.mood}
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-white/84">{snapshot.note}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {snapshot.symptoms.map((symptom) => (
          <span
            key={symptom}
            className="rounded-full bg-white/16 px-3 py-1.5 text-sm"
          >
            {symptom}
          </span>
        ))}
      </div>
    </article>
  );
}
