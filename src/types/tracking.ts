export type Mood =
  | "energized"
  | "steady"
  | "sensitive"
  | "low"
  | "playful";

export type CycleLogType =
  | "Period started"
  | "Period ended"
  | "Symptoms"
  | "Ovulation signs";

export type SexDriveLevel = "Low" | "Normal" | "High";

export type DischargeType =
  | "None"
  | "Dry"
  | "Sticky"
  | "Creamy"
  | "Watery"
  | "Egg-white";

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

export type CycleEntry = {
  id: string;
  date: string;
  logType: CycleLogType;
  symptoms: string[];
  mood: Mood | "";
  cravings: string;
  sexDrive: SexDriveLevel | "";
  discharge: DischargeType | "";
  notes: string;
};

export type DashboardHighlight = {
  label: string;
  value: string;
};
