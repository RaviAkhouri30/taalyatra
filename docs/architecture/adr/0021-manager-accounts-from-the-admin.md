# ADR-0021: Creating a manager's account from the admin

- **Status:** Accepted
- **Date:** 2026-11-23
- **Version:** 2.14.0

## Context

Adding a manager (0019) meant leaving the admin: creating their account in the Firebase console, telling them a
password, copying their **User UID** back into Team access. The owner asked for the UID to be made for them (0030).
Firebase's Auth SDK can create an account from the browser, but `createUserWithEmailAndPassword` signs the new account
in, which would sign the owner out. Creating accounts properly elsewhere needs Firebase's admin key, which would have
to live in the Azure Function.

## Decision

- **The browser calls Firebase's own sign-up API** (`identitytoolkit … accounts:signUp`) with the site's public web
  key, as a plain `HttpClient` request through a new port, `IAccountService` (`FirebaseAccountService`, the Auth
  emulator's address for the emulator build; `FakeAccountService` for development and tests). A request, not the SDK,
  so the owner's session is untouched.
- **The password is 32 random characters** from `crypto.getRandomValues`, used once and never stored or shown. Firebase
  then emails the manager a link to choose their own (`sendPasswordReset`, the password email the owner can reword in
  the Firebase console).
- **The role is saved under the new account's id**, then the email is sent; nothing is saved if the account wasn't
  made. An email that already has an account, or a project with sign-up turned off, opens the old path: paste the id.
- **No rules change.** A new account can do nothing until its role exists, and only the owner writes roles.

## Consequences

- No secret and no new dependency; the Azure Function is unchanged.
- An existing account can't be looked up by its email from the browser, so its id is still pasted (the form says so).
- If sign-up is ever turned off in Firebase, inviting falls back to pasting, with a line saying why.
- Anyone could already create an account with the public key (Firebase's default); such an account stays powerless
  without a role, as before.
