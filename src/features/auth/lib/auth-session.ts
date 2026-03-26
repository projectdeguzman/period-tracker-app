"use client";

import { useSyncExternalStore } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const supabase = createSupabaseBrowserClient();

let authListenerStarted = false;
let authInitialized = false;
let currentSession: Session | null = null;
let initialSessionPromise: Promise<void> | null = null;
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

  initialSessionPromise = supabase.auth.getSession().then(({ data }) => {
    currentSession = data.session ?? null;
    authInitialized = true;
    emitChange();
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    currentSession = session;
    authInitialized = true;
    emitChange();
  });
}

function subscribe(listener: () => void) {
  startAuthListener();
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
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

export async function getCurrentSessionUser(): Promise<User | null> {
  startAuthListener();

  if (!authInitialized && initialSessionPromise) {
    await initialSessionPromise;
  }

  return currentSession?.user ?? null;
}
