import { entriesOf, fieldOf } from './json-node';

describe('json node', () => {
  it('should read the fields of a plain object', () => {
    expect(fieldOf({ title: 'Hero' }, 'title')).toBe('Hero');
    expect(entriesOf({ a: 1 }).get('a')).toBe(1);
  });

  it.each([null, undefined, 'text', ['list']])('should read %j as having no fields', (node) => {
    expect(entriesOf(node).size).toBe(0);
    expect(fieldOf(node, 'title')).toBeUndefined();
  });
});
