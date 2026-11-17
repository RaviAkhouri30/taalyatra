# 01 · Inception — Nothing lost, and what's new (1.11.0)

The second release of the [version 2 programme](../0014-version-2/01-inception.md), which holds the problem, user stories and
acceptance criteria. This file only records what 1.11.0 takes from it.

## Scope

| Item | Feature                                                                                                    |
| ---- | ---------------------------------------------------------------------------------------------------------- |
| V1   | A Releases page: the current version, what's new, and every release's notes; a "New" dot after an update   |
| V13  | Backups: download one after a publish, a reminder when the last is old, a copy in the browser, and restore |
| V3   | Going back to an earlier publish, with the owner's warning and a "Download a backup first" button          |
| V2   | A safety copy, in the browser, of changes that couldn't be saved, offered back on return                   |

## Acceptance criteria for this release

- [ ] Given a new release, when the owner opens the admin area, then a "New" dot shows until they open the Releases page, which
      lists every release's notes, newest first, from `CHANGELOG.md`.
- [ ] Given a publish, when it finishes, then the owner is offered a backup; given none for 14 days, then the dashboard and the
      review page say so.
- [ ] Given a backup, when it's made, then a file downloads and a copy is kept in this browser.
- [ ] Given a backup file or the browser copy, when the owner restores it, then its content becomes the draft, and Review &
      publish shows what will change before anything goes live.
- [ ] Given a file that isn't a Taal Yatra backup, or is damaged, when restored, then nothing changes and the owner is told why.
- [ ] Given any of the last 20 publishes, when the owner goes back to it, then they're warned that later publishes will be
      replaced and are hard to recover without a backup on this device, and offered one first.
- [ ] Given a change that couldn't be saved (offline or a failed save), when the owner returns to that tab, then they're
      offered the unsaved changes kept on this device, or can throw them away.
- [ ] Given the public pages, when measured, then none of this code is in their download.

---

**Approval:** ☑ Approved as part of the 0014 programme by Ravi Akhouri on 2026-11-17. The details are decided with the
[design](02-design.md).
