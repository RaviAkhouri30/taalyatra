import { VIDEOS_FIXTURE } from '@shared/testing/fixtures';
import { toVideoCards } from './video-cards.util';

describe('toVideoCards', () => {
  it('should name each card after its video, in order', () => {
    const cards = toVideoCards(VIDEOS_FIXTURE.slice(0, 2), 'Watch {title} on YouTube');

    expect(cards.map((card) => card.ariaLabel)).toEqual([
      'Watch [Video title 1] on YouTube',
      'Watch [Video title 2] on YouTube',
    ]);
    expect(cards[0]?.video).toBe(VIDEOS_FIXTURE[0]);
  });

  it('should name each card by its title when no label is stored', () => {
    expect(toVideoCards(VIDEOS_FIXTURE.slice(0, 1), '')[0]?.ariaLabel).toBe('[Video title 1]');
  });
});
