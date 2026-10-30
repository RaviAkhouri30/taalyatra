import {
  isFirestoreFields,
  toStoredDocuments,
  toStoredFields,
  unwrapListSection,
  withoutOrder,
} from './firestore-envelope';

describe('Firestore envelope', () => {
  it('should return the list when the document is a stored list section', () => {
    expect(unwrapListSection({ _items: ['Drum Circle', 'Boombastic'] })).toEqual([
      'Drum Circle',
      'Boombastic',
    ]);
  });

  it('should keep a document unchanged when it has a real items field', () => {
    const experiences = { title: 'Experiences', items: [{ name: 'Drum Circle' }] };

    expect(unwrapListSection(experiences)).toBe(experiences);
  });

  it('should keep a document unchanged when _items is not a list', () => {
    const fields = { _items: 'not a list' };

    expect(unwrapListSection(fields)).toBe(fields);
  });

  it('should remove the order field when reading a list item', () => {
    expect(withoutOrder({ order: 2, title: 'Video' })).toEqual({ title: 'Video' });
  });

  it.each([
    [{ name: 'Asha' }, true],
    [[], false],
    [null, false],
    ['text', false],
  ])('should accept %j as document fields: %s', (value, expected) => {
    expect(isFirestoreFields(value)).toBe(expected);
  });

  it.each([
    [['Drum Circle'], { _items: ['Drum Circle'] }],
    [{ title: 'Hero' }, { title: 'Hero' }],
    [undefined, null],
  ])('should turn %j back into stored fields %j', (data, expected) => {
    expect(toStoredFields(data)).toEqual(expected);
  });

  it('should turn read documents back into stored fields, leaving out missing ones', () => {
    const read = new Map<string, unknown>([
      ['marquee', ['Drum Circle']],
      ['gone', undefined],
    ]);

    expect(toStoredDocuments(read)).toEqual(new Map([['marquee', { _items: ['Drum Circle'] }]]));
  });
});
