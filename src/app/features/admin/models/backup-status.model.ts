import { formatMoment } from './editor-dates';

/** After this many days without a backup, the dashboard and Review & publish remind the owner. */
export const BACKUP_REMINDER_DAYS = 14;

/** One day, in milliseconds. */
const DAY_MS = 86_400_000;

/** When the last backup was made, and whether it's time for another (0016 V13). */
export class BackupStatus {
  /** Time to make a backup: there's none, or the last is older than the reminder. */
  public readonly due: boolean;
  /** What the owner is told. */
  public readonly text: string;

  /**
   * @param lastAt When the last backup was made (ISO 8601), or `null` for never.
   * @param now The current time.
   */
  public constructor(
    public readonly lastAt: string | null,
    now: Date,
  ) {
    const made = lastAt === null ? Number.NaN : new Date(lastAt).getTime();
    const days = Math.floor((now.getTime() - made) / DAY_MS);
    // An unreadable date counts as never: better one reminder too many than one too few.
    this.due = Number.isNaN(days) || days > BACKUP_REMINDER_DAYS;
    this.text = BackupStatus.describe(lastAt, days);
  }

  private static describe(lastAt: string | null, days: number): string {
    if (lastAt === null || Number.isNaN(days)) {
      return 'No backup yet. Download one to keep a copy of the website’s content on this device.';
    }
    const when = `Last backup: ${formatMoment(lastAt)}.`;
    return days > BACKUP_REMINDER_DAYS
      ? `${when} That’s ${String(days)} days ago: download a new one.`
      : when;
  }
}
