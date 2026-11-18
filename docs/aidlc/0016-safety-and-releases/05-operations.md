# 05 · Operations — Nothing lost, and what's new (1.12.0)

- **Version:** 1.12.0, released together with 1.13.0. PR #41 merged (`bf23b48`) but wasn't released before PR #42 merged,
  so both went live in the same update (2026-11-18, 15:47 UTC). The owner chose one release commit and tag, `v1.13.0`, with
  the 1.12.0 notes kept as their own section. See [0018's operations](../0018-visits-and-leads/05-operations.md).
- **CHANGELOG entry:** ☑ `## [1.12.0] - 2026-11-18`
- **Deploy notes:**
  - **Rules:** `npm run deploy:rules` adds the admin-only `adminState/backups` (when the last backup was made). Until then
    the reminder says "No backup yet"; nothing breaks.
  - **Data:** nothing to migrate.
  - **Dependencies:** none added.
- **Monitoring:** the dashboard's Backups card: it should say when the last backup was made, the same on every device.
- **Rollback:** redeploy tag `v1.11.0`. Backup files made in 1.12.0 stay valid and restore again once it's back.

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-19.
