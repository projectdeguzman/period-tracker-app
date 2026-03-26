"use client";

import { useRouter } from "next/navigation";
import { useState, type ChangeEventHandler, type FormEventHandler } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type OnboardingFormProps = {
  initialCycleLength?: number | null;
  initialDateOfBirth?: string | null;
  initialName?: string | null;
};

type OnboardingValues = {
  avgCycleLength: string;
  dateOfBirth: string;
  name: string;
};

function validate(values: OnboardingValues) {
  if (!values.name.trim()) {
    return "Enter your name.";
  }

  if (!values.dateOfBirth) {
    return "Enter your date of birth.";
  }

  if (values.avgCycleLength) {
    const cycleLength = Number(values.avgCycleLength);

    if (!Number.isInteger(cycleLength) || cycleLength < 15 || cycleLength > 60) {
      return "Typical cycle length must be between 15 and 60 days.";
    }
  }

  return null;
}

export function OnboardingForm({
  initialCycleLength = null,
  initialDateOfBirth = null,
  initialName = null,
}: OnboardingFormProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [values, setValues] = useState<OnboardingValues>({
    avgCycleLength: initialCycleLength ? `${initialCycleLength}` : "",
    dateOfBirth: initialDateOfBirth ?? "",
    name: initialName ?? "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNameChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setValues((current) => ({ ...current, name: event.target.value }));
  };

  const handleDateOfBirthChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setValues((current) => ({ ...current, dateOfBirth: event.target.value }));
  };

  const handleCycleLengthChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setValues((current) => ({ ...current, avgCycleLength: event.target.value }));
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    const validationMessage = validate(values);

    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    setIsSubmitting(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!session?.user) {
        throw new Error("You need to sign in to continue.");
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          avg_cycle_length: values.avgCycleLength ? Number(values.avgCycleLength) : null,
          date_of_birth: values.dateOfBirth,
          name: values.name.trim(),
        })
        .eq("id", session.user.id);

      if (error) {
        throw error;
      }

      router.replace("/");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to save your profile.",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-8 sm:px-6">
      <section
        className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_18px_60px_rgba(160,73,98,0.12)] backdrop-blur"
        data-testid="onboarding-card"
      >
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-accent-strong/70">
            Luna
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            A quick personalized setup
          </h1>
          <p className="mt-3 text-sm leading-6 text-foreground/68">
            Add a few basics so Luna can personalize your experience and support
            better predictions later.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4"
          data-testid="onboarding-form"
        >
          <label className="block" htmlFor="onboarding-name">
            <span className="mb-2 block text-sm font-semibold">Name</span>
            <input
              id="onboarding-name"
              name="name"
              type="text"
              value={values.name}
              onChange={handleNameChange}
              className="w-full rounded-2xl border border-line bg-surface-muted px-4 py-3 outline-none transition focus:border-accent focus:bg-white"
              data-testid="onboarding-name-input"
            />
          </label>

          <label className="block" htmlFor="onboarding-date-of-birth">
            <span className="mb-2 block text-sm font-semibold">Date of Birth</span>
            <input
              id="onboarding-date-of-birth"
              name="dateOfBirth"
              type="date"
              value={values.dateOfBirth}
              onChange={handleDateOfBirthChange}
              className="w-full rounded-2xl border border-line bg-surface-muted px-4 py-3 outline-none transition focus:border-accent focus:bg-white"
              data-testid="onboarding-date-of-birth-input"
            />
          </label>

          <label className="block" htmlFor="onboarding-cycle-length">
            <span className="mb-2 block text-sm font-semibold">
              Typical cycle length in days
              <span className="ml-2 text-xs font-medium text-foreground/52">Optional</span>
            </span>
            <input
              id="onboarding-cycle-length"
              name="avgCycleLength"
              type="number"
              inputMode="numeric"
              min="15"
              max="60"
              value={values.avgCycleLength}
              onChange={handleCycleLengthChange}
              className="w-full rounded-2xl border border-line bg-surface-muted px-4 py-3 outline-none transition focus:border-accent focus:bg-white"
              data-testid="onboarding-cycle-length-input"
            />
          </label>

          {errorMessage ? (
            <p
              className="rounded-2xl border border-accent/20 bg-accent-soft/60 px-4 py-3 text-sm text-accent-strong"
              data-testid="onboarding-error"
            >
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(169,52,86,0.22)] transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-70"
            data-testid="onboarding-submit"
          >
            {isSubmitting ? "Saving..." : "Continue"}
          </button>
        </form>
      </section>
    </main>
  );
}
