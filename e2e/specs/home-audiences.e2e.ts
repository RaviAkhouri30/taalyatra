import { expect, test } from '../fixtures/test';

test.describe('Home audiences', () => {
  test('should land on "Who it’s for" from a direct link and show three audiences', async ({
    home,
  }) => {
    await home.open('for-everyone');

    await expect(home.audiencesSection.getByRole('heading', { level: 2 })).toBeInViewport();
    await expect(home.audiencesSection.getByRole('heading', { level: 3 })).toHaveText([
      'Corporate teams',
      'Family functions',
      'Fun seekers',
    ]);
  });
});
