"use client";

import { useSyncExternalStore } from "react";
import { periodEntries as seedEntries } from "@/constants/dashboard";
import type { FlowIntensity, PeriodEntry } from "@/types/tracking";

const STORAGE_KEY = "luna.periodEntries";

type NewPeriodEntry = {
  startDate: string;
  endDate: string;
  flowIntensity: FlowIntensity;
  symptoms: string;
};

let entries: PeriodEntry[] = [...seedEntries];
let hasLoadedFromStorage = false;

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  const didLoadEntries = initializeEntries();
  listeners.add(listener);

  if (didLoadEntries) {
    listener();
  }

  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return entries;
}

function persistEntries() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function initializeEntries() {
  if (hasLoadedFromStorage || typeof window === "undefined") {
    return false;
  }

  hasLoadedFromStorage = true;

  const storedEntries = window.localStorage.getItem(STORAGE_KEY);

  if (!storedEntries) {
    return false;
  }

  try {
    const parsedEntries = JSON.parse(storedEntries);

    if (Array.isArray(parsedEntries)) {
      entries = parsedEntries as PeriodEntry[];
      return true;
    }
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
  }

  return false;
}

export function addPeriodEntry(entry: NewPeriodEntry) {
  initializeEntries();

  const nextEntry: PeriodEntry = {
    id: crypto.randomUUID(),
    startDate: entry.startDate,
    endDate: entry.endDate,
    flowIntensity: entry.flowIntensity,
    symptoms: entry.symptoms,
  };

  entries = [nextEntry, ...entries];
  persistEntries();
  emitChange();
}

export function usePeriodEntries() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
