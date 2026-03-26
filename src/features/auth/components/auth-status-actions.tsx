"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuthSession } from "@/features/auth/lib/auth-session";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function AuthStatusActions() {
  const router = useRouter();
  const session = useAuthSession();
  const supabase = createSupabaseBrowserClient();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isMenuOpen]);

  async function handleSignOut() {
    setIsSigningOut(true);

    try {
      await supabase.auth.signOut();
      router.replace("/sign-in");
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  }

  if (session?.user) {
    return (
      <div
        ref={menuRef}
        className="relative flex flex-col items-end gap-2"
        data-testid="auth-status-signed-in"
      >
        <button
          type="button"
          aria-expanded={isMenuOpen}
          aria-haspopup="menu"
          onClick={() => setIsMenuOpen((current) => !current)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-accent-strong shadow-[0_10px_24px_rgba(34,27,40,0.08)] transition hover:bg-surface-muted"
          data-testid="user-menu-button"
        >
          <span className="sr-only">Open account menu</span>
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <path
              d="M18 20a6 6 0 0 0-12 0"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="8" r="4" />
          </svg>
        </button>

        {isMenuOpen ? (
          <div
            role="menu"
            data-testid="user-menu-dropdown"
            className="absolute right-0 top-13 z-20 min-w-40 rounded-[1.25rem] border border-white/70 bg-white/95 p-2 shadow-[0_18px_50px_rgba(34,27,40,0.12)] backdrop-blur"
          >
            <button
              type="button"
              role="menuitem"
              className="flex w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-foreground transition hover:bg-surface-muted"
              data-testid="account-menu-button"
            >
              Account
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="mt-1 flex w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-foreground transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-70"
              data-testid="sign-out-button"
            >
              {isSigningOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2" data-testid="auth-status-signed-out">
      <div className="rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent-strong">
        MVP
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="/sign-in"
          className="rounded-full border border-line bg-white px-3 py-2 text-sm font-semibold text-black transition hover:bg-surface-muted"
          data-testid="sign-in-link"
        >
          Sign in
        </Link>
        <Link
          href="/sign-up"
          className="rounded-full bg-accent px-3 py-2 text-sm font-semibold text-white transition hover:bg-accent-strong"
          data-testid="sign-up-link"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}
