import { expect, test } from '../fixtures/test';

test.describe('Home rhythm game', () => {
  test('should let the player repeat the pattern and score', async ({ home }) => {
    await home.open('play');
    const game = home.gameSection;
    await home.recordLitPads();

    await game.getByRole('button', { name: 'Start the challenge' }).click();
    await expect(game.locator('.gmsg')).toHaveText('Your turn! Repeat the pattern.');
    // The first pattern is one random beat: repeat the pad that lit up.
    const [padName = ''] = await home.litPads();
    await game.getByRole('button', { name: padName }).click();

    await expect(game.locator('.gmsg')).toHaveText('Nice! Adding one more beat…');
    await expect(game.locator('.gstats div').nth(1).locator('span')).toHaveText('10');
  });

  test('should record and play back a free-jam loop', async ({ home }) => {
    await home.open('play');
    const game = home.gameSection;

    await game.getByRole('button', { name: 'Free jam' }).click();
    await game.getByRole('button', { name: 'Record' }).click();
    await game.getByRole('button', { name: 'Drum pad Boom' }).click();
    await game.getByRole('button', { name: 'Drum pad Clap' }).click();
    await game.getByRole('button', { name: 'Stop recording' }).click();
    await expect(game.locator('.gmsg')).toHaveText('Saved 2 beats. Press Play back.');

    await game.getByRole('button', { name: 'Play back' }).click();

    await expect(game.locator('.gmsg')).toHaveText(
      'Loop finished. Play it again or record a new one.',
    );
  });
});
