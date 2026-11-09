/** Formats YYYY-MM-DD as "November 3, 2026" without timezone drift. */
export function formatElectionDate(date: string, opts: Intl.DateTimeFormatOptions = { month: "long", day: "numeric", year: "numeric" }): string {
  const [y, m, d] = date.split("-").map(Number);
  if (!y || !m || !d) return date;
  return new Intl.DateTimeFormat("en-US", { ...opts, timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, d)));
}

/** Whole days from today (America/Chicago) until the election date. Negative when past. */
export function daysUntil(date: string, now = new Date()): number {
  const [y, m, d] = date.split("-").map(Number);
  const todayStr = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(now); // YYYY-MM-DD
  const [ty, tm, td] = todayStr.split("-").map(Number);
  const a = Date.UTC(y, m - 1, d);
  const b = Date.UTC(ty, tm - 1, td);
  return Math.round((a - b) / 86400000);
}
