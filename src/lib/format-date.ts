export function parseLocalDate(input: string) {
  const [year, month, day] = input.split("-").map(Number);

  return new Date(year, month - 1, day);
}

const monthLabels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export function formatShortDate(input: string) {
  const [, month, day] = input.split("-").map(Number);

  return `${monthLabels[month - 1]} ${day}`;
}
