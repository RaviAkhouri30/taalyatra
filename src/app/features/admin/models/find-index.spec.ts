import { EditorTab } from './editor-tab.enum';
import { EDITOR_TABS } from '../schemas/editor-tabs';
import { FIND_MAX_RESULTS, buildFindIndex, findIn } from './find-index';

describe('find index', () => {
  const index = buildFindIndex(EDITOR_TABS, (tab) => `/admin/${tab}`);
  const labels = (query: string) => findIn(index, query).map((found) => found.label);

  it('should find a field by its label and go to that field', () => {
    const [first] = findIn(index, 'phone, as shown');

    expect(first).toMatchObject({
      label: 'Phone, as shown',
      url: `/admin/${EditorTab.Contact}`,
      fragment: 'field-contactDetails-contact-phone-display',
      fallback: 'card-contactDetails',
    });
  });

  it('should find a section by an everyday word its labels don’t use', () => {
    expect(labels('diwali')[0]).toBe('Offer');
    expect(labels('about')).toContain('Drum circle');
  });

  it('should not list every field of a section that only its everyday word matches', () => {
    expect(labels('about')).not.toContain('Facts');
  });

  it('should put names that start with the words first', () => {
    expect(labels('title')[0]).toMatch(/^Title/);
  });

  it('should need every word to match, and ignore case and spaces', () => {
    expect(labels('  TEAM   heading ')).toContain('Section heading');
    expect(labels('team zebra')).toEqual([]);
  });

  it('should send a list to its card, since its items fold away', () => {
    const [shows] = findIn(index, 'show formats');

    expect(shows?.fragment).toBe('card-shows-formats');
  });

  it('should list at most a handful, and nothing for an empty query', () => {
    expect(findIn(index, 'e')).toHaveLength(FIND_MAX_RESULTS);
    expect(findIn(index, '   ')).toEqual([]);
  });
});
