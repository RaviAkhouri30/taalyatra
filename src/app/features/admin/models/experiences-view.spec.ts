import fakeDb from '@core/backends/fake/fake-db.json';
import { type DocumentFields } from '@core/interfaces/i-document-store';
import { readSchemaValue } from '../forms/schema-value';
import { EXPERIENCES_VIEW, FEATURED_CTA_DEFAULT } from './experiences-view';

describe('EXPERIENCES_VIEW', () => {
  const stored = fakeDb.home.experiences as unknown as DocumentFields;
  const card = (name: string, featured: boolean, category = 'Melody'): DocumentFields => ({
    name,
    category,
    featured,
    spotlight: featured ? { cta: `See ${name}` } : null,
  });

  it('should show the featured card first, then the rest, with a switch on each', () => {
    const { cards } = EXPERIENCES_VIEW.read(stored) as { cards: DocumentFields[] };

    expect(cards).toHaveLength(fakeDb.home.experiences.items.length + 1);
    expect(cards[0]).toMatchObject({
      name: 'Drum Circle',
      featured: true,
      spotlight: { cta: 'See full details' },
    });
    expect(cards[0]).not.toHaveProperty('cta');
    expect(cards[1]).toMatchObject({ featured: false, spotlight: null });
  });

  it.each([
    ['nothing', null],
    ['a damaged document', { featured: 'nope', items: 'nope' }],
  ])('should show no cards when given %s', (_case, document) => {
    expect(EXPERIENCES_VIEW.read(document)).toEqual({ cards: [] });
  });

  it('should give back exactly what is stored when nothing changed', () => {
    const shown = EXPERIENCES_VIEW.read(stored);

    expect(EXPERIENCES_VIEW.write(stored, shown)).toEqual(stored);
  });

  it('should store the switched-on card as featured, and the rest in order', () => {
    const written = EXPERIENCES_VIEW.write(stored, {
      cards: [card('A', false), card('B', true), card('C', false)],
    });

    expect(written['featured']).toEqual({ name: 'B', category: 'Melody', cta: 'See B' });
    expect(written['items']).toEqual([
      { name: 'A', category: 'Melody' },
      { name: 'C', category: 'Melody' },
    ]);
  });

  it('should keep the other fields of the document', () => {
    const written = EXPERIENCES_VIEW.write(stored, { cards: [card('A', true)] });

    expect(written['title']).toBe(stored['title']);
  });

  it('should make the first card featured when none is on, with the usual button text', () => {
    const written = EXPERIENCES_VIEW.write(stored, { cards: [card('A', false), card('B', false)] });

    expect(written['featured']).toMatchObject({ name: 'A', cta: FEATURED_CTA_DEFAULT });
  });

  it('should use the usual button text when the featured card has none', () => {
    const written = EXPERIENCES_VIEW.write(stored, {
      cards: [{ name: 'A', featured: true, spotlight: { cta: '  ' } }],
    });

    expect(written['featured']).toMatchObject({ cta: FEATURED_CTA_DEFAULT });
  });

  it('should keep a stored document when the list is somehow empty', () => {
    expect(EXPERIENCES_VIEW.write(stored, { cards: [] })).toBe(stored);
  });

  it('should keep filters in order, drop unused ones and add new ones', () => {
    const written = EXPERIENCES_VIEW.write(stored, {
      cards: [
        card('A', true, 'Movement'),
        card('B', false, 'Percussion'),
        card('C', false, 'New one'),
        card('D', false, 'Movement'),
        card('E', false, '  '),
      ],
    });

    expect(written['categories']).toEqual(['Percussion', 'Movement', 'New one']);
  });

  it('should cope with stored filters that are not a list', () => {
    const written = EXPERIENCES_VIEW.write(
      { categories: 'nope' },
      { cards: [card('A', true, 'Melody')] },
    );

    expect(written['categories']).toEqual(['Melody']);
  });

  it('should read the form back to stored values, leaving spotlight out when off', () => {
    const fields = [
      { key: 'featured', label: 'Featured', kind: 'toggle' },
      { key: 'spotlight', label: 'S', kind: 'group', onlyWhen: 'featured', fields: [] },
    ] as never;

    expect(readSchemaValue(fields, { featured: false, spotlight: {} })).toEqual({
      featured: false,
      spotlight: null,
    });
  });
});
