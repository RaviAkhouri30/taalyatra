import { CONTENT_SECTIONS } from '../schemas/content.sections';
import { OFFER_SECTIONS } from '../schemas/offer.sections';
import { schemaLeaves } from './schema-leaves';

describe('schemaLeaves', () => {
  const [, offer] = OFFER_SECTIONS;
  const hero = CONTENT_SECTIONS.find((section) => section.id === 'hero')!;

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

  it('should name items of a list of text by position', () => {
    const leaves = schemaLeaves(hero.fields, { audiences: ['Teams', 'Families'] });

    expect(leaves.filter((leaf) => leaf.label.startsWith('Audience '))).toHaveLength(2);
  });

  it('should treat a missing list as empty', () => {
    expect(
      schemaLeaves(hero.fields, { audiences: 'nope' }).some((leaf) => leaf.label === 'Audience 1'),
    ).toBe(false);
  });
});
