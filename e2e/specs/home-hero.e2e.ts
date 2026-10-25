import { expect, test } from '../fixtures/test';

test.describe('Home hero', () => {
  test('should show the headline, calls to action and the drum animation', async ({ home }) => {
    await home.open();

    await expect(home.heroHeading).toHaveText('Find your rhythm. Share the beat.');
    await expect(home.proposalButton).toHaveAttribute('href', '/#contact');
    await expect(home.gameLink).toHaveAttribute('href', '/#play');
    await expect(home.stage).toBeVisible();
  });
});
