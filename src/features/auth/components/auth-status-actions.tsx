"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthSession } from "@/features/auth/lib/auth-session";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function AuthStatusActions() {
  const router = useRouter();
  const session = useAuthSession();
  const supabase = createSupabaseBrowserClient();
  const [isSigningOut, setIsSigningOut] = useState(false);

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
      <div className="flex flex-col items-end gap-2" data-testid="auth-status-signed-in">
        <div className="rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent-strong">
          Signed in
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="rounded-full border border-line bg-white px-3 py-2 text-sm font-semibold text-black transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-70"
          data-testid="sign-out-button"
        >
          {isSigningOut ? "Signing out..." : "Sign out"}
        </button>
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
