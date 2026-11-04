# 05 · Operations — Editor foundation (1.6.0)

- **Version:** 1.6.0. Deployed when PR #15 merged (`054fb2b`, 2026-10-31). Tag `v1.6.0` goes on the
  release commit. 1.7.0 to 1.9.0 are planned; each gets its own design approval.
- **CHANGELOG entry:** ☑ `## [1.6.0] - 2026-10-31`
- **Deploy notes:**
  - **Backup:** `backups/firestore-2026-10-31.json` (56 documents) is the state before the seed, and
    `backups/firestore-2026-11-01.json` (57 documents) the state after it. Both are git-ignored and
    leave out proposals.
  - **Rules:** the owner deployed them on 2026-11-01.
  - **Seed:** the owner ran it once with `--overwrite` on 2026-11-01. It only changed `site/config`
    (the offer's `live`, `startsOn`, `endsOn`), `site/visibility` (new) and `pages/admin` (welcome
    text); the other 54 documents already matched. **Don't use `--overwrite` again now that the owner
    can publish:** it would replace their edits.
  - **Order, for next time:** merging to `main` deploys the app, so rules with new write paths must
    go out **before** the merge. This time the app went live more than a day before the rules. `/admin`
    couldn't save drafts or publish during that gap. The public site wasn't affected, because a
    missing `site/visibility` counts as everything on.
- **Monitoring:**
  - The dashboard at `/admin` shows unpublished changes, offer status, hidden items, the last publish
    and leftover placeholders.
  - `publishes` in Firestore holds the latest 20 publishes.
  - Run Lighthouse on the live home page after each release, on an idle machine (see
    [04-verification.md](04-verification.md)).
- **Rollback:**
  - **One bad edit:** undo that publish on the Review & publish page, then publish again.
  - **The release:** redeploy tag `v1.5.0`. The rules, `site/visibility` and the new offer fields can
    stay: a `v1.5.0` build ran against this data in the performance comparison. Anything switched off
    comes back, and offer dates stop applying.
  - **The data:** there's no restore script yet. `export:firestore` files are restored by hand.

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-05.
