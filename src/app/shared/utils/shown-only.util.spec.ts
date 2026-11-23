import { shownOnly } from './shown-only.util';

describe('shownOnly', () => {
  it('should leave out hidden items and keep the rest in order, missing meaning shown', () => {
    const items = [{ id: 1 }, { id: 2, hidden: true }, { id: 3, hidden: false }];

    expect(shownOnly(items)).toEqual([{ id: 1 }, { id: 3, hidden: false }]);
  });
});
