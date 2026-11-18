# 03 · Construction — Nothing lost, and what's new (1.12.0)

| #   | Increment      | Files                                                                                                                                                                                                                                                                                                                                                                                                      | Tests                                                                                                                                                                                                         |
| --- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | V1 What's new  | `angular.json` (`.md` text loader), `tsconfig.json` (`@changelog`), `src/markdown.d.ts`, `core/tokens/changelog.token.ts`, `models/release-notes.ts`, `releases-page.model.ts`, `services/release-notes.service.ts`, `components/releases/*`, `editor-nav.constants.ts`, layout, dashboard                                                                                                                 | `release-notes.spec.ts`, `changelog.token.spec.ts`, `release-notes.service.spec.ts`, `releases.component.spec.ts`, `editor-layout.component.spec.ts`, `admin-safety.e2e.ts`                                   |
| 2   | V13 Backups    | `core/interfaces/i-file-service.ts`, `backends/browser/browser-file.service.ts`, `backends/fake/fake-file.service.ts`, `file-service.factory.ts`, `config/provide-files.ts`, `models/backup-file.ts`, `backup-status.model.ts`, `services/backup.service.ts`, `device-store.service.ts`, `components/backup-panel/*`, `view-models/backup-download.ts`, publish bar and page, dashboard, `firestore.rules` | `backup-file.spec.ts`, `backup-status.model.spec.ts`, `backup.service.spec.ts`, `device-store.service.spec.ts`, `backup-panel.*.spec.ts`, `backup-download.spec.ts`, rules tests (157), `admin-safety.e2e.ts` |
| 3   | V3 Going back  | `services/publish.service.ts` (`goBack`), `components/publish-history/*`, `publish-page.*`, `publish-page.model.ts` (`newest`)                                                                                                                                                                                                                                                                             | `publish.service.spec.ts`, `publish-history.component.spec.ts`, `publish-page.component.spec.ts`, `admin-safety.e2e.ts`                                                                                       |
| 4   | V2 Safety copy | `services/safety-copy.service.ts`, `view-models/editor-page.view-model.ts`, `editor-page.component.*`                                                                                                                                                                                                                                                                                                      | `safety-copy.service.spec.ts`, `editor-page.view-model.spec.ts`, `admin-safety.e2e.ts`                                                                                                                        |

## Decisions & deviations from design

- **Going back undoes later publishes too.** The design's warning says later publishes are replaced; the old "Undo" only
  restored the one publish's documents. `goBack` now takes every publish from the newest down to the chosen one, and each
  document gets its version from just before the earliest of them, so the site really is as it was.
- **Restoring the photo library:** library entries aren't drafted (they're private), so a restore writes back the saved
  descriptions of photos still in the library, and leaves out photos deleted since: their files are gone for good, and an
  entry would point at nothing. The content's own pictures (address, description, crop) come back through the drafts.
- **The safety copy is offered when it differs from what the page loaded**, not by comparing times with the draft: it is
  removed as soon as its exact content is saved, so any copy left behind holds a change that never reached the draft. A copy
  equal to what loaded is dropped quietly.
- **The current version comes from the CHANGELOG's newest release**, not `package.json`: `npm version` runs after the
  CHANGELOG entry, so they agree, and bundling `package.json` would ship the dependency list in the admin chunk.
- **Browser storage for the editor is a small admin service (`DeviceStoreService`)**, not an addition to `LocalStoreService`:
  that one ships with the public site's first download, which the change took to 499.99 kB of 500.
- **`BackupService` is provided on the admin routes**, not the root, because it needs `IFileService`, which only those routes
  provide (like `IMediaService`).
- **The backup file is indented** so the owner can open it and read it; it is about 1.5 times larger (well under the 4 MB
  browser limit).

## Screenshots for approval

In [`screenshots/`](screenshots/): the dashboard with its Backups and What's new cards, What's new, Review & publish with the
backups card after a publish, the go-back warning, the unsaved-changes bar on an editor tab, and the backups card on a phone.
The dashboard's e2e screenshot baselines change with the two new cards; they are re-recorded only after the owner approves
the look.

## Own walkthrough before review

- The dashboard's What's new card showed whole notes and grew taller than every other card: it now shows each note's
  headline only (its bold lead, or its first sentence), and the page has the rest.
- A space crept in before punctuation after bold text ("follows the website : Hero"): each run of a note is now its own
  element, so the page's layout adds no spaces.
- After a backup was downloaded, Review & publish still said "Published. Download a backup…": a backup made anywhere now
  ends that suggestion.

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-18.
