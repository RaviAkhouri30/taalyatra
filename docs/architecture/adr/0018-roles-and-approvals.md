# ADR-0018: Roles and approvals

- **Status:** Accepted · **Date:** 2026-11-20 · **Version:** 2.0.0 (photo permissions 2.0.1)

## Context

The owner wants a content manager to help with the website without being able to break it or see customers'
details (0014 V4, V5). Until 2.0.0 one account, fixed by UID in `firestore.rules` and the environment
([ADR-0012](0012-auth-port-single-admin.md)), could do everything. The new rules must protect the data whatever
the screens show, keep the owner impossible to lock out, and stay inside Firestore's free plan and rule limits.

## Decision

- **The owner stays fixed by UID** in the rules (`ownerUid()`), the environment and the upload function. Nothing
  on Team access can change or remove the owner. This keeps the 0014 programme's intent, but not its wording ("the
  admin is no longer hard-coded"): a stored owner role could be deleted by mistake, a fixed UID can't.
- **Managers live in `roles/{uid}`** = `{ email, pages: { <EditorTab>: hidden | approval | publish }, uploads,
addedAt }`. A page without a setting needs approval. Only the owner writes roles; a manager reads only their own.
- **The rules check every write by page.** A manager drafts any page they see, publishes only pages set to
  publish, and for the shared `site/config` only the parts those pages edit (`publishableConfigKeys()`). The role
  is read once per request (`let pages = role().pages`), which keeps a 20-document publish inside the rules' limit
  of document reads. A manager's history record must name only publishable paths, and only the owner trims history.
- **Approvals are a document plus locks, written in one batch.** `approvals/{id}` records the request;
  `locks/{draftKey}` stops the manager changing a draft while it waits. A manager may create a lock only with their
  own waiting request in the same batch (`existsAfter`/`getAfter`), and remove one only when the request is gone.
  Approve is one commit: the publish, the answer and the unlocks.
- **One shared draft per document, signed by its last author** (`savedBy`). Review & publish ticks only the
  account's own changes, so nobody publishes a colleague's unfinished work by accident.
- **The screens follow one model.** `Permissions` (no Angular) answers "can see", "can publish", "can upload" and
  what publishing a draft does; `AccessService` reads the role once per sign-in. Guards, the menu, the dashboard,
  Review & publish, the editor's lock and the photo library all ask it. The rules enforce the same.
- **The upload function reads the manager's permission with the manager's own ID token** (Firestore REST,
  `roles/{uid}`), so it holds no database credential. Deleting stays owner-only there too.

## Rule exceptions

- **Managers read every draft, approval and lock**, not only their own: Review & publish and the badges need list
  queries, and the rules can't filter a list by who wrote each item. Drafts are the shared working copy anyway.
- **Released before its verification** (CLAUDE.md §2 and §11): the owner chose to number each merge to production
  (2.0.0, 2.0.1), and to finish the emulator tests and records in 2.0.2.

## Alternatives

- **Firebase custom claims for roles:** they need the Admin SDK on a server and only change at the next token
  refresh; a document is read by the rules on every request.
- **A draft per person:** previews would no longer show the site as it will be, and two people's changes to one
  document would need merging.
- **Email to the owner for each request:** uses the 200-a-month EmailJS allowance shared with proposals (0014 D5).

## Consequences

- Removing a manager or changing a page's setting applies at once in the rules; the manager's screens follow the
  next time they open the admin.
- Each admin page costs a few more reads (the role, the requests, the locks), well inside the free plan.
- Rollback to 1.13.0 keeps working with these rules: the owner's access is unchanged.
- `tests/rules/firestore-roles.rules.spec.ts` and `firestore-manager-publish.rules.spec.ts` cover the rules;
  `e2e/specs/firebase-roles.e2e.ts` runs a manager's approval through them in a browser.
