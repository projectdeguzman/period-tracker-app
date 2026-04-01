"use client";

import { useSyncExternalStore } from "react";
import { getCurrentSessionUser } from "@/features/auth/lib/auth-session";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type ProfilePreferencesSnapshot = {
  enableGutCheckStreaks: boolean;
  errorMessage: string;
  hideGutCheckDetails: boolean;
  hideIntimacyDetails: boolean;
  status: "idle" | "loading" | "ready" | "error";
  userId: string | null;
};

const supabase = createSupabaseBrowserClient();
const listeners = new Set<() => void>();

let loadPromise: Promise<void> | null = null;
let lastLoadedUserId: string | null | undefined;
let store: ProfilePreferencesSnapshot = {
  enableGutCheckStreaks: true,
  errorMessage: "",
  hideGutCheckDetails: false,
  hideIntimacyDetails: false,
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

async function loadPreferences() {
  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = (async () => {
    try {
      const user = await getCurrentSessionUser();

      if (!user) {
        lastLoadedUserId = null;
        store = {
          enableGutCheckStreaks: true,
          errorMessage: "",
          hideGutCheckDetails: false,
          hideIntimacyDetails: false,
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
        .from("profiles")
        .select(
          "hide_gut_check_details, enable_gut_check_streaks, hide_intimacy_details",
        )
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      store = {
        enableGutCheckStreaks:
          data?.enable_gut_check_streaks === undefined
            ? true
            : Boolean(data.enable_gut_check_streaks),
        errorMessage: "",
        hideGutCheckDetails: Boolean(data?.hide_gut_check_details),
        hideIntimacyDetails: Boolean(data?.hide_intimacy_details),
        status: "ready",
        userId: user.id,
      };
      emitChange();
    } catch (error) {
      console.error("Failed to load profile preferences:", error);
      store = {
        ...store,
        enableGutCheckStreaks: true,
        errorMessage: getErrorMessage(error, "Unable to load profile preferences."),
        hideGutCheckDetails: false,
        hideIntimacyDetails: false,
        status: "error",
      };
      emitChange();
    } finally {
      loadPromise = null;
    }
  })();

  return loadPromise;
}

function ensurePreferencesLoaded() {
  if (typeof window === "undefined") {
    return;
  }

  void loadPreferences();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  ensurePreferencesLoaded();

  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  ensurePreferencesLoaded();
  return store;
}

function getServerSnapshot() {
  return store;
}

export async function updateHideGutCheckDetailsPreference(hideGutCheckDetails: boolean) {
  const user = await getCurrentSessionUser();

  if (!user) {
    throw new Error("You need to sign in to update preferences.");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ hide_gut_check_details: hideGutCheckDetails })
    .eq("id", user.id);

  if (error) {
    console.error("Failed to save profile preferences:", error);
    throw error;
  }

  lastLoadedUserId = user.id;
  store = {
    enableGutCheckStreaks: store.enableGutCheckStreaks,
    errorMessage: "",
    hideGutCheckDetails,
    hideIntimacyDetails: store.hideIntimacyDetails,
    status: "ready",
    userId: user.id,
  };
  emitChange();
}

export async function updateEnableGutCheckStreaksPreference(
  enableGutCheckStreaks: boolean,
) {
  const user = await getCurrentSessionUser();

  if (!user) {
    throw new Error("You need to sign in to update preferences.");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ enable_gut_check_streaks: enableGutCheckStreaks })
    .eq("id", user.id);

  if (error) {
    console.error("Failed to save profile preferences:", error);
    throw error;
  }

  lastLoadedUserId = user.id;
  store = {
    enableGutCheckStreaks,
    errorMessage: "",
    hideGutCheckDetails: store.hideGutCheckDetails,
    hideIntimacyDetails: store.hideIntimacyDetails,
    status: "ready",
    userId: user.id,
  };
  emitChange();
}

export async function updateHideIntimacyDetailsPreference(
  hideIntimacyDetails: boolean,
) {
  const user = await getCurrentSessionUser();

  if (!user) {
    throw new Error("You need to sign in to update preferences.");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ hide_intimacy_details: hideIntimacyDetails })
    .eq("id", user.id);

  if (error) {
    console.error("Failed to save profile preferences:", error);
    throw error;
  }

  lastLoadedUserId = user.id;
  store = {
    enableGutCheckStreaks: store.enableGutCheckStreaks,
    errorMessage: "",
    hideGutCheckDetails: store.hideGutCheckDetails,
    hideIntimacyDetails,
    status: "ready",
    userId: user.id,
  };
  emitChange();
}

export function useProfilePreferencesState() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useHideGutCheckDetails() {
  return useProfilePreferencesState().hideGutCheckDetails;
}

export function useEnableGutCheckStreaks() {
  return useProfilePreferencesState().enableGutCheckStreaks;
}

export function useHideIntimacyDetails() {
  return useProfilePreferencesState().hideIntimacyDetails;
}
