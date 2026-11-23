import { withoutHiddenOff } from './hidden-off';

describe('withoutHiddenOff', () => {
  it('should drop hidden: false at any depth, and keep hidden: true', () => {
    expect(
      withoutHiddenOff({
        items: [
          { a: 1, hidden: false },
          { a: 2, hidden: true },
        ],
        hidden: false,
      }),
    ).toEqual({ items: [{ a: 1 }, { a: 2, hidden: true }] });
  });
});
