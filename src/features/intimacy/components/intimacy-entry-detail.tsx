"use client";

import { useRouter } from "next/navigation";
import { formatShortDate } from "@/lib/format-date";
import { useIntimacyEntry } from "@/lib/intimacy-store";

type IntimacyEntryDetailProps = {
  id: string;
};

export function IntimacyEntryDetail({ id }: IntimacyEntryDetailProps) {
  const router = useRouter();
  const entry = useIntimacyEntry(id);

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
        data-testid="intimacy-detail-back"
        className="inline-flex rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-foreground/70 transition hover:bg-surface-muted"
      >
        Back
      </button>

      {entry ? (
        <section
          data-testid="intimacy-entry-detail"
          className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_18px_60px_rgba(160,73,98,0.12)] backdrop-blur"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-accent-strong/70">
                Intimacy log
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight">
                {entry.partnerLabel}
              </h1>
              <p className="mt-2 text-sm leading-6 text-foreground/64">
                {formatShortDate(entry.date)}
              </p>
            </div>
            <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent-strong">
              {entry.mood}
            </span>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/46">
                Entry type
              </p>
              <p className="mt-1 text-sm leading-6 text-foreground/78">
                {entry.partnerLabel}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/46">
                Protection used
              </p>
              <p className="mt-1 text-sm leading-6 text-foreground/78">
                {entry.protectionUsed ? "Yes" : "No"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/46">
                Mood
              </p>
              <p className="mt-1 text-sm leading-6 capitalize text-foreground/78">
                {entry.mood}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/46">
                Notes
              </p>
              <p className="mt-1 text-sm leading-6 text-foreground/78">
                {entry.note || "No notes added."}
              </p>
            </div>
          </div>
        </section>
      ) : (
        <section
          data-testid="intimacy-entry-not-found"
          className="rounded-[2rem] border border-dashed border-line bg-white/80 p-5 text-sm leading-6 text-foreground/62 shadow-[0_18px_60px_rgba(160,73,98,0.08)]"
        >
          This intimacy entry could not be found. It may have been cleared from
          local storage or never saved on this device.
        </section>
      )}
    </div>
  );
}
