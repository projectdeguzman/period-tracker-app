"use client";

import { useSyncExternalStore } from "react";
import type { Session } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const supabase = createSupabaseBrowserClient();

let authListenerStarted = false;
let authInitialized = false;
let currentSession: Session | null = null;
let authSubscription: { unsubscribe: () => void } | null = null;
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => {
    listener();
  });
}

function startAuthListener() {
  if (authListenerStarted) {
    return;
  }

  authListenerStarted = true;

  supabase.auth.getSession().then(({ data }) => {
    currentSession = data.session ?? null;
    authInitialized = true;
    emitChange();
  });

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    currentSession = session;
    authInitialized = true;
    emitChange();
  });

  authSubscription = subscription;
}

function subscribe(listener: () => void) {
  startAuthListener();
  listeners.add(listener);

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0 && authSubscription) {
      authSubscription.unsubscribe();
      authSubscription = null;
      authListenerStarted = false;
      authInitialized = false;
      currentSession = null;
    }
  };
}

function getSnapshot() {
  startAuthListener();

  if (!authInitialized) {
    return null;
  }

  return currentSession;
}

function getServerSnapshot() {
  return null;
}

export function useAuthSession() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

