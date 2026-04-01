"use client";

import { useGutTrackingEntries } from "@/lib/cycle-entry-store";
import { getGutStreakLength } from "@/lib/gut-streaks";
import {
  useEnableGutCheckStreaks,
  useHideGutCheckDetails,
} from "@/lib/profile-preferences-store";

type GutStreakIndicatorProps = {
  date: string;
};

export function GutStreakIndicator({ date }: GutStreakIndicatorProps) {
  const enableGutCheckStreaks = useEnableGutCheckStreaks();
  const hideGutCheckDetails = useHideGutCheckDetails();
  const gutEntries = useGutTrackingEntries();
  const streakLength = getGutStreakLength(
    gutEntries.map((entry) => entry.logDate),
    date,
  );

  if (!enableGutCheckStreaks || hideGutCheckDetails || streakLength === 0) {
    return null;
  }

  return (
    <span
      className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/46"
      data-testid={`gut-streak-indicator-${date}`}
    >
      {streakLength === 1 ? "1-day streak" : `${streakLength}-day streak`}
    </span>
  );
}
