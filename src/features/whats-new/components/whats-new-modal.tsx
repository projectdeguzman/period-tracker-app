"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  currentWhatsNewRelease,
  dismissWhatsNew,
  shouldShowWhatsNew,
  WHATS_NEW_EVENT_NAME,
} from "@/features/whats-new/lib/whats-new";

const hiddenPathPrefixes = ["/sign-in", "/sign-up", "/onboarding"];

function shouldHideOnPath(pathname: string) {
  return hiddenPathPrefixes.some((prefix) => pathname.startsWith(prefix));
}

export function WhatsNewModal() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function syncOpenState() {
      if (shouldHideOnPath(pathname)) {
        setIsOpen(false);
        return;
      }

      setIsOpen(shouldShowWhatsNew(currentWhatsNewRelease.id));
    }

    syncOpenState();
    window.addEventListener(WHATS_NEW_EVENT_NAME, syncOpenState);

    return () => {
      window.removeEventListener(WHATS_NEW_EVENT_NAME, syncOpenState);
    };
  }, [pathname]);

  if (!isOpen || shouldHideOnPath(pathname)) {
    return null;
  }

  function handleDismiss() {
    dismissWhatsNew(currentWhatsNewRelease.id);
    setIsOpen(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(34,27,40,0.24)] px-4 pb-6 pt-10 sm:items-center">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="whats-new-title"
        className="w-full max-w-md rounded-[2rem] border border-white/70 bg-white/95 p-6 shadow-[0_24px_80px_rgba(34,27,40,0.16)] backdrop-blur"
        data-testid="whats-new-modal"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-accent-strong/70">
              {currentWhatsNewRelease.label}
            </p>
            <div className="mt-3 inline-flex rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent-strong">
              Fresh drop
            </div>
            <h2
              id="whats-new-title"
              className="mt-3 text-2xl font-semibold tracking-tight"
            >
              {currentWhatsNewRelease.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-foreground/66">
              {currentWhatsNewRelease.summary}
            </p>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-foreground/66 transition hover:bg-surface-muted"
            aria-label="Close what’s new"
          >
            ×
          </button>
        </div>

        <div className="mt-5 rounded-[1.5rem] border border-line bg-surface-muted/65 px-4 py-4">
          <ul className="space-y-3 text-sm leading-6 text-foreground/72">
            {currentWhatsNewRelease.items.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-accent" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(169,52,86,0.22)] transition hover:bg-accent-strong"
          >
            Got it
          </button>
        </div>
      </section>
    </div>
  );
}
