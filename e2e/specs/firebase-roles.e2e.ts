import { type APIRequestContext } from '@playwright/test';
import { expect, test } from '../fixtures/test';

/** Emulator REST root; "owner" bypasses the rules, standing in for data already stored. */
const DOCUMENTS_URL =
  'http://127.0.0.1:8080/v1/projects/demo-taal-yatra/databases/(default)/documents';
const OWNER = { Authorization: 'Bearer owner' };

/** The auth emulator's sign-in, for a real ID token as the browser would have. */
const SIGN_IN_URL =
  'http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo';

const ADMIN = { email: 'admin@taalyatra.test', password: 'emulator-admin-password' };
const MANAGER = {
  uid: 'emulator-manager-uid',
  email: 'manager@taalyatra.test',
  password: 'emulator-manager-password',
};

/** Starts each run without the manager, so Team access adds them through the rules. */
async function removeManager(request: APIRequestContext): Promise<void> {
  await request.delete(`${DOCUMENTS_URL}/roles/${MANAGER.uid}`, { headers: OWNER });
}

/** @returns The manager's ID token from the auth emulator. */
async function managerToken(request: APIRequestContext): Promise<string> {
  const response = await request.post(SIGN_IN_URL, {
    data: { email: MANAGER.email, password: MANAGER.password, returnSecureToken: true },
  });
  return ((await response.json()) as { idToken: string }).idToken;
}

/** A draft as a manager's browser saves it, in Firestore's REST shape. */
function managerDraft(path: string): object {
  return {
    fields: {
      path: { stringValue: path },
      content: { mapValue: { fields: { title: { stringValue: 'Crafted' } } } },
      savedAt: { stringValue: new Date().toISOString() },
      savedBy: { stringValue: MANAGER.uid },
    },
  };
}

/** Roles and approvals (0019) through the real Firestore rules, on the emulator. */
test.describe('Firebase roles (emulator)', () => {
  test('should let a manager send a change for approval, which the owner approves', async ({
    editor,
    page,
    request,
  }, info) => {
    // Unique per viewport: the projects share one emulator database, one after another. A page
    // the smoke suite doesn't check, so this file's publishes can't change its expectations.
    const title = `Rhythm for ${info.project.name}`;
    await removeManager(request);

    await editor.signIn(ADMIN);
    await editor.openTab('Team access');
    await page.getByRole('button', { name: 'Add a manager' }).click();
    const form = page.getByRole('form', { name: 'Add a manager' });
    await form.getByRole('textbox', { name: 'User UID' }).fill(MANAGER.uid);
    await form.getByRole('textbox', { name: 'Their email' }).fill(MANAGER.email);
    await form.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByRole('article', { name: MANAGER.email })).toBeVisible();
    await editor.signOut();

    await editor.signIn(MANAGER);
    await editor.openTab('Who it’s for');
    const field = editor.card('Who it’s for').getByLabel('Title', { exact: true });
    await field.fill(title);
    await editor.waitForSave();
    await editor.openTab('Review & publish');
    await page.getByRole('button', { name: 'Send for approval' }).click();
    await page.getByRole('button', { name: 'Yes, send' }).click();
    await expect(page.getByRole('region', { name: 'Your requests' })).toContainText(
      'Waiting for the owner',
    );
    await editor.openTab('Who it’s for');
    await expect(field).toBeDisabled();
    await editor.signOut();

    await editor.signIn(ADMIN);
    await editor.openTab('Review & publish');
    const queue = page.getByRole('region', { name: /^Waiting for your approval/ });
    await queue.getByRole('button', { name: 'Approve and publish' }).click();
    await expect(page.getByText('Approved and published.')).toBeVisible();
    await page.goto('/');

    await expect(page.locator('#for-everyone h2')).toHaveText(title);
  });

  test('should refuse a manager’s crafted request for a hidden page', async ({ request }) => {
    await request.patch(`${DOCUMENTS_URL}/roles/${MANAGER.uid}`, {
      headers: OWNER,
      data: {
        fields: {
          email: { stringValue: MANAGER.email },
          pages: { mapValue: { fields: { team: { stringValue: 'hidden' } } } },
          uploads: { booleanValue: true },
          addedAt: { stringValue: new Date().toISOString() },
        },
      },
    });
    const headers = { Authorization: `Bearer ${await managerToken(request)}` };

    const hidden = await request.patch(`${DOCUMENTS_URL}/drafts/home__team`, {
      headers,
      data: managerDraft('home/team'),
    });
    const live = await request.patch(`${DOCUMENTS_URL}/home/shows`, {
      headers,
      data: { fields: { title: { stringValue: 'Crafted' } } },
    });
    // The control: the same token may save a draft of a page that isn't hidden.
    const allowed = await request.patch(`${DOCUMENTS_URL}/drafts/home__shows`, {
      headers,
      data: managerDraft('home/shows'),
    });

    expect(hidden.status()).toBe(403);
    expect(live.status()).toBe(403);
    expect(allowed.status()).toBe(200);
    await request.delete(`${DOCUMENTS_URL}/drafts/home__shows`, { headers: OWNER });
  });
});
