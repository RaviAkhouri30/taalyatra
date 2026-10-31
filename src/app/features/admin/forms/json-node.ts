/**
 * @param node A stored value.
 * @returns Its fields when it is a plain JSON object; an empty map otherwise.
 */
export function entriesOf(node: unknown): Map<string, unknown> {
  return typeof node === 'object' && node !== null && !Array.isArray(node)
    ? new Map<string, unknown>(Object.entries(node))
    : new Map<string, unknown>();
}

/**
 * @param node A stored value.
 * @param key A field name.
 * @returns The field's value, or `undefined` when the node has no such field.
 */
export function fieldOf(node: unknown, key: string): unknown {
  return entriesOf(node).get(key);
}
