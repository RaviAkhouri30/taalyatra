import { type IRelease } from './release-notes';
import {
  NOTE_HEADLINE_MAX,
  ReleasesPageModel,
  noteHeadline,
  summarizeRelease,
} from './releases-page.model';

const text = (value: string) => [{ text: value, strong: false, code: false }];

const RELEASE: IRelease = {
  version: '1.12.0',
  date: '2026-11-18',
  groups: [
    { heading: 'Added', items: [text('One'), text('Two')] },
    { heading: 'Changed', items: [text('Three'), text('Four')] },
  ],
};

describe('ReleasesPageModel', () => {
  it('should show each release’s day as the owner reads it', () => {
    const page = new ReleasesPageModel([RELEASE]);

    expect(page.entries[0]?.when).toBe('18 Nov 2026');
  });

  it('should sum a release up in its first three notes, across its lists', () => {
    const summary = summarizeRelease(RELEASE);

    expect(summary.version).toBe('1.12.0');
    expect(summary.notes).toEqual(['One', 'Two', 'Three']);
  });

  it('should headline a note by its bold lead', () => {
    const note = [
      { text: 'Find', strong: true, code: false },
      { text: ' at the top of the menu.', strong: false, code: false },
    ];

    expect(noteHeadline(note)).toBe('Find');
  });

  it('should headline a plain note by its first sentence, cut to fit', () => {
    expect(noteHeadline(text('Lists fold. Long items fold to one line.'))).toBe('Lists fold');
    expect(noteHeadline(text('x'.repeat(NOTE_HEADLINE_MAX + 10)))).toBe(
      `${'x'.repeat(NOTE_HEADLINE_MAX)}…`,
    );
  });
});
