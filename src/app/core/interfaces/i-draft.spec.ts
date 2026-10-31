import { draftId, draftsByPath, toDraft } from './i-draft';

describe('draft storage', () => {
  it('should name a draft after its document path', () => {
    expect(draftId('home/hero')).toBe('home__hero');
    expect(draftId('/site/config/')).toBe('site__config');
  });

  it('should read a stored draft', () => {
    expect(toDraft({ path: 'home/hero', content: { title: 'A' }, savedAt: 'x' })).toEqual({
      path: 'home/hero',
      content: { title: 'A' },
      savedAt: 'x',
    });
  });

  it.each([null, { path: 'home/hero', content: ['list'], savedAt: 'x' }, { path: 1 }])(
    'should ignore %j as a draft',
    (fields) => {
      expect(toDraft(fields)).toBeNull();
    },
  );

  it('should key valid drafts by path and drop damaged ones', () => {
    const drafts = draftsByPath(
      new Map([
        ['home__hero', { path: 'home/hero', content: {}, savedAt: 'x' }],
        ['broken', { path: 'home/offer' }],
      ]),
    );

    expect([...drafts.keys()]).toEqual(['home/hero']);
  });
});
