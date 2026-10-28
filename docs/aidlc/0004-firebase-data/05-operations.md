# 05 · Operations — Firebase data

- **Version:** 1.2.0. Deployed when PR #4 merged (`c68b4e6`, 2026-10-28). `package.json` was
  bumped once, in 1.4.1; tag `v1.2.0` goes on `c68b4e6`.
- **CHANGELOG entry:** ☑ `## [1.2.0] - 2026-10-28`
- **Deploy notes:**
  - **Hosting:** Azure Static Web Apps, through GitHub Actions on push to `main`. CI runs the
    rules tests, builds, writes `runtime-config.js` from the six `FIREBASE_*` secrets, and
    deploys.
  - **Rules:** `npm run deploy:rules`, run by the owner (2026-10-28).
  - **Data:** `npm run seed:firestore -- <key> --yes` (2026-10-28; reseeded with the 1.3.0 and
    1.4.0 data).
  - **EmailJS:** still not configured, so proposals are stored in Firestore but not emailed.
- **Monitoring:**
  - Firebase console: Firestore usage (about 5 reads per home visit) and the rules monitor.
  - New proposals appear under `proposals` in the console.
  - Azure: Static Web Apps logs.
- **Rollback:** redeploy tag `v1.1.0` (bundled data, no Firestore). The Firestore data and rules
  can stay; 1.1.0 doesn't read them.

---

**Approval:** ☐ Pending
