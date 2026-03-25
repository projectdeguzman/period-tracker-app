"use client";

import { useSyncExternalStore } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { IntimacyEntry, Mood } from "@/types/tracking";

const LEGACY_STORAGE_KEY = "luna.intimacyEntries";

type NewIntimacyEntry = {
  date: string;
  entryType: "Partner" | "Self";
  protectionUsed: "Yes" | "No";
  notes: string;
  mood: Mood;
};

type IntimacyEntryRow = {
  id: string;
  date: string;
  entry_type: "Partner" | "Self";
  protection_used: boolean;
  mood: Mood | null;
  notes: string | null;
};

type IntimacyStoreSnapshot = {
  canImportLegacyEntries: boolean;
  entries: IntimacyEntry[];
  errorMessage: string;
  importErrorMessage: string;
  importStatus: "idle" | "loading" | "success" | "error";
  legacyEntryCount: number;
  status: "idle" | "loading" | "ready" | "error";
  userId: string | null;
};

type LegacyIntimacyEntry = {
  id: string;
  partnerLabel: string;
  date: string;
  protectionUsed: boolean;
  mood: Mood;
  note: string;
};

const supabase = createSupabaseBrowserClient();
const listeners = new Set<() => void>();

let loadPromise: Promise<void> | null = null;
let lastLoadedUserId: string | null | undefined;
let store: IntimacyStoreSnapshot = {
  canImportLegacyEntries: false,
  entries: [],
  errorMessage: "",
  importErrorMessage: "",
  importStatus: "idle",
  legacyEntryCount: 0,
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

function getLegacyImportMarkerKey(userId: string) {
  return `luna.intimacyEntriesImported.${userId}`;
}

function parseLegacyEntries() {
  if (typeof window === "undefined") {
    return [] as LegacyIntimacyEntry[];
  }

  const storedEntries = window.localStorage.getItem(LEGACY_STORAGE_KEY);

  if (!storedEntries) {
    return [] as LegacyIntimacyEntry[];
  }

  try {
    const parsedEntries = JSON.parse(storedEntries);

    if (!Array.isArray(parsedEntries)) {
      return [] as LegacyIntimacyEntry[];
    }

    return parsedEntries.filter((entry): entry is LegacyIntimacyEntry => {
      return (
        typeof entry === "object" &&
        entry !== null &&
        typeof entry.id === "string" &&
        typeof entry.partnerLabel === "string" &&
        typeof entry.date === "string" &&
        typeof entry.protectionUsed === "boolean" &&
        typeof entry.mood === "string" &&
        typeof entry.note === "string"
      );
    });
  } catch {
    return [] as LegacyIntimacyEntry[];
  }
}

function hasImportedLegacyEntries(userId: string) {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(getLegacyImportMarkerKey(userId)) === "true";
}

function markLegacyEntriesImported(userId: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(getLegacyImportMarkerKey(userId), "true");
}

function toEntry(row: IntimacyEntryRow): IntimacyEntry {
  return {
    id: row.id,
    partnerLabel: row.entry_type,
    date: row.date,
    protectionUsed: row.protection_used,
    mood: row.mood ?? "steady",
    note: row.notes ?? "",
  };
}

async function getAuthenticatedUser() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return session?.user ?? null;
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
          canImportLegacyEntries: false,
          entries: [],
          errorMessage: "",
          importErrorMessage: "",
          importStatus: "idle",
          legacyEntryCount: 0,
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
        importErrorMessage: "",
        importStatus: "idle",
        status: "loading",
        userId: user.id,
      };
      emitChange();

      const { data, error } = await supabase
        .from("intimacy_entries")
        .select("id, date, entry_type, protection_used, mood, notes")
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      const legacyEntries = parseLegacyEntries();
      const hasImportedLegacy = hasImportedLegacyEntries(user.id);

      store = {
        canImportLegacyEntries:
          (data ?? []).length === 0 && legacyEntries.length > 0 && !hasImportedLegacy,
        entries: (data ?? []).map((row) => toEntry(row as IntimacyEntryRow)),
        errorMessage: "",
        importErrorMessage: "",
        importStatus: "idle",
        legacyEntryCount: legacyEntries.length,
        status: "ready",
        userId: user.id,
      };
      emitChange();
    } catch (error) {
      console.error("Failed to load intimacy entries:", error);
      store = {
        ...store,
        canImportLegacyEntries: false,
        entries: [],
        errorMessage: getErrorMessage(error, "Unable to load intimacy entries."),
        importErrorMessage: "",
        importStatus: "idle",
        legacyEntryCount: 0,
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

export async function addIntimacyEntry(entry: NewIntimacyEntry) {
  const user = await getAuthenticatedUser();

  if (!user) {
    throw new Error("You need to sign in to save intimacy entries.");
  }

  const { data, error } = await supabase
    .from("intimacy_entries")
    .insert({
      user_id: user.id,
      date: entry.date,
      entry_type: entry.entryType,
      protection_used: entry.protectionUsed === "Yes",
      mood: entry.mood,
      notes: entry.notes || null,
    })
    .select("id, date, entry_type, protection_used, mood, notes")
    .single();

  if (error) {
    console.error("Failed to save intimacy entry:", error);
    throw error;
  }

  const nextEntry = toEntry(data as IntimacyEntryRow);

  lastLoadedUserId = user.id;
  store = {
    canImportLegacyEntries: false,
    entries: [nextEntry, ...store.entries.filter((current) => current.id !== nextEntry.id)],
    errorMessage: "",
    importErrorMessage: "",
    importStatus: "idle",
    legacyEntryCount: store.legacyEntryCount,
    status: "ready",
    userId: user.id,
  };
  emitChange();

  return nextEntry;
}

export async function importLegacyIntimacyEntries() {
  const user = await getAuthenticatedUser();

  if (!user) {
    throw new Error("You need to sign in to import intimacy entries.");
  }

  const legacyEntries = parseLegacyEntries();

  if (legacyEntries.length === 0) {
    store = {
      ...store,
      canImportLegacyEntries: false,
      importErrorMessage: "",
      importStatus: "success",
      legacyEntryCount: 0,
    };
    emitChange();
    return;
  }

  store = {
    ...store,
    importErrorMessage: "",
    importStatus: "loading",
  };
  emitChange();

  try {
    const { error } = await supabase.from("intimacy_entries").insert(
      legacyEntries.map((entry) => ({
        user_id: user.id,
        date: entry.date,
        entry_type: entry.partnerLabel,
        protection_used: entry.protectionUsed,
        mood: entry.mood,
        notes: entry.note || null,
      })),
    );

    if (error) {
      throw error;
    }

    markLegacyEntriesImported(user.id);
    lastLoadedUserId = undefined;
    await loadEntries();

    store = {
      ...store,
      canImportLegacyEntries: false,
      importErrorMessage: "",
      importStatus: "success",
      legacyEntryCount: legacyEntries.length,
    };
    emitChange();
  } catch (error) {
    console.error("Failed to import legacy intimacy entries:", error);
    store = {
      ...store,
      importErrorMessage: getErrorMessage(
        error,
        "Unable to import existing intimacy entries.",
      ),
      importStatus: "error",
    };
    emitChange();
  }
}

export function useIntimacyEntriesState() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useIntimacyEntries() {
  return useIntimacyEntriesState().entries;
}

export function useIntimacyEntriesStatus() {
  const {
    canImportLegacyEntries,
    errorMessage,
    importErrorMessage,
    importStatus,
    legacyEntryCount,
    status,
  } = useIntimacyEntriesState();

  return {
    canImportLegacyEntries,
    errorMessage,
    importErrorMessage,
    importStatus,
    legacyEntryCount,
    status,
  };
}

export function useIntimacyEntry(id: string) {
  const intimacyEntries = useIntimacyEntries();

  return intimacyEntries.find((entry) => entry.id === id) ?? null;
}

export function useIntimacyEntryState(id: string) {
  const { entries, errorMessage, status } = useIntimacyEntriesState();

  return {
    entry: entries.find((currentEntry) => currentEntry.id === id) ?? null,
    errorMessage,
    status,
  };
}
