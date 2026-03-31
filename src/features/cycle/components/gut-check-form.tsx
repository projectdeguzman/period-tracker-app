"use client";

import { useRouter } from "next/navigation";
import { useState, type ChangeEventHandler, type SubmitEventHandler } from "react";
import { addGutTrackingEntry } from "@/lib/cycle-entry-store";
import type { GutEffort, GutPoopType } from "@/types/tracking";

const gutPoopTypeOptions: GutPoopType[] = ["smooth", "hard", "loose", "none"];
const gutEffortOptions: GutEffort[] = ["easy", "normal", "struggled"];

const gutEffortLabels: Record<GutEffort, string> = {
  easy: "Easy 😌✨",
  normal: "Normal 🙂👍",
  struggled: "Struggled 🥵🪨",
};

type GutCheckFormValues = {
  logDate: string;
  poopType: GutPoopType | "";
  effort: GutEffort | "";
  notes: string;
};

const initialValues: GutCheckFormValues = {
  logDate: new Date().toISOString().slice(0, 10),
  poopType: "",
  effort: "",
  notes: "",
};

export function GutCheckForm() {
  const router = useRouter();
  const [values, setValues] = useState<GutCheckFormValues>(initialValues);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  function updateValue<K extends keyof GutCheckFormValues>(
    key: K,
    value: GutCheckFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSaved(false);

    if (!values.poopType) {
      setErrorMessage("Choose an option or skip gut check for today.");
      return;
    }

    setIsSubmitting(true);

    try {
      await addGutTrackingEntry(values);
      setIsSaved(true);
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to save gut check.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDateChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    updateValue("logDate", event.target.value);
  };

  const handleNotesChange: ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    updateValue("notes", event.target.value);
  };

  return (
    <form
      id="gut-check"
      onSubmit={handleSubmit}
      data-testid="gut-check-form"
      className="mt-5 rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_18px_60px_rgba(160,73,98,0.12)] backdrop-blur"
    >
      <p className="text-sm font-medium uppercase tracking-[0.24em] text-accent-strong/70">
        Daily add-on
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">Gut Check</h2>
      <p className="mt-3 text-sm leading-6 text-foreground/68">
        Optional notes about digestion for your own awareness.
      </p>

      <div className="mt-6 space-y-5">
        <label className="block" htmlFor="gut-check-date">
          <span className="mb-2 block text-sm font-semibold">Date</span>
          <input
            id="gut-check-date"
            name="logDate"
            type="date"
            required
            value={values.logDate}
            onChange={handleDateChange}
            data-testid="gut-check-date-input"
            className="w-full rounded-2xl border border-line bg-surface-muted px-4 py-3 outline-none transition focus:border-accent focus:bg-white"
          />
        </label>

        <fieldset>
          <legend className="mb-2 block text-sm font-semibold">Gut type</legend>
          <div className="grid grid-cols-2 gap-3">
            {gutPoopTypeOptions.map((option) => (
              <button
                key={option}
                type="button"
                name="poopType"
                aria-pressed={values.poopType === option}
                onClick={() => updateValue("poopType", option)}
                data-testid={`gut-check-poop-type-${option}`}
                className={[
                  "rounded-2xl border px-4 py-3 text-left text-sm font-medium capitalize transition",
                  values.poopType === option
                    ? "border-accent bg-accent text-white"
                    : "border-line bg-white text-foreground hover:bg-surface-muted",
                ].join(" ")}
              >
                {option}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 block text-sm font-semibold">
            Effort
            <span className="ml-2 text-xs font-medium text-foreground/52">Optional</span>
          </legend>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              name="effort"
              aria-pressed={values.effort === ""}
              onClick={() => updateValue("effort", "")}
              data-testid="gut-check-effort-none"
              className={[
                "rounded-2xl border px-3 py-3 text-sm font-medium transition",
                values.effort === ""
                  ? "border-accent bg-accent-soft text-accent-strong"
                  : "border-line bg-white text-foreground hover:bg-surface-muted",
              ].join(" ")}
            >
              None
            </button>
            {gutEffortOptions.map((option) => (
              <button
                key={option}
                type="button"
                name="effort"
                aria-pressed={values.effort === option}
                onClick={() => updateValue("effort", option)}
                data-testid={`gut-check-effort-${option}`}
                className={[
                  "rounded-2xl border px-3 py-3 text-sm font-medium capitalize transition",
                  values.effort === option
                    ? "border-accent bg-accent text-white"
                    : "border-line bg-white text-foreground hover:bg-surface-muted",
                ].join(" ")}
              >
                {gutEffortLabels[option]}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="block" htmlFor="gut-check-notes">
          <span className="mb-2 block text-sm font-semibold">
            Notes
            <span className="ml-2 text-xs font-medium text-foreground/52">Optional</span>
          </span>
          <textarea
            id="gut-check-notes"
            name="notes"
            value={values.notes}
            onChange={handleNotesChange}
            rows={3}
            placeholder="Any neutral notes you want to remember for today."
            data-testid="gut-check-notes-input"
            className="w-full rounded-2xl border border-line bg-surface-muted px-4 py-3 outline-none transition focus:border-accent focus:bg-white"
          />
        </label>
      </div>

      {errorMessage ? (
        <p
          className="mt-4 rounded-2xl border border-accent/20 bg-accent-soft/60 px-4 py-3 text-sm text-accent-strong"
          data-testid="gut-check-form-error"
        >
          {errorMessage}
        </p>
      ) : null}

      {isSaved ? (
        <p
          className="mt-4 rounded-2xl border border-line bg-surface-muted px-4 py-3 text-sm text-foreground/72"
          data-testid="gut-check-form-success"
        >
          Gut check saved.
        </p>
      ) : null}

      <div className="mt-6 flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          data-testid="save-gut-check"
          className="flex-1 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(169,52,86,0.22)] transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Saving..." : "Save gut check"}
        </button>
      </div>
    </form>
  );
}
