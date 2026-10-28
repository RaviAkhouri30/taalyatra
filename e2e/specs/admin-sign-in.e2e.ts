import {
  FAKE_ADMIN_ACCOUNT,
  FAKE_VISITOR_ACCOUNT,
} from '../../src/app/core/backends/fake/fake-auth.constants';
import { expect, test } from '../fixtures/test';

test.describe('Admin sign-in', () => {
  test('should send a signed-out visitor from /admin to the sign-in page', async ({ admin }) => {
    await admin.openPath('/admin');

    await expect(admin.page).toHaveURL(/\/admin\/sign-in$/);
    await expect(admin.page).toHaveTitle('Admin sign in — Taal Yatra');
    await expect(admin.heading).toHaveText('Admin sign in');
    await expect(admin.page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow',
    );
  });

  test('should explain missing and invalid fields, sending nothing', async ({ admin }) => {
    await admin.openPath('/admin/sign-in');

    await admin.signInButton.click();

    await expect(admin.email).toHaveAttribute('aria-invalid', 'true');
    await expect(admin.page.getByText('Enter your email.')).toBeVisible();
    await expect(admin.page.getByText('Enter your password.')).toBeVisible();

    await admin.email.fill('owner@example');
    await admin.password.fill('123');
    await admin.signInButton.click();

    await expect(admin.page.getByText(/Enter a valid email address/)).toBeVisible();
    await expect(admin.page.getByText('Passwords are 6 to 128 characters long.')).toBeVisible();
  });

  test('should show one generic message for a wrong password', async ({ admin }) => {
    await admin.openPath('/admin/sign-in');

    await admin.signIn(FAKE_ADMIN_ACCOUNT.email, 'not-the-password');

    await expect(admin.alert).toHaveText('Email or password is incorrect.');
    await expect(admin.password).toHaveValue('');
  });

  test('should turn away an account that is not the admin', async ({ admin }) => {
    await admin.openPath('/admin/sign-in');

    await admin.signIn(FAKE_VISITOR_ACCOUNT.email, FAKE_VISITOR_ACCOUNT.password);

    await expect(admin.page).toHaveURL(/reason=not-admin/);
    await expect(admin.alert).toHaveText('This account can’t use the admin area.');
  });

  test('should sign the admin in, show the admin home, then sign out', async ({ admin }) => {
    await admin.openPath('/admin/sign-in');

    await admin.signIn(FAKE_ADMIN_ACCOUNT.email, FAKE_ADMIN_ACCOUNT.password);

    await expect(admin.heading).toHaveText('Welcome back');
    await expect(admin.page).toHaveTitle('Admin — Taal Yatra');
    await expect(admin.page.getByText(FAKE_ADMIN_ACCOUNT.email)).toBeVisible();

    await admin.page.getByRole('button', { name: 'Sign out' }).click();

    await expect(admin.heading).toHaveText('Admin sign in');
  });

  test('should confirm a reset request without revealing whether the email exists', async ({
    admin,
  }) => {
    await admin.openPath('/admin/sign-in');
    await admin.page.getByRole('link', { name: 'Forgot password?' }).click();
    await expect(admin.heading).toHaveText('Reset your password');

    await admin.email.fill('someone@example.com');
    await admin.page.getByRole('button', { name: 'Send reset link' }).click();

    await expect(admin.status).toContainText('If that email has an admin account');
  });

  for (const path of ['/admin/sign-in', '/admin/reset-password']) {
    test(`should have no WCAG 2.2 AA violations on ${path}`, async ({ admin, axe }) => {
      await admin.openPath(path);

      const results = await axe().analyze();

      expect(results.violations).toEqual([]);
    });
  }

  test('should have no WCAG 2.2 AA violations on the admin home or with errors showing', async ({
    admin,
    axe,
  }) => {
    await admin.openPath('/admin/sign-in');
    await admin.signInButton.click();
    expect((await axe().analyze()).violations).toEqual([]);

    await admin.signIn(FAKE_ADMIN_ACCOUNT.email, FAKE_ADMIN_ACCOUNT.password);
    await expect(admin.heading).toHaveText('Welcome back');

    expect((await axe().analyze()).violations).toEqual([]);
  });

  test('should match the approved look of the sign-in card', async ({ admin }) => {
    await admin.openPath('/admin/sign-in');

    await expect(admin.page.locator('app-auth-card')).toHaveScreenshot('admin-sign-in.png', {
      stylePath: 'e2e/support/visual.css',
    });
  });
});
