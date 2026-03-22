"use client";

import { useSyncExternalStore } from "react";
import type { IntimacyEntry, Mood } from "@/types/tracking";

const STORAGE_KEY = "luna.intimacyEntries";

type NewIntimacyEntry = {
  date: string;
  entryType: "Partner" | "Self";
  protectionUsed: "Yes" | "No";
  notes: string;
  mood: Mood;
};

let entries: IntimacyEntry[] = [];
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
  initializeEntries();
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
    entries = [];
    return false;
  }

  try {
    const parsedEntries = JSON.parse(storedEntries);

    if (Array.isArray(parsedEntries)) {
      entries = parsedEntries as IntimacyEntry[];
      return true;
    }
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
  }

  return false;
}

export function addIntimacyEntry(entry: NewIntimacyEntry) {
  initializeEntries();

  const nextEntry: IntimacyEntry = {
    id: crypto.randomUUID(),
    partnerLabel: entry.entryType,
    date: entry.date,
    protectionUsed: entry.protectionUsed === "Yes",
    mood: entry.mood,
    note: entry.notes,
  };

  entries = [nextEntry, ...entries];
  persistEntries();
  emitChange();
}

export function useIntimacyEntries() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useIntimacyEntry(id: string) {
  const intimacyEntries = useIntimacyEntries();

  return intimacyEntries.find((entry) => entry.id === id) ?? null;
}
