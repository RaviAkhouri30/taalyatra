# ADR-0012: Auth port, lazy Firebase Auth and a single admin UID

- **Status:** Accepted · **Date:** 2026-10-28 · **Version:** 1.4.0

## Context

The admin area needs a sign-in for one owner account (email and password, created in Firebase
Authentication). Constraints:

- Public pages must not pay for the Auth SDK.
- Promises are allowed only in adapters.
- No provider types may leak into feature code.
- Development and e2e runs must work offline.

## Decision

- **Port:** `IAuthService` (abstract class, also the DI token) with `user$`, `signIn`, `signOut`
  and `sendPasswordReset`, all Observables. `IAuthUser` and `AuthError` (`AuthErrorKind`) are our
  own types.
- **Firebase adapter:** `FirebaseAuthService`, with the SDK in a lazy chunk (`auth-gateway.ts`
  via `AUTH_GATEWAY_LOADER`), loaded only by admin routes. Firebase error codes map to
  `AuthErrorKind` through a `ReadonlyMap`, and one generic message is shown for wrong
  credentials, so the page never reveals which emails exist.
- **Fake adapter:** `FakeAuthService` for development and the e2e suite (test-only accounts). A
  factory picks the adapter by backend.
- **Admin identity:** `environment.adminUid`. A UID is an identifier, not a secret; the admin
  email is never stored in code. Functional guards (`adminGuard`, `signedOutGuard`) gate the
  interface. Data protection belongs to `firestore.rules`, which gets an admin-UID check with the
  editors.
- **Firebase console:** self sign-up disabled; authorized domains `taalyatra.in` and the Azure
  Static Web Apps domain; password-reset emails sent from `taalyatra.in`.

## Consequences

- Public pages download no auth code. `/admin` loads a chunk of about 23 kB compressed.
- Sessions persist on the device (IndexedDB) until sign-out.
- Adding another admin, or roles, means changing the UID check, ideally to a custom claim, and the
  rules together.
