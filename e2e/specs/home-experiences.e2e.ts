import { expect, test } from '../fixtures/test';

test.describe('Home experiences', () => {
  test('should filter experiences with the chips', async ({ home }) => {
    await home.open('experiences');
    const section = home.experiencesSection;
    const titles = section.getByRole('heading', { level: 3 });

    await expect(titles).toHaveCount(6);

    await section.getByRole('button', { name: 'Melody' }).click();
    await expect(titles).toHaveText(['Boombastic', 'Harmonica']);
    await expect(section.getByRole('button', { name: 'Melody' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await section.getByRole('button', { name: 'All' }).click();
    await expect(titles).toHaveCount(6);
  });

  test('should take the visitor from the signature card to the drum circle details', async ({
    home,
  }) => {
    await home.open('experiences');

    await home.experiencesSection.getByRole('link', { name: /Drum Circle/ }).click();

    await expect(home.page).toHaveURL(/#drum-circle-details$/);
    await expect(home.drumCircleSection.getByRole('heading', { level: 2 })).toBeInViewport();
  });
});
