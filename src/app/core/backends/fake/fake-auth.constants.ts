/**
 * Test-only accounts for the fake auth adapter (development and the e2e suite). They exist only
 * inside `FakeAuthService`: no real account has these credentials.
 */
export const FAKE_ADMIN_ACCOUNT = {
  email: 'admin@taalyatra.test',
  password: 'fake-admin-password',
};

/** A signed-in account that is not the admin, for the guard's refusal path. */
export const FAKE_VISITOR_ACCOUNT = {
  email: 'visitor@taalyatra.test',
  password: 'fake-visitor-password',
  uid: 'fake-visitor-uid',
};
