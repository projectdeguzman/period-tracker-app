import type {
  CycleSnapshot,
  DashboardHighlight,
  IntimacyEntry,
  PeriodEntry,
} from "@/types/tracking";

export const dashboardHighlights: DashboardHighlight[] = [
  { label: "Cycle Day", value: "12" },
  { label: "Next Period", value: "16 days" },
  { label: "Logs This Week", value: "3" },
];

export const todayCycleSnapshot: CycleSnapshot = {
  currentDay: 12,
  phase: "Follicular",
  nextPeriodInDays: 16,
  symptoms: ["Light cramps", "Clear skin", "More energy"],
  mood: "energized",
  note: "Energy is up today. Good moment to log workouts and appetite shifts.",
};

export const intimacyEntries: IntimacyEntry[] = [
  {
    id: "entry-1",
    partnerLabel: "Partner A",
    date: "2026-03-18",
    protectionUsed: true,
    mood: "playful",
    note: "Felt connected and relaxed afterward.",
  },
  {
    id: "entry-2",
    partnerLabel: "Self",
    date: "2026-03-16",
    protectionUsed: false,
    mood: "steady",
    note: "Low-pressure check-in, no discomfort noted.",
  },
];

export const periodEntries: PeriodEntry[] = [
  {
    id: "period-entry-1",
    startDate: "2026-03-02",
    endDate: "2026-03-06",
    flowIntensity: "medium",
    symptoms: "Cramps, fatigue, mild headaches",
  },
];
