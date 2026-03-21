"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useState,
  type ChangeEventHandler,
  type SubmitEventHandler,
} from "react";
import { addPeriodEntry } from "@/lib/period-store";
import type { FlowIntensity } from "@/types/tracking";

const flowOptions: FlowIntensity[] = ["light", "medium", "heavy"];

type PeriodFormValues = {
  startDate: string;
  endDate: string;
  flowIntensity: FlowIntensity;
  symptoms: string;
};

const initialValues: PeriodFormValues = {
  startDate: new Date().toISOString().slice(0, 10),
  endDate: "",
  flowIntensity: "medium",
  symptoms: "",
};

export function PeriodEntryForm() {
  const router = useRouter();
  const [values, setValues] = useState<PeriodFormValues>(initialValues);

  function updateValue<K extends keyof PeriodFormValues>(
    key: K,
    value: PeriodFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    addPeriodEntry(values);
    console.log("Period entry draft:", values);
    router.push("/");
  };

  const handleStartDateChange: ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    updateValue("startDate", event.target.value);
  };

  const handleEndDateChange: ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    updateValue("endDate", event.target.value);
  };

  const handleSymptomsChange: ChangeEventHandler<HTMLTextAreaElement> = (
    event,
  ) => {
    updateValue("symptoms", event.target.value);
  };

  return (
    <form
      onSubmit={handleSubmit}
      data-testid="period-entry-form"
      className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_18px_60px_rgba(160,73,98,0.12)] backdrop-blur"
    >
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-accent-strong/70">
          New entry
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          Log period
        </h2>
        <p className="mt-3 text-sm leading-6 text-foreground/68">
          Capture the basics now and keep the flow simple for the MVP.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <label className="block" htmlFor="period-start-date">
          <span className="mb-2 block text-sm font-semibold">Start date</span>
          <input
            id="period-start-date"
            name="startDate"
            type="date"
            required
            value={values.startDate}
            onChange={handleStartDateChange}
            data-testid="period-start-date-input"
            className="w-full rounded-2xl border border-line bg-surface-muted px-4 py-3 outline-none transition focus:border-accent focus:bg-white"
          />
        </label>

        <label className="block" htmlFor="period-end-date">
          <span className="mb-2 block text-sm font-semibold">
            End date
            <span className="ml-2 text-xs font-medium text-foreground/52">
              Optional
            </span>
          </span>
          <input
            id="period-end-date"
            name="endDate"
            type="date"
            value={values.endDate}
            onChange={handleEndDateChange}
            data-testid="period-end-date-input"
            className="w-full rounded-2xl border border-line bg-surface-muted px-4 py-3 outline-none transition focus:border-accent focus:bg-white"
          />
        </label>

        <fieldset>
          <legend className="mb-2 block text-sm font-semibold">
            Flow intensity
          </legend>
          <div className="grid grid-cols-3 gap-3">
            {flowOptions.map((option) => (
              <button
                key={option}
                type="button"
                name="flowIntensity"
                aria-pressed={values.flowIntensity === option}
                onClick={() => updateValue("flowIntensity", option)}
                data-testid={`flow-intensity-${option}`}
                className={[
                  "rounded-2xl border px-4 py-3 text-sm font-medium capitalize transition",
                  values.flowIntensity === option
                    ? "border-accent bg-accent text-white shadow-[0_12px_28px_rgba(169,52,86,0.18)]"
                    : "border-line bg-white text-foreground hover:bg-surface-muted",
                ].join(" ")}
              >
                {option}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="block" htmlFor="period-symptoms">
          <span className="mb-2 block text-sm font-semibold">
            Symptoms
            <span className="ml-2 text-xs font-medium text-foreground/52">
              Optional
            </span>
          </span>
          <textarea
            id="period-symptoms"
            name="symptoms"
            value={values.symptoms}
            onChange={handleSymptomsChange}
            rows={5}
            placeholder="Add symptoms like cramps, fatigue, bloating, or mood changes."
            data-testid="period-symptoms-input"
            className="w-full rounded-2xl border border-line bg-surface-muted px-4 py-3 outline-none transition focus:border-accent focus:bg-white"
          />
        </label>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="submit"
          data-testid="save-period-entry"
          className="flex-1 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(169,52,86,0.22)] transition hover:bg-accent-strong"
        >
          Save entry
        </button>
        <Link
          href="/"
          data-testid="cancel-period-entry"
          className="rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold transition hover:bg-surface-muted"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
