"use client";

import { useSyncExternalStore } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getCurrentSessionUser } from "@/features/auth/lib/auth-session";
import type {
  CycleEntry,
  CycleLogType,
  DischargeType,
  Mood,
  SexDriveLevel,
} from "@/types/tracking";

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

type CycleEntryRow = {
  id: string;
  date: string;
  log_type: CycleLogType;
  symptoms: string[] | null;
  mood: Mood | null;
  cravings: string | null;
  sex_drive: SexDriveLevel | null;
  discharge: DischargeType | null;
  notes: string | null;
};

type CycleStoreSnapshot = {
  entries: CycleEntry[];
  errorMessage: string;
  status: "idle" | "loading" | "ready" | "error";
  userId: string | null;
};

const supabase = createSupabaseBrowserClient();
const listeners = new Set<() => void>();

let loadPromise: Promise<void> | null = null;
let lastLoadedUserId: string | null | undefined;
let store: CycleStoreSnapshot = {
  entries: [],
  errorMessage: "",
  status: "idle",
  userId: null,
};

function emitChange() {
  listeners.forEach((listener) => listener());
}

function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return fallbackMessage;
}

function toEntry(row: CycleEntryRow): CycleEntry {
  return {
    id: row.id,
    date: row.date,
    logType: row.log_type,
    symptoms: row.symptoms ?? [],
    mood: row.mood ?? "",
    cravings: row.cravings ?? "",
    sexDrive: row.sex_drive ?? "",
    discharge: row.discharge ?? "",
    notes: row.notes ?? "",
  };
}

async function getAuthenticatedUser() {
  return getCurrentSessionUser();
}

async function loadEntries() {
  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = (async () => {
    try {
      const user = await getAuthenticatedUser();

      if (!user) {
        lastLoadedUserId = null;
        store = {
          entries: [],
          errorMessage: "",
          status: "ready",
          userId: null,
        };
        emitChange();
        return;
      }

      if (
        lastLoadedUserId === user.id &&
        (store.status === "ready" || store.status === "error")
      ) {
        return;
      }

      lastLoadedUserId = user.id;
      store = {
        ...store,
        errorMessage: "",
        status: "loading",
        userId: user.id,
      };
      emitChange();

      const { data, error } = await supabase
        .from("cycle_entries")
        .select(
          "id, date, log_type, symptoms, mood, cravings, sex_drive, discharge, notes",
        )
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      store = {
        entries: (data ?? []).map((row) => toEntry(row as CycleEntryRow)),
        errorMessage: "",
        status: "ready",
        userId: user.id,
      };
      emitChange();
    } catch (error) {
      console.error("Failed to load cycle entries:", error);
      store = {
        ...store,
        entries: [],
        errorMessage: getErrorMessage(error, "Unable to load cycle entries."),
        status: "error",
      };
      emitChange();
    } finally {
      loadPromise = null;
    }
  })();

  return loadPromise;
}

function ensureEntriesLoaded() {
  if (typeof window === "undefined") {
    return;
  }

  void loadEntries();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  ensureEntriesLoaded();

  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  ensureEntriesLoaded();
  return store;
}

function getServerSnapshot() {
  return store;
}

export async function addCycleEntry(entry: NewCycleEntry) {
  const user = await getAuthenticatedUser();

  if (!user) {
    throw new Error("You need to sign in to save cycle entries.");
  }

  const { data, error } = await supabase
    .from("cycle_entries")
    .insert({
      user_id: user.id,
      date: entry.date,
      log_type: entry.logType,
      symptoms: entry.symptoms,
      mood: entry.mood || null,
      cravings: entry.cravings || null,
      sex_drive: entry.sexDrive || null,
      discharge: entry.discharge || null,
      notes: entry.notes || null,
    })
    .select(
      "id, date, log_type, symptoms, mood, cravings, sex_drive, discharge, notes",
    )
    .single();

  if (error) {
    console.error("Failed to save cycle entry:", error);
    throw error;
  }

  const nextEntry = toEntry(data as CycleEntryRow);

  lastLoadedUserId = user.id;
  store = {
    entries: [nextEntry, ...store.entries.filter((current) => current.id !== nextEntry.id)],
    errorMessage: "",
    status: "ready",
    userId: user.id,
  };
  emitChange();

  return nextEntry;
}

export function useCycleEntriesState() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useCycleEntries() {
  return useCycleEntriesState().entries;
}

export function useCycleEntriesStatus() {
  const { errorMessage, status } = useCycleEntriesState();

  return { errorMessage, status };
}

export function useCycleEntry(id: string) {
  const cycleEntries = useCycleEntries();

  return cycleEntries.find((entry) => entry.id === id) ?? null;
}

export function useCycleEntryState(id: string) {
  const { entries, errorMessage, status } = useCycleEntriesState();

  return {
    entry: entries.find((currentEntry) => currentEntry.id === id) ?? null,
    errorMessage,
    status,
  };
}
