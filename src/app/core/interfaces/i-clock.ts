/** The current time, behind an interface so tests can fix it (`CLOCK`). */
export interface IClock {
  /** @returns The current date and time. */
  now(): Date;
}
