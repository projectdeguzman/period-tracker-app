"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useState,
  type ChangeEventHandler,
  type SubmitEventHandler,
} from "react";
import { addIntimacyEntry } from "@/lib/intimacy-store";
import type { Mood } from "@/types/tracking";

const moodOptions: Mood[] = [
  "playful",
  "steady",
  "energized",
  "sensitive",
  "low",
];

type EntryType = "Partner" | "Self";

type IntimacyFormValues = {
  date: string;
  entryType: EntryType;
  protectionUsed: "Yes" | "No";
  notes: string;
  mood: Mood;
};

const initialValues: IntimacyFormValues = {
  date: new Date().toISOString().slice(0, 10),
  entryType: "Partner",
  protectionUsed: "Yes",
  notes: "",
  mood: "steady",
};

export function IntimacyEntryForm() {
  const router = useRouter();
  const [values, setValues] = useState<IntimacyFormValues>(initialValues);

  function updateValue<K extends keyof IntimacyFormValues>(
    key: K,
    value: IntimacyFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    addIntimacyEntry(values);
    console.log("Intimacy entry draft:", values);
    router.push("/");
  };

  const handleDateChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    updateValue("date", event.target.value);
  };

  const handleNotesChange: ChangeEventHandler<HTMLTextAreaElement> = (
    event,
  ) => {
    updateValue("notes", event.target.value);
  };

  return (
    <form
      onSubmit={handleSubmit}
      data-testid="intimacy-entry-form"
      className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_18px_60px_rgba(160,73,98,0.12)] backdrop-blur"
    >
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-accent-strong/70">
          New entry
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          Log intimacy
        </h2>
        <p className="mt-3 text-sm leading-6 text-foreground/68">
          Save a quick private snapshot for now. This MVP version logs values to
          the console only.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <label className="block" htmlFor="intimacy-date">
          <span className="mb-2 block text-sm font-semibold">Date</span>
          <input
            id="intimacy-date"
            name="date"
            type="date"
            value={values.date}
            onChange={handleDateChange}
            data-testid="intimacy-date-input"
            className="w-full rounded-2xl border border-line bg-surface-muted px-4 py-3 outline-none transition focus:border-accent focus:bg-white"
          />
        </label>

        <fieldset>
          <legend className="mb-2 block text-sm font-semibold">
            Entry type
          </legend>
          <div className="grid grid-cols-2 gap-3">
            {(["Partner", "Self"] as const).map((option) => (
              <button
                key={option}
                type="button"
                name="entryType"
                aria-pressed={values.entryType === option}
                onClick={() => updateValue("entryType", option)}
                data-testid={`entry-type-${option.toLowerCase()}`}
                className={[
                  "rounded-2xl border px-4 py-3 text-sm font-medium transition",
                  values.entryType === option
                    ? "border-accent bg-accent text-white shadow-[0_12px_28px_rgba(169,52,86,0.18)]"
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
            Protection used
          </legend>
          <div className="grid grid-cols-2 gap-3">
            {(["Yes", "No"] as const).map((option) => (
              <button
                key={option}
                type="button"
                name="protectionUsed"
                aria-pressed={values.protectionUsed === option}
                onClick={() => updateValue("protectionUsed", option)}
                data-testid={`protection-used-${option.toLowerCase()}`}
                className={[
                  "rounded-2xl border px-4 py-3 text-sm font-medium transition",
                  values.protectionUsed === option
                    ? "border-accent bg-accent-soft text-accent-strong"
                    : "border-line bg-white text-foreground hover:bg-surface-muted",
                ].join(" ")}
              >
                {option}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="block" htmlFor="intimacy-notes">
          <span className="mb-2 block text-sm font-semibold">Notes</span>
          <textarea
            id="intimacy-notes"
            name="notes"
            value={values.notes}
            onChange={handleNotesChange}
            rows={5}
            placeholder="Add context, comfort level, symptoms, or anything you want to remember."
            data-testid="intimacy-notes-input"
            className="w-full rounded-2xl border border-line bg-surface-muted px-4 py-3 outline-none transition focus:border-accent focus:bg-white"
          />
        </label>

        <fieldset>
          <legend className="mb-2 block text-sm font-semibold">Mood tag</legend>
          <div className="flex flex-wrap gap-2">
            {moodOptions.map((option) => (
              <button
                key={option}
                type="button"
                name="mood"
                aria-pressed={values.mood === option}
                onClick={() => updateValue("mood", option)}
                data-testid={`mood-${option}`}
                className={[
                  "rounded-full border px-4 py-2 text-sm font-medium capitalize transition",
                  values.mood === option
                    ? "border-accent bg-accent text-white"
                    : "border-line bg-white text-foreground/72 hover:bg-surface-muted",
                ].join(" ")}
              >
                {option}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="submit"
          data-testid="save-intimacy-entry"
          className="flex-1 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(169,52,86,0.22)] transition hover:bg-accent-strong"
        >
          Save entry
        </button>
        <Link
          href="/"
          data-testid="cancel-intimacy-entry"
          className="rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold transition hover:bg-surface-muted"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
