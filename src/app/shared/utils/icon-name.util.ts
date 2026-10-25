import { IconName } from '@shared/enums/icon-name.enum';

/**
 * Type guard for icon names read from backend data (stored as plain strings).
 * @param value Candidate value.
 * @returns Whether `value` names a registered icon.
 */
export function isIconName(value: unknown): value is IconName {
  return Object.values<unknown>(IconName).includes(value);
}

/**
 * Maps a stored icon name to a registered icon, so unknown names can never break rendering.
 * @param value Icon name from data.
 * @param fallback Icon used when `value` is not registered.
 * @returns A registered icon name.
 */
export function toIconName(value: string, fallback: IconName = IconName.Sparkle): IconName {
  return isIconName(value) ? value : fallback;
}
