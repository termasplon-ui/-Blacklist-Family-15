export function formatDate(date: Date): string {
  const d = date.getDate().toString().padStart(2, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const y = date.getFullYear();
  return `${d}.${m}.${y}`;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function progressBar(start: Date, end: Date): string {
  const now = Date.now();
  const total = end.getTime() - start.getTime();
  const elapsed = now - start.getTime();
  const pct = Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  const remaining = 100 - pct;
  const filled = Math.round(remaining / 10);
  const empty = 10 - filled;
  const bar = "🟥".repeat(filled) + "⬜".repeat(empty);
  return `${bar} ${remaining}% осталось`;
}

export function parseDateDMY(str: string): Date | null {
  const parts = str.trim().split(".");
  if (parts.length !== 3) return null;
  const [d, m, y] = parts.map(Number);
  if (!d || !m || !y) return null;
  const date = new Date(y, m - 1, d);
  if (isNaN(date.getTime())) return null;
  return date;
}
