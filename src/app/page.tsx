"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { BottomNav } from "@/features/shared/components/bottom-nav";
import { CycleEntryCard } from "@/features/cycle/components/cycle-entry-card";
import { CycleSummaryCard } from "@/features/cycle/components/cycle-summary-card";
import { IntimacyLogCard } from "@/features/intimacy/components/intimacy-log-card";
import { dashboardHighlights } from "@/constants/dashboard";
import { useCycleEntries } from "@/lib/cycle-entry-store";
import { useIntimacyEntries } from "@/lib/intimacy-store";

function subscribeToClientReady() {
  return () => {};
}

function getServerSnapshot() {
  return false;
}

function getClientSnapshot() {
  return true;
}

export default function Home() {
  const isClientReady = useSyncExternalStore(
    subscribeToClientReady,
    getClientSnapshot,
    getServerSnapshot,
  );
  const cycleEntries = useCycleEntries();
  const intimacyEntries = useIntimacyEntries();
  const displayedCycleEntries = isClientReady ? cycleEntries : [];
  const recentCycleEntries = displayedCycleEntries.slice(0, 2);
  const recentIntimacyEntries = (isClientReady ? intimacyEntries : []).slice(0, 2);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-24 pt-6 sm:px-6">
      <section className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_18px_60px_rgba(160,73,98,0.12)] backdrop-blur">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-accent-strong/70">
              Luna
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Cycle tracking, simplified.
            </h1>
          </div>
          <div className="rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent-strong">
            MVP
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          {dashboardHighlights.map((item) => (
            <article
              key={item.label}
              className="rounded-2xl border border-line bg-surface-muted px-3 py-4"
            >
              <p className="text-[11px] uppercase tracking-[0.2em] text-foreground/50">
                {item.label}
              </p>
              <p className="mt-2 text-xl font-semibold tracking-tight">{item.value}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-5">
        <CycleSummaryCard entries={displayedCycleEntries} />
      </section>

      <section className="mt-6">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-foreground/60">
          Quick actions
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link
            href="/logs/cycle/new"
            className="rounded-[1.5rem] bg-accent px-5 py-5 text-left text-white shadow-[0_12px_28px_rgba(169,52,86,0.22)] transition hover:bg-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-strong focus-visible:ring-offset-2"
          >
            <span className="block text-xl font-semibold leading-tight">
              Log Period / Symptoms
            </span>
          </Link>

          <Link
            href="/logs/intimacy/new"
            className="rounded-[1.5rem] border border-line bg-white px-5 py-5 text-left shadow-[0_10px_30px_rgba(34,27,40,0.05)] transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-strong focus-visible:ring-offset-2"
          >
            <span className="block text-xl font-semibold leading-tight">Log intimacy</span>
          </Link>

          <Link
            href="/calendar"
            className="rounded-[1.5rem] border border-line bg-surface-muted px-5 py-5 text-left shadow-[0_10px_30px_rgba(34,27,40,0.05)] transition hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-strong focus-visible:ring-offset-2"
          >
            <span className="block text-xl font-semibold leading-tight">View calendar</span>
          </Link>
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-base font-semibold">Recent cycle</p>
          {recentCycleEntries.length > 0 ? (
            <Link
              href="/logs/cycle/new"
              className="rounded-full border border-line bg-white px-3 py-2 text-sm font-medium"
            >
              + New
            </Link>
          ) : null}
        </div>

        <div className="space-y-3">
          {recentCycleEntries.length > 0 ? (
            recentCycleEntries.map((entry) => (
              <CycleEntryCard key={entry.id} entry={entry} />
            ))
          ) : (
            <article className="rounded-[1.5rem] border border-dashed border-line bg-white/75 px-4 py-5 text-sm text-foreground/58">
              No cycle entries yet.
            </article>
          )}
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-base font-semibold">Recent intimacy</p>
          <Link
            href="/logs/intimacy/new"
            className="rounded-full border border-line bg-white px-3 py-2 text-sm font-medium"
          >
            + New
          </Link>
        </div>

        <div className="space-y-3">
          {recentIntimacyEntries.length > 0 ? (
            recentIntimacyEntries.map((entry) => (
              <IntimacyLogCard key={entry.id} entry={entry} />
            ))
          ) : (
            <article className="rounded-[1.5rem] border border-dashed border-line bg-white/75 px-4 py-5 text-sm text-foreground/58">
              No intimacy logs yet.
            </article>
          )}
        </div>
      </section>

      <BottomNav />
    </main>
  );
}
