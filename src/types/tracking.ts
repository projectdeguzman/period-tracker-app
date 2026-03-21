export type Mood =
  | "energized"
  | "steady"
  | "sensitive"
  | "low"
  | "playful";

export type FlowIntensity = "light" | "medium" | "heavy";

export type CycleSnapshot = {
  currentDay: number;
  phase: "Menstrual" | "Follicular" | "Ovulation" | "Luteal";
  nextPeriodInDays: number;
  symptoms: string[];
  mood: Mood;
  note: string;
};

export type IntimacyEntry = {
  id: string;
  partnerLabel: string;
  date: string;
  protectionUsed: boolean;
  mood: Mood;
  note: string;
};

export type PeriodEntry = {
  id: string;
  startDate: string;
  endDate: string;
  flowIntensity: FlowIntensity;
  symptoms: string;
};

export type DashboardHighlight = {
  label: string;
  value: string;
};
