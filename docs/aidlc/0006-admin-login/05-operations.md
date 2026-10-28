# 05 · Operations — Admin sign-in

- **Version:** 1.4.0. Deployed when PR #7 merged (`4f3277f`, 2026-10-28); tag `v1.4.0` goes on
  `4f3277f`.
- **Then 1.4.1** (`cad4b90` and the release commit): fixes for deep links and missing site-config
  fields.
- **CHANGELOG entries:** ☑ `## [1.4.0] - 2026-10-28` · ☑ `## [1.4.1] - 2026-10-29`
- **Deploy notes:**
  - The admin account is `5zsz2DlUaja2Ss7wbFTrpiMMROk2` (`environment.adminUid`).
  - Password resets are emailed from `taalyatra.in` and link back to `/admin/sign-in`.
  - No data writes are possible from the admin area yet; editors and admin write rules come next.
- **Monitoring:** Firebase console → Authentication (sign-ins, users). Keep self sign-up off.
- **Rollback:** redeploy tag `v1.3.0` (no admin area). Auth settings can stay.

---

**Approval:** ☐ Pending
