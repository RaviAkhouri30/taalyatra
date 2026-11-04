# 05 · Operations — Real-phone speed reports (1.8.0)

- **Version:** 1.8.0. Deployed when PR #28 merged (`55d4a1d`, 2026-11-05). Tag `v1.8.0` is on the release commit. The plan moves
  along: remaining content becomes 1.9.0, and proposals and account become 1.10.0.
- **CHANGELOG entry:** ☑ `## [1.8.0] - 2026-11-05`
- **Deploy notes:**
  - **Rules:** the owner deployed them just before the merge, in the right order this time.
  - **Backup:** `backups/firestore-2026-11-04.json` was written just before the rules (git-ignored).
  - **Settings and seed:** none needed.
- **Monitoring:**
  - **Real visitors' speed** on the admin dashboard.
  - Firestore's usage page shows writes against the free plan's daily limit. A sudden jump in `vitals` writes means fake reports.
  - **Running Lighthouse or PageSpeed on the live site adds reports,** until automated visits are filtered out.
- **Rollback:**
  - **The release:** redeploy tag `v1.7.1`. It doesn't read `vitals`, so the stored reports just sit unused.
  - **Only the reports:** set `reportVitals: false` in `environment.ts` and deploy. The rules can stay.
  - **The data:** delete the `vitals` collection in the Firebase console. Nothing else depends on it.

---

**Approval:** ☐ Pending
