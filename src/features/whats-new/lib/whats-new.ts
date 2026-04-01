export const WHATS_NEW_STORAGE_KEY = "luna.whats-new.dismissed";
export const WHATS_NEW_EVENT_NAME = "luna:whats-new-changed";

export type WhatsNewRelease = {
  id: string;
  label: string;
  title: string;
  summary: string;
  items: string[];
};

export const currentWhatsNewRelease: WhatsNewRelease = {
  id: "v2.0.0",
  label: "v2.0.0",
  title: "What’s new in Luna ✨",
  summary:
    "Gut check officially entered the chat, with more privacy controls and a little extra personality.",
  items: [
    "Gut Check is here 💩 with calendar indicators, day details, and quick logging.",
    "Optional streaks are live for when your gut has main character momentum ✨",
    "New privacy settings keep gut check and intimacy details more lowkey when you want them to be 🤍",
    "Calendar logging is faster now, with date-prefilled forms right from Day details.",
  ],
};

export function getDismissedWhatsNewId() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(WHATS_NEW_STORAGE_KEY);
}

export function dismissWhatsNew(releaseId: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(WHATS_NEW_STORAGE_KEY, releaseId);
  window.dispatchEvent(new CustomEvent(WHATS_NEW_EVENT_NAME));
}

export function reopenWhatsNew() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(WHATS_NEW_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(WHATS_NEW_EVENT_NAME));
}

export function shouldShowWhatsNew(releaseId: string) {
  return getDismissedWhatsNewId() !== releaseId;
}
