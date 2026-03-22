"use client";

import { useSyncExternalStore } from "react";
import { cycleEntries as seedEntries } from "@/constants/dashboard";
import type {
  CycleEntry,
  CycleLogType,
  DischargeType,
  Mood,
  SexDriveLevel,
} from "@/types/tracking";

const STORAGE_KEY = "luna.cycleEntries";
const LEGACY_STORAGE_KEY = "luna.periodEntries";

type NewCycleEntry = {
  date: string;
  logType: CycleLogType;
  symptoms: string[];
  mood: Mood | "";
  cravings: string;
  sexDrive: SexDriveLevel | "";
  discharge: DischargeType | "";
  notes: string;
};

let entries: CycleEntry[] = [...seedEntries];
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

function parseStoredEntries(rawEntries: string) {
  const parsedEntries = JSON.parse(rawEntries);

  if (Array.isArray(parsedEntries)) {
    entries = parsedEntries as CycleEntry[];
    return true;
  }

  return false;
}

function initializeEntries() {
  if (hasLoadedFromStorage || typeof window === "undefined") {
    return false;
  }

  hasLoadedFromStorage = true;

  const storedEntries =
    window.localStorage.getItem(STORAGE_KEY) ??
    window.localStorage.getItem(LEGACY_STORAGE_KEY);

  if (!storedEntries) {
    return false;
  }

  try {
    const didLoadEntries = parseStoredEntries(storedEntries);

    if (didLoadEntries) {
      persistEntries();
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
      return true;
    }
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
  }

  return false;
}

export function addCycleEntry(entry: NewCycleEntry) {
  initializeEntries();

  const nextEntry: CycleEntry = {
    id: crypto.randomUUID(),
    date: entry.date,
    logType: entry.logType,
    symptoms: entry.symptoms,
    mood: entry.mood,
    cravings: entry.cravings,
    sexDrive: entry.sexDrive,
    discharge: entry.discharge,
    notes: entry.notes,
  };

  entries = [nextEntry, ...entries];
  persistEntries();
  emitChange();
}

export function useCycleEntries() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
