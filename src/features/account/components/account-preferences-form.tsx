"use client";

import Link from "next/link";
import { useState } from "react";
import {
  updateEnableGutCheckStreaksPreference,
  updateHideGutCheckDetailsPreference,
  updateHideIntimacyDetailsPreference,
  useProfilePreferencesState,
} from "@/lib/profile-preferences-store";
import { reopenWhatsNew } from "@/features/whats-new/lib/whats-new";

type AccountPreferencesFormProps = {
  displayName: string;
};

export function AccountPreferencesForm({
  displayName,
}: AccountPreferencesFormProps) {
  const preferences = useProfilePreferencesState();
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleHideDetailsToggle() {
    setErrorMessage("");
    setIsSaving(true);

    try {
      await updateHideGutCheckDetailsPreference(!preferences.hideGutCheckDetails);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to save preference.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleStreaksToggle() {
    setErrorMessage("");
    setIsSaving(true);

    try {
      await updateEnableGutCheckStreaksPreference(!preferences.enableGutCheckStreaks);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to save preference.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleHideIntimacyDetailsToggle() {
    setErrorMessage("");
    setIsSaving(true);

    try {
      await updateHideIntimacyDetailsPreference(!preferences.hideIntimacyDetails);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to save preference.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-24 pt-6 sm:px-6">
      <div className="mb-4">
        <Link
          href="/"
          className="inline-flex rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-foreground/70 transition hover:bg-surface-muted"
        >
          Back
        </Link>
      </div>

      <section className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_18px_60px_rgba(160,73,98,0.12)] backdrop-blur">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-accent-strong/70">
          Account
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {displayName}
        </h1>
        <p className="mt-3 text-sm leading-6 text-foreground/68">
          Manage the personal touches that shape how Luna shows your tracking data.
        </p>
        <button
          type="button"
          onClick={reopenWhatsNew}
          className="mt-4 inline-flex rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-foreground/70 transition hover:bg-surface-muted"
          data-testid="reopen-whats-new"
        >
          View what&apos;s new
        </button>
      </section>

      <section className="mt-5 rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_18px_60px_rgba(160,73,98,0.12)] backdrop-blur">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-lg font-semibold tracking-tight">
              Keep poop intel lowkey
            </p>
            <p className="mt-2 text-sm leading-6 text-foreground/62">
              Log it, track it, and keep the details out of sight unless you
              actually want to see them.
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={preferences.hideGutCheckDetails}
            onClick={handleHideDetailsToggle}
            disabled={isSaving || preferences.status === "loading"}
            data-testid="account-hide-gut-check-details-toggle"
            className={[
              "relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border transition",
              preferences.hideGutCheckDetails
                ? "border-accent bg-accent"
                : "border-line bg-surface-muted",
              isSaving || preferences.status === "loading"
                ? "cursor-not-allowed opacity-70"
                : "",
            ].join(" ")}
          >
            <span
              className={[
                "inline-block h-6 w-6 rounded-full bg-white shadow-[0_8px_18px_rgba(34,27,40,0.18)] transition-transform",
                preferences.hideGutCheckDetails ? "translate-x-7" : "translate-x-1",
              ].join(" ")}
            />
            <span className="sr-only">Toggle gut check detail visibility</span>
          </button>
        </div>

        <div className="mt-4 rounded-[1.25rem] border border-line bg-white/75 px-4 py-4 text-sm leading-6 text-foreground/62">
          {preferences.hideGutCheckDetails
            ? "Gut check details are hidden on your dashboard and calendar day view. Your calendar dot and all gut check logging actions still stay visible."
            : "Gut check details are visible on your dashboard and calendar day view. Your calendar dot always stays visible either way."}
        </div>

        <div className="mt-5 border-t border-line/70 pt-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-lg font-semibold tracking-tight">Enable Streaks?</p>
              <p className="mt-2 text-sm leading-6 text-foreground/62">
                For when your gut has main character momentum.
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={preferences.enableGutCheckStreaks}
              onClick={handleStreaksToggle}
              disabled={isSaving || preferences.status === "loading"}
              data-testid="account-enable-gut-check-streaks-toggle"
              className={[
                "relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border transition",
                preferences.enableGutCheckStreaks
                  ? "border-accent bg-accent"
                  : "border-line bg-surface-muted",
                isSaving || preferences.status === "loading"
                  ? "cursor-not-allowed opacity-70"
                  : "",
              ].join(" ")}
            >
              <span
                className={[
                  "inline-block h-6 w-6 rounded-full bg-white shadow-[0_8px_18px_rgba(34,27,40,0.18)] transition-transform",
                  preferences.enableGutCheckStreaks ? "translate-x-7" : "translate-x-1",
                ].join(" ")}
              />
              <span className="sr-only">Toggle gut check streaks</span>
            </button>
          </div>

          <div className="mt-4 rounded-[1.25rem] border border-line bg-white/75 px-4 py-4 text-sm leading-6 text-foreground/62">
            {preferences.hideGutCheckDetails
              ? "Streaks stay hidden while poop intel is in lowkey mode."
              : preferences.enableGutCheckStreaks
                ? "Streaks are on anywhere gut check details are visible."
                : "Streaks are off, so your gut check views stay extra minimal."}
          </div>
        </div>

        <div className="mt-5 border-t border-line/70 pt-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-lg font-semibold tracking-tight">
                Keep intimacy details lowkey
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground/62">
                Leave the heart on the calendar, but keep the details off your
                main screens unless you want the full tea.
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={preferences.hideIntimacyDetails}
              onClick={handleHideIntimacyDetailsToggle}
              disabled={isSaving || preferences.status === "loading"}
              data-testid="account-hide-intimacy-details-toggle"
              className={[
                "relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border transition",
                preferences.hideIntimacyDetails
                  ? "border-accent bg-accent"
                  : "border-line bg-surface-muted",
                isSaving || preferences.status === "loading"
                  ? "cursor-not-allowed opacity-70"
                  : "",
              ].join(" ")}
            >
              <span
                className={[
                  "inline-block h-6 w-6 rounded-full bg-white shadow-[0_8px_18px_rgba(34,27,40,0.18)] transition-transform",
                  preferences.hideIntimacyDetails ? "translate-x-7" : "translate-x-1",
                ].join(" ")}
              />
              <span className="sr-only">Toggle intimacy detail visibility</span>
            </button>
          </div>

          <div className="mt-4 rounded-[1.25rem] border border-line bg-white/75 px-4 py-4 text-sm leading-6 text-foreground/62">
            {preferences.hideIntimacyDetails
              ? "Intimacy details are hidden on your dashboard and calendar day view, while the calendar heart still stays visible."
              : "Intimacy details are visible on your dashboard and calendar day view, and the calendar heart still stays visible either way."}
          </div>
        </div>

        {preferences.status === "loading" ? (
          <p className="mt-3 text-sm text-foreground/58">Loading your preferences...</p>
        ) : null}

        {preferences.status === "error" ? (
          <p className="mt-3 text-sm text-accent-strong">
            {preferences.errorMessage || "Unable to load your preferences."}
          </p>
        ) : null}

        {errorMessage ? (
          <p className="mt-3 text-sm text-accent-strong">{errorMessage}</p>
        ) : null}
      </section>
    </main>
  );
}
