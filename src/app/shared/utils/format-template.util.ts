/** Placeholder syntax: `{name}`. */
const PLACEHOLDER = /\{(\w+)\}/g;

/**
 * Fills `{name}` placeholders in editable copy, e.g. "Saved {count} beats." Unknown
 * placeholders are left as written so missing data is visible rather than silently dropped.
 * @param template Copy with placeholders.
 * @param params Values by placeholder name.
 * @returns The filled-in text.
 */
export function formatTemplate(
  template: string,
  params: Readonly<Record<string, string | number>> = {},
): string {
  return template.replace(PLACEHOLDER, (placeholder, name: string) => {
    const value = new Map(Object.entries(params)).get(name);
    return value === undefined ? placeholder : String(value);
  });
}
