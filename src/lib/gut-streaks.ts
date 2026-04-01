function fromDateKey(input: string) {
  const [year, month, day] = input.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function toDateKey(input: Date) {
  const year = input.getFullYear();
  const month = String(input.getMonth() + 1).padStart(2, "0");
  const day = String(input.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(input: string, days: number) {
  const date = fromDateKey(input);
  date.setDate(date.getDate() + days);

  return toDateKey(date);
}

export function getGutStreakLength(dates: string[], targetDate: string) {
  const uniqueDates = new Set(dates);

  if (!uniqueDates.has(targetDate)) {
    return 0;
  }

  let streak = 0;
  let currentDate = targetDate;

  while (uniqueDates.has(currentDate)) {
    streak += 1;
    currentDate = addDays(currentDate, -1);
  }

  return streak;
}
