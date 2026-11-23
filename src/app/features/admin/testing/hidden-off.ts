/**
 * @param value A form's value.
 * @returns It without the `hidden: false` a hideable list's items load with (2.15.0), so it can
 *   be compared with content stored before there was a switch.
 */
export function withoutHiddenOff(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(withoutHiddenOff);
  }
  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key, inner]) => !(key === 'hidden' && inner === false))
        .map(([key, inner]) => [key, withoutHiddenOff(inner)]),
    );
  }
  return value;
}
