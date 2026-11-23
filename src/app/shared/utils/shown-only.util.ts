import { type IHideable } from '@shared/interfaces/i-hideable';

/**
 * @param items A list as stored.
 * @returns The items visitors see: every one the owner hasn't hidden, in order (2.15.0).
 */
export function shownOnly<T extends IHideable>(items: readonly T[]): T[] {
  return items.filter((item) => item.hidden !== true);
}
