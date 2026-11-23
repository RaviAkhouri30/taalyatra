import { FieldKind } from '../models/field-kind.enum';
import { HERO_SECTION } from '../schemas/content.sections';
import { GALLERY_SECTIONS } from '../schemas/media.sections';
import { OFFER_SECTIONS } from '../schemas/offer.sections';
import { schemaLeaves } from './schema-leaves';

describe('schemaLeaves', () => {
  const [, offer] = OFFER_SECTIONS;
  const hero = HERO_SECTION;

  it('should name list items by position, entering grouped items', () => {
    const leaves = schemaLeaves(offer!.fields, {
      title: 'Offer',
      cards: [{ title: 'One' }, { title: 'Two', note: '[price]' }],
    });

    expect(leaves.map((leaf) => leaf.label)).toContain('Offer card 2 · Card title');
    expect(leaves.find((leaf) => leaf.label === 'Offer card 2 · Duration and price')?.value).toBe(
      '[price]',
    );
  });

  it('should not repeat an item’s label for its field of the same name (2.15.0)', () => {
    const photos = GALLERY_SECTIONS[1]!;

    const leaves = schemaLeaves(photos.fields, {
      _items: [{ photo: { src: 'x', alt: 'a' }, hidden: false }],
    });

    expect(leaves.map((leaf) => leaf.label)).toEqual(['Photo 1', 'Photo 1 · Hidden']);
  });

  it('should name items of a list of text by position', () => {
    const leaves = schemaLeaves(hero.fields, { audiences: ['Teams', 'Families'] });

    expect(leaves.filter((leaf) => leaf.label.startsWith('Audience '))).toHaveLength(2);
  });

  it('should treat a missing list as empty', () => {
    expect(
      schemaLeaves(hero.fields, { audiences: 'nope' }).some((leaf) => leaf.label === 'Audience 1'),
    ).toBe(false);
  });

  it('should skip a group whose switch is off, and enter it while on', () => {
    const fields = [
      {
        key: 'spotlight',
        label: 'Spotlight',
        kind: FieldKind.Group,
        onlyWhen: 'featured',
        fields: [{ key: 'title', label: 'Title', kind: FieldKind.Text }],
      },
    ] as const;

    expect(schemaLeaves(fields, { featured: false, spotlight: null })).toEqual([]);
    expect(schemaLeaves(fields, { featured: true, spotlight: { title: 'A' } })).toHaveLength(1);
  });
});
