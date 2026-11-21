import { Buffer } from 'node:buffer';
import {
  FAKE_AI_DESCRIPTION,
  FAKE_AI_FAIL,
} from '../../src/app/core/backends/fake/fake-ai.constants';
import { seedVisitorData } from '../fixtures/visitor-data';
import { type EditorPage } from '../pages/editor.page';
import { expect, test } from '../fixtures/test';

const HEADLINE = 'Headline, first line';
const photo = {
  name: 'ai-photo.jpg',
  mimeType: 'image/jpeg',
  buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9]),
};

/** Opens the Hero and asks the AI to rewrite its headline in `style`. */
async function rewriteHeadline(editor: EditorPage, style: string): Promise<void> {
  await editor.openTab('Hero');
  const hero = editor.card('Hero');
  // Each field's AI help is described by the field it's for, so the label stays the field's alone.
  await hero.getByRole('button', { name: 'AI help', description: `For ${HEADLINE}` }).click();
  await hero.getByRole('button', { name: style, exact: true }).click();
}

/** AI help in the admin and on Leads (0025, 2.6.0), with the Fake provider. */
test.describe('Admin AI help', () => {
  test.beforeEach(async ({ editor }) => {
    await editor.signIn();
  });

  test('should rewrite a field only when the owner uses the suggestion', async ({
    editor,
    page,
  }) => {
    await editor.openTab('Hero');
    const field = editor.card('Hero').getByLabel(HEADLINE);
    const before = await field.inputValue();

    await rewriteHeadline(editor, 'Shorter');
    const suggestion = page.getByRole('region', { name: 'AI suggestion' });
    await expect(suggestion).toContainText(`shorter: ${before}`);
    await expect(field).toHaveValue(before);
    await suggestion.getByRole('button', { name: 'Use it' }).click();

    await expect(field).toHaveValue(`shorter: ${before}`);
    await editor.waitForSave();
    await expect(editor.preview.getByRole('heading', { level: 1 })).toContainText('shorter:');
  });

  test('should say when the AI can’t help, leaving the field as it was', async ({
    editor,
    page,
  }) => {
    await editor.openTab('Hero');
    const field = editor.card('Hero').getByLabel(HEADLINE);
    await field.fill(FAKE_AI_FAIL);
    await editor.waitForSave();

    await rewriteHeadline(editor, 'Clearer');

    await expect(
      page.getByRole('alert').filter({ hasText: 'AI help isn’t available' }),
    ).toBeVisible();
    await expect(field).toHaveValue(FAKE_AI_FAIL);
  });

  test('should suggest a description for an uploaded photo', async ({ editor, page }) => {
    await editor.openTab('Team');
    const team = editor.card('Team members');
    const count = await team.getByLabel('Name', { exact: true }).count();
    await team.getByRole('button', { name: 'Add team member' }).click();
    const member = team.getByRole('group', { name: `Team member ${String(count + 1)}` });
    await member.getByRole('button', { name: 'Choose or upload' }).click();
    await member.getByLabel('Choose photos').setInputFiles([photo]);
    await member.getByRole('button', { name: `Choose ${photo.name}` }).click();

    await member.getByRole('button', { name: 'Suggest a description' }).click();
    await page
      .getByRole('region', { name: 'AI suggestion' })
      .getByRole('button', { name: 'Use it' })
      .click();

    await expect(member.getByLabel('Description')).toHaveValue(FAKE_AI_DESCRIPTION);
  });

  test('should analyse the leads from counts', async ({ editor, page }) => {
    await seedVisitorData(page);
    await editor.openTab('Leads');
    const analysis = page.getByRole('region', { name: 'AI analysis' });
    await expect(analysis).toContainText('Never a name, phone number, email or message.');

    await analysis.getByRole('button', { name: /^Analyse (these \d+ leads|this lead)$/ }).click();

    await expect(analysis).toContainText('Most enquiries are for corporate events.');
    await expect(analysis).toContainText('Analysed');
  });

  test('should have no WCAG 2.2 AA violations with a suggestion and an analysis showing', async ({
    editor,
    page,
    axe,
  }) => {
    await rewriteHeadline(editor, 'Warmer');
    await page.getByRole('region', { name: 'AI suggestion' }).waitFor();
    await page.mouse.move(0, 0);
    expect((await axe().exclude('iframe').analyze()).violations).toEqual([]);

    await seedVisitorData(page);
    await editor.openTab('Leads');
    const analysis = page.getByRole('region', { name: 'AI analysis' });
    await analysis.getByRole('button', { name: /^Analyse/ }).click();
    await expect(analysis).toContainText('Analysed');

    expect((await axe().analyze()).violations).toEqual([]);
  });
});
