/** Text in square brackets, the way unfinished copy is marked, e.g. "[Add duration & price]". */
const PLACEHOLDER = /\[[^\]\n]{1,80}\]/;

/**
 * @param value A field's value.
 * @returns The sentence telling the owner it still holds unfinished copy, or `null`. A warning:
 *   brackets can be intended.
 */
export function placeholderMessage(value: unknown): string | null {
  const found = typeof value === 'string' ? PLACEHOLDER.exec(value) : null;
  return found === null ? null : `Still has a placeholder: “${found[0]}”.`;
}
