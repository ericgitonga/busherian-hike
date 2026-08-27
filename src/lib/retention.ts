// PLACEHOLDER retention window (extras/requirements.md, musing Section 3: DPA 2019 Section
// 25(g) requires *some* stated policy, not a specific number of days — 30 was chosen to cover
// late injury reports). Swap RETENTION_DAYS here if that number changes.
export const EVENT_DATE = new Date("2026-09-19T00:00:00Z");
export const RETENTION_DAYS = 30;

export function retentionCutoffDate(): Date {
  const cutoff = new Date(EVENT_DATE);
  cutoff.setUTCDate(cutoff.getUTCDate() + RETENTION_DAYS);
  return cutoff;
}

export function isPastRetentionWindow(now: Date): boolean {
  return now >= retentionCutoffDate();
}
