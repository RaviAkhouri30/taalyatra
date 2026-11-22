# 05 · Operations — A manager who can approve (2.4.0)

- **Version:** 2.4.0. `chore(release): v2.4.0` (`d118f73`), tag `v2.4.0`; merged by the owner on 2026-11-21 (PR #59).
- **CHANGELOG entry:** ☑ `## [2.4.0] - 2026-11-21`.
- **Deploy notes:**
  - **Site:** deploys with the merge.
  - **Rules:** ☑ deployed by the owner on 2026-11-21, together with 2.5.0's (`npm run deploy:rules`). Until then a
    manager's self-approval was refused.
  - **Data, seed, dependencies:** none. Existing roles have no `canApprove`, which means off.
- **First use:** on Team access, **Change** a manager and turn on **Can approve their own changes**.
- **Monitoring:** the publish history marks each self-approval with who, the title and the description; the
  dashboard's History card counts them since you last looked.
- **Rollback:** redeploy tag `v2.3.0`. The 2.4.0 rules can stay: they still accept every 2.3.0 write, and the
  self-approval markers are then unused.

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-22.
