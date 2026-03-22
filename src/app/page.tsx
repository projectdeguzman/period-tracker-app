"use client";

import Link from "next/link";
import { BottomNav } from "@/features/shared/components/bottom-nav";
import { CycleEntryCard } from "@/features/cycle/components/cycle-entry-card";
import { CycleSummaryCard } from "@/features/cycle/components/cycle-summary-card";
import { IntimacyLogCard } from "@/features/intimacy/components/intimacy-log-card";
import { dashboardHighlights, todayCycleSnapshot } from "@/constants/dashboard";
import { useCycleEntries } from "@/lib/cycle-entry-store";
import { useIntimacyEntries } from "@/lib/intimacy-store";

export default function Home() {
  const cycleEntries = useCycleEntries().slice(0, 2);
  const intimacyEntries = useIntimacyEntries().slice(0, 2);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-24 pt-6 sm:px-6">
      <section className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_18px_60px_rgba(160,73,98,0.12)] backdrop-blur">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-accent-strong/70">
              Luna
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Track your cycle with more context.
            </h1>
          </div>
          <div className="rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent-strong">
            MVP
          </div>
        </div>
        <p className="mt-4 max-w-sm text-sm leading-6 text-foreground/72">
          A calm daily view for period symptoms, intimacy notes, and the small
          patterns that help you understand your body.
        </p>

        <div className="mt-6 grid grid-cols-3 gap-3">
          {dashboardHighlights.map((item) => (
            <article
              key={item.label}
              className="rounded-2xl border border-line bg-surface-muted px-3 py-4"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-foreground/50">
                {item.label}
              </p>
              <p className="mt-2 text-lg font-semibold">{item.value}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-5">
        <CycleSummaryCard snapshot={todayCycleSnapshot} />
      </section>

      <section className="mt-5">
        <div className="mb-3">
          <p className="text-sm font-semibold">Quick actions</p>
          <p className="text-sm text-foreground/60">
            Start the most common tracking flows in one tap.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link
            href="/logs/cycle/new"
            className="rounded-[1.5rem] bg-accent px-4 py-4 text-left text-white shadow-[0_12px_28px_rgba(169,52,86,0.22)] transition hover:bg-accent-strong"
          >
            <span className="block text-sm font-semibold">
              Log Period / Symptoms
            </span>
            <span className="mt-1 block text-sm text-white/78">
              Track bleeding, symptoms, or ovulation signs.
            </span>
          </Link>

          <Link
            href="/logs/intimacy/new"
            className="rounded-[1.5rem] border border-line bg-white px-4 py-4 text-left shadow-[0_10px_30px_rgba(34,27,40,0.05)] transition hover:bg-surface-muted"
          >
            <span className="block text-sm font-semibold">Log intimacy</span>
            <span className="mt-1 block text-sm text-foreground/62">
              Capture a private, quick entry.
            </span>
          </Link>

          <Link
            href="/calendar"
            className="rounded-[1.5rem] border border-line bg-surface-muted px-4 py-4 text-left shadow-[0_10px_30px_rgba(34,27,40,0.05)] transition hover:bg-accent-soft"
          >
            <span className="block text-sm font-semibold">View calendar</span>
            <span className="mt-1 block text-sm text-foreground/62">
              Review cycle history and trends.
            </span>
          </Link>
        </div>
      </section>

      <section className="mt-5">
        <div className="mb-3">
          <p className="text-sm font-semibold">Recent cycle entries</p>
          <p className="text-sm text-foreground/60">
            Quick cycle events and symptom logs from your recent check-ins.
          </p>
        </div>

        <div className="space-y-3">
          {cycleEntries.length > 0 ? (
            cycleEntries.map((entry) => (
              <CycleEntryCard key={entry.id} entry={entry} />
            ))
          ) : (
            <article className="rounded-[1.5rem] border border-dashed border-line bg-white/75 px-4 py-5 text-sm leading-6 text-foreground/58">
              No cycle entries yet. Start with Log Period / Symptoms to save
              your first entry.
            </article>
          )}
        </div>
      </section>

      <section className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Recent intimacy logs</p>
            <p className="text-sm text-foreground/60">
              Quick entries built for privacy-first journaling.
            </p>
          </div>
          <Link
            href="/logs/intimacy/new"
            className="rounded-full border border-line bg-white px-3 py-2 text-sm font-medium"
          >
            + New
          </Link>
        </div>

        <div className="space-y-3">
          {intimacyEntries.length > 0 ? (
            intimacyEntries.map((entry) => (
              <IntimacyLogCard key={entry.id} entry={entry} />
            ))
          ) : (
            <article className="rounded-[1.5rem] border border-dashed border-line bg-white/75 px-4 py-5 text-sm leading-6 text-foreground/58">
              No intimacy logs yet. Tap + New to create your first entry.
            </article>
          )}
        </div>
      </section>

      <BottomNav />
    </main>
  );
}
