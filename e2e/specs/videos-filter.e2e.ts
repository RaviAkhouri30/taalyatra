import { expect, test } from '../fixtures/test';

test.describe('Videos filter', () => {
  test('should show only the chosen category, feature its first video and update the count', async ({
    innerPages,
  }) => {
    const videosPage = innerPages.videos;
    await videosPage.open();
    const chips = videosPage.page.getByRole('group', { name: 'Filter videos' });
    const count = videosPage.page.getByText(/^Showing \d+ videos$/);
    const videos = videosPage.page.getByRole('link', { name: /^Watch .* on YouTube$/ });

    await expect(count).toHaveText('Showing 9 videos');
    await expect(videos).toHaveCount(9);

    await chips.getByRole('button', { name: 'Workshops' }).click();

    await expect(chips.getByRole('button', { name: 'Workshops' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(count).toHaveText('Showing 2 videos');
    await expect(videos).toHaveCount(2);
    await expect(videos.first()).toHaveAccessibleName('Watch [Video title 3] on YouTube');

    await chips.getByRole('button', { name: 'All' }).click();

    await expect(count).toHaveText('Showing 9 videos');
  });
});
