import { expect, test } from '../fixtures/test';

test.describe('Home proposal request', () => {
  test('should explain what is missing, then send the request', async ({ home }) => {
    await home.open('contact');
    const form = home.contactSection;
    const name = form.getByRole('textbox', { name: 'Your name' });
    const phone = form.getByRole('textbox', { name: 'Phone' });
    const email = form.getByRole('textbox', { name: 'Email' });

    await form.getByRole('button', { name: 'Request proposal' }).click();

    await expect(name).toHaveAttribute('aria-invalid', 'true');
    await expect(form.getByText('Please enter a 10-digit phone number.')).toBeVisible();
    await expect(email).toHaveAttribute('aria-invalid', 'true');

    await form.getByRole('combobox', { name: 'Event type' }).selectOption('School or college');
    await name.fill('Asha Patil');
    await phone.fill('98765 43210');
    await email.fill('asha@example.com');
    await form.getByRole('button', { name: 'Request proposal' }).click();

    await expect(form.getByRole('status')).toContainText('on its way');
    await expect(name).toHaveValue('');
  });

  test('should carry the answers into the WhatsApp message', async ({ home }) => {
    await home.open('contact');
    const form = home.contactSection;

    await form.getByRole('textbox', { name: 'Your name' }).fill('Asha Patil');
    const href = await form.getByRole('link', { name: 'Send on WhatsApp' }).getAttribute('href');

    expect(href).toMatch(/^https:\/\/wa\.me\/919284276168\?text=/);
    expect(decodeURIComponent(href ?? '')).toContain('Name: Asha Patil');
  });
});
