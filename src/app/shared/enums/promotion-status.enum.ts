/** Where a promotion stands against its switch and schedule. */
export enum PromotionStatus {
  /** Switched off by the owner. */
  Off = 'off',
  /** Switched on, but its first day is still ahead. */
  Scheduled = 'scheduled',
  /** Shown to visitors today. */
  Live = 'live',
  /** Switched on, but its last day has passed. */
  Ended = 'ended',
}
