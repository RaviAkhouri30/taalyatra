import { expect, test } from '../fixtures/test';

test.describe('Home seasonal offer', () => {
  test('should take the visitor from the promo badge to the offer section', async ({ home }) => {
    await home.open();
    await expect(home.offerSection).toBeAttached();

    await home.promoBadgeLink.click();

    await expect(home.page).toHaveURL(/#diwali$/);
    await expect(home.offerSection.getByRole('heading', { level: 2 })).toBeInViewport();
    await expect(home.offerSection.getByRole('heading', { level: 3 })).toHaveCount(3);
  });
});
