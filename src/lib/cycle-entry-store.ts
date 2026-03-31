"use client";

import { useSyncExternalStore } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getCurrentSessionUser } from "@/features/auth/lib/auth-session";
import type {
  CycleEntry,
  CycleLogType,
  DischargeType,
  GutEffort,
  GutPoopType,
  GutTrackingEntry,
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

type GutTrackingRow = {
  id: string;
  cycle_entry_id: string | null;
  log_date: string;
  poop_type: GutPoopType;
  effort: GutEffort | null;
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

function toGutTracking(row: GutTrackingRow): GutTrackingEntry {
  return {
    id: row.id,
    logDate: row.log_date,
    poopType: row.poop_type,
    effort: row.effort ?? "",
    notes: row.notes ?? "",
  };
}

function toEntry(row: CycleEntryRow, gutTracking: GutTrackingEntry | null): CycleEntry {
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
    gutTracking,
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

      const cycleRows = (data ?? []) as CycleEntryRow[];
      const cycleEntryIds = cycleRows.map((row) => row.id);
      const gutEntriesByCycleId = new Map<string, GutTrackingEntry>();

      if (cycleEntryIds.length > 0) {
        const { data: gutData, error: gutError } = await supabase
          .from("gut_tracking")
          .select("id, cycle_entry_id, log_date, poop_type, effort, notes")
          .in("cycle_entry_id", cycleEntryIds)
          .order("created_at", { ascending: false });

        if (gutError) {
          throw gutError;
        }

        for (const row of (gutData ?? []) as GutTrackingRow[]) {
          if (!row.cycle_entry_id || gutEntriesByCycleId.has(row.cycle_entry_id)) {
            continue;
          }

          gutEntriesByCycleId.set(row.cycle_entry_id, toGutTracking(row));
        }
      }

      store = {
        entries: cycleRows.map((row) =>
          toEntry(row, gutEntriesByCycleId.get(row.id) ?? null),
        ),
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

  const cycleEntryRow = data as CycleEntryRow;
  const nextEntry = toEntry(cycleEntryRow, null);

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

type NewGutTrackingEntry = {
  logDate: string;
  poopType: GutPoopType | "";
  effort: GutEffort | "";
  notes: string;
};

export async function addGutTrackingEntry(entry: NewGutTrackingEntry) {
  const user = await getAuthenticatedUser();

  if (!user) {
    throw new Error("You need to sign in to save gut checks.");
  }

  if (!entry.poopType) {
    throw new Error("Choose a gut type to save your gut check.");
  }

  const matchingCycleEntry = store.entries.find((currentEntry) => {
    return currentEntry.date === entry.logDate;
  });

  const { data, error } = await supabase
    .from("gut_tracking")
    .insert({
      user_id: user.id,
      cycle_entry_id: matchingCycleEntry?.id ?? null,
      log_date: entry.logDate,
      poop_type: entry.poopType,
      effort: entry.effort || null,
      notes: entry.notes || null,
    })
    .select("id, cycle_entry_id, log_date, poop_type, effort, notes")
    .single();

  if (error) {
    console.error("Failed to save gut tracking entry:", error);
    throw error;
  }

  const nextGutTracking = toGutTracking(data as GutTrackingRow);

  if (matchingCycleEntry) {
    store = {
      ...store,
      entries: store.entries.map((currentEntry) =>
        currentEntry.id === matchingCycleEntry.id
          ? { ...currentEntry, gutTracking: nextGutTracking }
          : currentEntry,
      ),
    };
    emitChange();
  }

  return nextGutTracking;
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
