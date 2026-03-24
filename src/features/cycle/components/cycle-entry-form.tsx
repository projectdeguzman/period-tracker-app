"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useState,
  type ChangeEventHandler,
  type SubmitEventHandler,
} from "react";
import { addCycleEntry } from "@/lib/cycle-entry-store";
import type {
  CycleLogType,
  DischargeType,
  Mood,
  SexDriveLevel,
} from "@/types/tracking";

const logTypeOptions: CycleLogType[] = [
  "Period started",
  "Period ended",
  "Symptoms",
  "Ovulation signs",
];

const symptomOptions = [
  "Cramps",
  "Spotting",
  "Pelvic pain (left)",
  "Pelvic pain (right)",
  "Bloating",
  "Headache",
  "Fatigue",
  "Breast tenderness",
  "Acne",
  "Mood changes",
  "Cravings",
  "Discharge changes",
  "Libido changes",
] as const;

const moodOptions: Mood[] = [
  "playful",
  "steady",
  "energized",
  "sensitive",
  "low",
];

const sexDriveOptions: SexDriveLevel[] = ["Low", "Normal", "High"];
const dischargeOptions: DischargeType[] = [
  "None",
  "Dry",
  "Sticky",
  "Creamy",
  "Watery",
  "Egg-white",
];

type CycleFormValues = {
  date: string;
  logType: CycleLogType;
  symptoms: string[];
  mood: Mood | "";
  cravings: string;
  sexDrive: SexDriveLevel | "";
  discharge: DischargeType | "";
  notes: string;
};

const initialValues: CycleFormValues = {
  date: new Date().toISOString().slice(0, 10),
  logType: "Symptoms",
  symptoms: [],
  mood: "",
  cravings: "",
  sexDrive: "",
  discharge: "",
  notes: "",
};

export function CycleEntryForm() {
  const router = useRouter();
  const [values, setValues] = useState<CycleFormValues>(initialValues);

  function updateValue<K extends keyof CycleFormValues>(
    key: K,
    value: CycleFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function toggleSymptom(symptom: string) {
    setValues((current) => {
      const nextSymptoms = current.symptoms.includes(symptom)
        ? current.symptoms.filter((item) => item !== symptom)
        : [...current.symptoms, symptom];

      return { ...current, symptoms: nextSymptoms };
    });
  }

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    addCycleEntry(values);
    console.log("Cycle entry draft:", values);
    router.push("/");
  };

  const handleDateChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    updateValue("date", event.target.value);
  };

  const handleCravingsChange: ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    updateValue("cravings", event.target.value);
  };

  const handleNotesChange: ChangeEventHandler<HTMLTextAreaElement> = (
    event,
  ) => {
    updateValue("notes", event.target.value);
  };

  return (
    <form
      onSubmit={handleSubmit}
      data-testid="cycle-entry-form"
      className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_18px_60px_rgba(160,73,98,0.12)] backdrop-blur"
    >
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-accent-strong/70">
          New entry
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          Log Period / Symptoms
        </h2>
        <p className="mt-3 text-sm leading-6 text-foreground/68">
          Capture the signals that matter today, whether it is bleeding,
          ovulation signs, or symptom changes.
        </p>
      </div>

      <div className="mt-6 space-y-5">
        <label className="block" htmlFor="cycle-entry-date">
          <span className="mb-2 block text-sm font-semibold">Date</span>
          <input
            id="cycle-entry-date"
            name="date"
            type="date"
            required
            value={values.date}
            onChange={handleDateChange}
            data-testid="cycle-entry-date-input"
            className="w-full rounded-2xl border border-line bg-surface-muted px-4 py-3 outline-none transition focus:border-accent focus:bg-white"
          />
        </label>

        <fieldset>
          <legend className="mb-2 block text-sm font-semibold">Log type</legend>
          <div className="grid grid-cols-2 gap-3">
            {logTypeOptions.map((option) => (
              <button
                key={option}
                type="button"
                name="logType"
                aria-pressed={values.logType === option}
                onClick={() => updateValue("logType", option)}
                data-testid={`cycle-log-type-${option.toLowerCase().replaceAll(" ", "-")}`}
                className={[
                  "rounded-2xl border px-4 py-3 text-left text-sm font-medium transition",
                  values.logType === option
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
            Symptoms
            <span className="ml-2 text-xs font-medium text-foreground/52">
              Optional
            </span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {symptomOptions.map((option) => {
              const isSelected = values.symptoms.includes(option);

              return (
                <button
                  key={option}
                  type="button"
                  name="symptoms"
                  aria-pressed={isSelected}
                  onClick={() => toggleSymptom(option)}
                  data-testid={`cycle-symptom-${option
                    .toLowerCase()
                    .replaceAll(" ", "-")
                    .replaceAll("(", "")
                    .replaceAll(")", "")}`}
                  className={[
                    "rounded-full border px-4 py-2 text-sm font-medium transition",
                    isSelected
                      ? "border-accent bg-accent text-white"
                      : "border-line bg-white text-foreground/72 hover:bg-surface-muted",
                  ].join(" ")}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 block text-sm font-semibold">
            Mood
            <span className="ml-2 text-xs font-medium text-foreground/52">
              Optional
            </span>
          </legend>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              name="mood"
              aria-pressed={values.mood === ""}
              onClick={() => updateValue("mood", "")}
              data-testid="cycle-mood-none"
              className={[
                "rounded-full border px-4 py-2 text-sm font-medium transition",
                values.mood === ""
                  ? "border-accent bg-accent-soft text-accent-strong"
                  : "border-line bg-white text-foreground/72 hover:bg-surface-muted",
              ].join(" ")}
            >
              None
            </button>

            {moodOptions.map((option) => (
              <button
                key={option}
                type="button"
                name="mood"
                aria-pressed={values.mood === option}
                onClick={() => updateValue("mood", option)}
                data-testid={`cycle-mood-${option}`}
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

        <label className="block" htmlFor="cycle-cravings">
          <span className="mb-2 block text-sm font-semibold">
            Cravings
            <span className="ml-2 text-xs font-medium text-foreground/52">
              Optional
            </span>
          </span>
          <input
            id="cycle-cravings"
            name="cravings"
            type="text"
            value={values.cravings}
            onChange={handleCravingsChange}
            placeholder="Chocolate, salty snacks, fruit, or skip if none."
            data-testid="cycle-cravings-input"
            className="w-full rounded-2xl border border-line bg-surface-muted px-4 py-3 outline-none transition focus:border-accent focus:bg-white"
          />
        </label>

        <fieldset>
          <legend className="mb-2 block text-sm font-semibold">
            Sex drive
            <span className="ml-2 text-xs font-medium text-foreground/52">
              Optional
            </span>
          </legend>
          <div className="grid grid-cols-4 gap-3">
            <button
              type="button"
              name="sexDrive"
              aria-pressed={values.sexDrive === ""}
              onClick={() => updateValue("sexDrive", "")}
              data-testid="cycle-sex-drive-none"
              className={[
                "rounded-2xl border px-3 py-3 text-sm font-medium transition",
                values.sexDrive === ""
                  ? "border-accent bg-accent-soft text-accent-strong"
                  : "border-line bg-white text-foreground hover:bg-surface-muted",
              ].join(" ")}
            >
              None
            </button>

            {sexDriveOptions.map((option) => (
              <button
                key={option}
                type="button"
                name="sexDrive"
                aria-pressed={values.sexDrive === option}
                onClick={() => updateValue("sexDrive", option)}
                data-testid={`cycle-sex-drive-${option.toLowerCase()}`}
                className={[
                  "rounded-2xl border px-3 py-3 text-sm font-medium transition",
                  values.sexDrive === option
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
            Discharge
            <span className="ml-2 text-xs font-medium text-foreground/52">
              Optional
            </span>
          </legend>
          <div className="grid grid-cols-2 gap-3">
            {dischargeOptions.map((option) => (
              <button
                key={option}
                type="button"
                name="discharge"
                aria-pressed={values.discharge === option}
                onClick={() => updateValue("discharge", option)}
                data-testid={`cycle-discharge-${option.toLowerCase().replaceAll(" ", "-")}`}
                className={[
                  "rounded-2xl border px-4 py-3 text-left text-sm font-medium transition",
                  values.discharge === option
                    ? "border-accent bg-accent text-white"
                    : "border-line bg-white text-foreground hover:bg-surface-muted",
                ].join(" ")}
              >
                {option}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="block" htmlFor="cycle-notes">
          <span className="mb-2 block text-sm font-semibold">
            Notes
            <span className="ml-2 text-xs font-medium text-foreground/52">
              Optional
            </span>
          </span>
          <textarea
            id="cycle-notes"
            name="notes"
            value={values.notes}
            onChange={handleNotesChange}
            rows={5}
            placeholder="Anything else you want to remember about this cycle day."
            data-testid="cycle-notes-input"
            className="w-full rounded-2xl border border-line bg-surface-muted px-4 py-3 outline-none transition focus:border-accent focus:bg-white"
          />
        </label>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="submit"
          data-testid="save-cycle-entry"
          className="flex-1 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(169,52,86,0.22)] transition hover:bg-accent-strong"
        >
          Save entry
        </button>
        <Link
          href="/"
          data-testid="cancel-cycle-entry"
          className="rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold transition hover:bg-surface-muted"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
