# 05 · Operations — A super manager (2.5.0)

- **Version:** 2.5.0, merged by the owner on 2026-11-21 (PR #60). `npm run release:minor` → `chore(release): v2.5.0`
  (`e8016c4`), tag `v2.5.0`, run by the owner.
- **CHANGELOG entry:** ☑ `## [2.5.0] - 2026-11-21`.
- **Deploy notes:**
  - **Site:** deploys with the merge.
  - **Rules:** ☑ deployed by the owner on 2026-11-21 (`npm run deploy:rules`), with 2.4.0's. The owner's queue answers
    now carry their email, so an admin tab still open on 2.4.0 had its answers refused until reloaded.
  - **Data, seed, dependencies:** none. Existing roles have no `superManager`, which means off.
- **First use:** on Team access, **Change** a manager, turn on **Super manager**, and choose **For good** or a last day.
- **Monitoring:** the history reads "approved by … for the owner, sent by …"; the dashboard counts the requests a super
  manager answered since you last looked. Team access shows "Super manager until …" and "Ended …".
- **Rollback:** redeploy tag `v2.4.0` **and its rules** (`git checkout v2.4.0 -- firestore.rules`, then
  `npm run deploy:rules`): the 2.5.0 rules expect the owner's answers to carry an email the 2.4.0 app doesn't send.
  Turn off any super manager first, so nobody is left with access the old app can't show.

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-22.
