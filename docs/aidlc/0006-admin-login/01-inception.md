# 01 · Inception — Admin sign-in

## Problem / goal

The site's content lives in Firestore (0004, 0005), but only a developer can change it. The
first step towards an admin area is a secure **sign-in**. The owner signs in with the single
admin account created in Firebase Authentication. The area behind it is guarded, ready for the
content editors in the next feature.

Built from the design prototype's sign-in screen (`design/prototype/project/Admin.dc.html`):
- Taal Yatra logo
- "Admin sign in" heading and a one-line description
- email and password fields
- "Sign in" button
- "Forgot password?" link
- "Single admin account" note
- "← Back to the website" link

The prototype's demo hints ("any email and any password will open the editor") are dropped.

**In scope:**
- the sign-in page
- password reset by email
- sign-out
- an auth guard on `/admin`
- a placeholder admin home (signed-in email, "View site", "Sign out")

**Out of scope (next feature):**
- the content editors (Offers, Contact, Videos, Team…)
- admin write rules in `firestore.rules`
- App Check (ADR-0010)

## User stories

- As the **owner**, I want to sign in with my email and password, so that only I can reach the
  admin area.
- As the **owner**, I want a password-reset email when I forget my password, so that I'm never
  locked out.
- As the **owner**, I want to stay signed in on my own device and to sign out deliberately, so
  that I don't sign in on every visit, and nobody else can on a shared device.
- As a **visitor**, I want `/admin` to send me to the sign-in page instead of showing anything,
  and the public site to stay as fast as it is today.
- As a **keyboard or screen-reader user**, I want the form, its errors and its status messages
  to be operable and announced (WCAG 2.2 AA).

## Acceptance criteria

- [ ] Given `/admin` while signed out, when opened, then the sign-in page shows: no site chrome
      (the bare layout), the design's content, and a page title.
- [ ] Given a missing email or password, when "Sign in" is pressed, then an accessible inline
      error shows and nothing is sent.
- [ ] Given wrong credentials, when "Sign in" is pressed, then one generic message shows
      ("Email or password is incorrect"), which never reveals whether the email exists. Too many
      attempts show a "try again later" message.
- [ ] Given the admin account's correct credentials, when "Sign in" is pressed, then the admin
      home opens and shows the signed-in email.
- [ ] Given a signed-in account whose UID is **not** the admin UID, when it reaches `/admin`,
      then it is signed out and sees "This account can't use the admin area". The client check
      is only for the interface: data protection belongs to `firestore.rules`, in the next
      feature.
- [ ] Given "Forgot password?", when an email is entered and submitted, then Firebase sends its
      reset email, and the page shows the same confirmation whether or not the email exists.
- [ ] Given a signed-in owner, when the site is reopened on the same device, then `/admin` opens
      the admin home without signing in again. "Sign out" returns to the sign-in page.
- [ ] Given any public page, when it loads, then no Firebase Auth code is downloaded: the auth
      SDK is a lazy chunk loaded only by `/admin`.
- [ ] Given the sign-in page and the admin home, when scanned, then axe reports no WCAG 2.2 AA
      violations on desktop, tablet and mobile.
- [ ] `npm run verify` and `npm run e2e` pass. A Firebase smoke test signs in against the Auth
      emulator.

## Units of work

1. **Auth port and adapters:** `IAuthService` in `core/interfaces` (`user$`, `signIn`,
   `signOut`, `sendPasswordReset`; our own `IAuthUser` type, so no SDK types leak).
   `FirebaseAuthService` loads `firebase/auth` lazily through a gateway, the same way Firestore
   does (ADR-0009), and maps Firebase error codes to our own error kinds. `FakeAuthService`
   serves development and e2e. A factory picks the adapter by backend.
2. **Admin identity:** `environment.adminUid` (`5zsz2DlUaja2Ss7wbFTrpiMMROk2`). A UID is an
   identifier, not a secret, so it may live in source. The next feature's rules use the same UID.
   The admin email is never hardcoded.
3. **Admin feature** (`features/admin`, lazy): sign-in page, forgot-password view, admin home,
   their view models, `admin.routes.ts`, and a functional `adminGuard` (signed-in admin, else
   the sign-in page).
4. **Routing:** `/admin` uses the bare layout; the `**` fallback stays.
5. **Copy:** stored in `pages/admin` (Firestore and `fake-db.json`), like the other pages. Error
   messages live there too.
6. **E2E:** sign-in journeys on the Fake backend (missing fields, wrong password, success, sign
   out, reset, guard redirect); axe; visual baselines; an Auth emulator smoke test.
7. **Docs:** ADR-0012 (auth port, lazy SDK, single admin UID); sequence diagram for sign-in;
   component tree; CHANGELOG; version **1.4.0**.

## Risks & open questions

- **Firebase console settings (owner):**
  - The Email/Password provider must be enabled. It is likely already on, since the account
    exists.
  - **Authorized domains** must include the Azure Static Web Apps domain and `taalyatra.in`,
    so password-reset links work.
- **Self sign-up.** Firebase lets anyone create an email/password account through the API when
  sign-up is enabled. The UID check keeps such accounts out of the interface, and the next
  feature's rules keep them out of the data. Recommended: turn off "Enable create (sign-up)" in
  the Firebase console (Authentication → Settings → User actions).
- **Bundle size.** `firebase/auth` adds about 50–60 kB compressed. It loads only on `/admin`, so
  public pages are unaffected; this is checked in Verification.
- **Session persistence.** The owner stays signed in on the device (IndexedDB) until signing
  out. A "remember me" option isn't in the design and isn't planned.
- **Brute force.** Firebase rate-limits sign-in attempts. App Check stays deferred until editing
  exists (ADR-0010).
- **Stacked branches.** `feat/admin-login` builds on `feat/inner-pages`, which builds on
  `feat/firebase-data`. It ships as 1.4.0, after 1.2.0 and 1.3.0.

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-10-28
