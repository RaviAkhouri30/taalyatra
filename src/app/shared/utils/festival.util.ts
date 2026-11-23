import { Festival } from '@shared/enums/festival.enum';

/** The offer's animation name stored before 2.16.0 (`home/offer` `theme`) that meant Diwali. */
const LEGACY_SPARKS = 'sparks';

/**
 * Type guard for festival names read from stored data.
 * @param value Candidate value.
 * @returns Whether `value` is a supported festival.
 */
export function isFestival(value: unknown): value is Festival {
  return Object.values<unknown>(Festival).includes(value);
}

/**
 * Reads the offer's chosen festival.
 * @param value The stored `promotion.festival`, if any.
 * @returns The festival; `null` when none was chosen (data from before 2.16.0); an unknown name
 * is treated as no festival.
 */
export function toFestival(value: unknown): Festival | null {
  if (value === undefined || value === null) {
    return null;
  }
  return isFestival(value) ? value : Festival.None;
}

/**
 * Reads the offer section's animation as stored before 2.16.0, for an offer with no festival yet.
 * @param theme The stored `home/offer` `theme`, if any.
 * @returns Diwali for its sparks, otherwise no festival.
 */
export function festivalOfTheme(theme: string | undefined): Festival {
  return theme === LEGACY_SPARKS ? Festival.Diwali : Festival.None;
}
