import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { EXPERIENCES_DTO } from '../../testing/home-fixtures';
import { ExperiencesModel } from './experiences.model';

describe('ExperiencesModel', () => {
  const model = new ExperiencesModel(EXPERIENCES_DTO);

  it('should put the "All" filter first', () => {
    expect(model.filters).toEqual(['All', 'Percussion', 'Melody', 'Movement', 'No instruments']);
  });

  it('should link the signature card to its details and the others to the contact form', () => {
    expect(model.featured.link.fragment).toBe(PageAnchor.DrumCircleDetails);
    expect(model.items.every((item) => item.link.fragment === PageAnchor.Contact)).toBe(true);
    expect(model.items[0]?.link.label).toBe('Boombastic');
  });

  it('should list duration, group size and venue as specs', () => {
    expect(model.featured.specs).toEqual(['45–60 min', '10–5,000', 'Indoor / Outdoor']);
  });

  it('should match a card under "All" and under its own category only', () => {
    const harmonica = model.items.find((item) => item.name === 'Harmonica')!;

    expect(harmonica.matches('All', 'All')).toBe(true);
    expect(harmonica.matches('Melody', 'All')).toBe(true);
    expect(harmonica.matches('Movement', 'All')).toBe(false);
  });
});
