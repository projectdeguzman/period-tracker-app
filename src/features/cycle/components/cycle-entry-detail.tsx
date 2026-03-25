"use client";

import { useRouter } from "next/navigation";
import { formatShortDate } from "@/lib/format-date";
import { useCycleEntryState } from "@/lib/cycle-entry-store";

type CycleEntryDetailProps = {
  id: string;
};

export function CycleEntryDetail({ id }: CycleEntryDetailProps) {
  const router = useRouter();
  const { entry, errorMessage, status } = useCycleEntryState(id);

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={handleBack}
        data-testid="cycle-detail-back"
        className="inline-flex rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-foreground/70 transition hover:bg-surface-muted"
      >
        Back
      </button>

      {status === "loading" || status === "idle" ? (
        <section
          data-testid="cycle-entry-loading"
          className="rounded-[2rem] border border-dashed border-line bg-white/80 p-5 text-sm leading-6 text-foreground/62 shadow-[0_18px_60px_rgba(160,73,98,0.08)]"
        >
          Loading cycle entry...
        </section>
      ) : null}

      {status === "error" ? (
        <section
          data-testid="cycle-entry-error"
          className="rounded-[2rem] border border-dashed border-line bg-white/80 p-5 text-sm leading-6 text-foreground/62 shadow-[0_18px_60px_rgba(160,73,98,0.08)]"
        >
          {errorMessage || "Unable to load this cycle entry right now."}
        </section>
      ) : null}

      {status === "ready" && entry ? (
        <section
          data-testid="cycle-entry-detail"
          className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_18px_60px_rgba(160,73,98,0.12)] backdrop-blur"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-accent-strong/70">
                Cycle log
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight">
                {entry.logType}
              </h1>
              <p className="mt-2 text-sm leading-6 text-foreground/64">
                {formatShortDate(entry.date)}
              </p>
            </div>
            <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent-strong">
              Cycle
            </span>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/46">
                Log type
              </p>
              <p className="mt-1 text-sm leading-6 text-foreground/78">
                {entry.logType}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/46">
                Symptoms
              </p>
              <p className="mt-1 text-sm leading-6 text-foreground/78">
                {entry.symptoms.length > 0
                  ? entry.symptoms.join(", ")
                  : "No symptoms logged."}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/46">
                Mood
              </p>
              <p className="mt-1 text-sm leading-6 capitalize text-foreground/78">
                {entry.mood || "Not recorded"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/46">
                Cravings
              </p>
              <p className="mt-1 text-sm leading-6 text-foreground/78">
                {entry.cravings || "Not recorded"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/46">
                Sex drive
              </p>
              <p className="mt-1 text-sm leading-6 text-foreground/78">
                {entry.sexDrive || "Not recorded"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/46">
                Discharge
              </p>
              <p className="mt-1 text-sm leading-6 text-foreground/78">
                {entry.discharge || "Not recorded"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/46">
                Notes
              </p>
              <p className="mt-1 text-sm leading-6 text-foreground/78">
                {entry.notes || "No notes added."}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {status === "ready" && !entry ? (
        <section
          data-testid="cycle-entry-not-found"
          className="rounded-[2rem] border border-dashed border-line bg-white/80 p-5 text-sm leading-6 text-foreground/62 shadow-[0_18px_60px_rgba(160,73,98,0.08)]"
        >
          This cycle entry could not be found. It may have been deleted or may
          not belong to your account.
        </section>
      ) : null}
    </div>
  );
}
