import { FestiveTheme } from '@shared/enums/festive-theme.enum';

/**
 * Type guard for theme names read from backend data.
 * @param value Candidate value.
 * @returns Whether `value` is a supported theme.
 */
export function isFestiveTheme(value: unknown): value is FestiveTheme {
  return Object.values<unknown>(FestiveTheme).includes(value);
}

/**
 * Maps a stored theme name to a supported theme; unknown names draw nothing.
 * @param value Stored theme name.
 * @returns A supported theme.
 */
export function toFestiveTheme(value: string): FestiveTheme {
  return isFestiveTheme(value) ? value : FestiveTheme.None;
}
