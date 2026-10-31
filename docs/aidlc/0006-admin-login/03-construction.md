# 03 · Construction — Admin sign-in

Built from the approved [design](02-design.md) on `feat/admin-login` (stacked on
`feat/inner-pages`).

| #   | Increment                | Files                                                                                                                                                                                                                                             | Tests                                                                                              |
| --- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| 1   | Auth port                | `IAuthService`, `IAuthUser`, `AuthError`, `AuthErrorKind`                                                                                                                                                                                         | unit                                                                                               |
| 2   | Firebase adapter         | `auth-gateway.ts` (lazy, the only `firebase/auth` importer), `AUTH_GATEWAY_LOADER`, `auth-error.mapper.ts`, `FirebaseAuthService`                                                                                                                 | unit (gateway with the SDK mocked through the shared mock; adapter with a fake gateway through DI) |
| 3   | Fake adapter and factory | `FakeAuthService`, `fake-auth.constants.ts`, `authServiceFactory`, `provideBackend`                                                                                                                                                               | unit                                                                                               |
| 4   | Configuration            | `IAppEnvironment.adminUid` and `authEmulator`; production UID `5zsz2DlUaja2Ss7wbFTrpiMMROk2`; test UIDs for the fake and emulator builds                                                                                                          | —                                                                                                  |
| 5   | Copy                     | `pages/admin` in `fake-db.json`                                                                                                                                                                                                                   | —                                                                                                  |
| 6   | Forms                    | `auth.validators.ts` (trimmed required; email `name@domain.tld` up to 254 characters; password 6–128 characters), `auth-forms.ts` (typed Reactive Forms)                                                                                          | unit                                                                                               |
| 7   | Guards                   | `adminGuard` (signed out → sign-in; another account → sign out, then `?reason=not-admin`), `signedOutGuard`                                                                                                                                       | unit                                                                                               |
| 8   | Views                    | `AdminPageViewModel` base; sign-in, reset-password and admin-home view models (`exhaustMap` submits); `app-auth-card`, sign-in, reset-password, admin-home and admin-shell (`noindex`) components; `admin.routes.ts`; `/admin` on the bare layout | unit                                                                                               |
| 9   | Shared form styles       | `src/styles/_forms.scss` (`text-input`, `field-error` mixins); the proposal form uses them, so its CSS output is unchanged; form and error tokens                                                                                                 | —                                                                                                  |
| 10  | Emulator                 | Auth emulator in `firebase.json`; the seed creates the emulator test accounts; the smoke suite starts `firestore,auth` and signs in                                                                                                               | written (needs Java)                                                                               |
| 11  | E2E                      | `AdminPage` page object and `admin` fixture; `admin-sign-in.e2e.ts` (redirect, field errors, wrong password, non-admin refused, sign in and out, reset, axe on every view, sign-in card baselines)                                                | e2e                                                                                                |

## Checks

- **`npm run verify`:** passes. 148 test files, 517 tests. Coverage: statements 99.82 %,
  branches 98.79 %, functions 99.72 %, lines 100 %. Initial bundle 475.88 kB raw, 110.26 kB
  transfer.
- **`npm run e2e`:** 228 passed. That includes 30 admin tests and axe with 0 violations on
  sign-in (with and without errors), reset password and the admin home.
- **Bundle:** the Auth SDK is only in the lazy `auth-gateway` chunk (89.62 kB raw, 23.00 kB
  transfer). Served with an SPA fallback, `/`, `/videos`, `/team`, `/shows` and `/achievements`
  request no auth code, and `/admin/sign-in` loads the chunk.
- **Firebase console (read back with the service account):**
  - Email/Password is enabled; self sign-up is **disabled**.
  - Authorized domains: `localhost`, `taal-yatra.firebaseapp.com`, `taal-yatra.web.app`,
    `taalyatra.in`, `calm-mud-0ca950310.4.azurestaticapps.net`.
  - Custom email domain `taalyatra.in`: `SUCCEEDED`.
- **Not run yet:** sign-in against the real project, and the Firebase smoke suite (it needs
  Java).

## Decisions & deviations from design

- **Inline errors per field**, instead of the prototype's single "Enter both your email and
  password". Each field says what's wrong (required, invalid email, length) through
  `aria-invalid` and `aria-describedby`, like the proposal form.
- **The prototype's demo hints are dropped:** "any email and any password will open the editor".
- **Validators are exported `ValidatorFn` constants,** not a static class. ESLint forbids
  static-only classes, and the contact form's validators set the precedent.
- **The password uses a trimmed `required` check plus the 6–128 length rule.** 6 is Firebase's
  minimum, so obviously invalid attempts never reach the server.
- **Navigation after sign-in and sign-out** uses `void router.navigateByUrl(...)`. The Promise
  result isn't needed (the guard decides what renders), and the project's Promise-syntax rules
  allow it. Commented in the view models.
- **The reset page treats `InvalidCredentials` as success,** so an unknown email gets the same
  confirmation (no account enumeration). Only rate-limit and network failures are shown.
- **The reset email's continue link** is built by the adapter (`origin + /admin/sign-in`). `core`
  can't import the app's route enum, so the view model passes the path.
- **The admin home reuses `app-auth-card`,** a placeholder until the editors' dashboard exists.
- **Verification-tooling note:** a plain static server returns 404 for deep links. The bundle
  check uses a Node server with an SPA fallback, matching Azure Static Web Apps.

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-10-28
