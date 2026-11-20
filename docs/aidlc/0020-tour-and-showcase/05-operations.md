# 05 · Operations — Guided tour and features showcase (2.1.0)

- **Version:** 2.1.0, merged by the owner on 2026-11-20 (PR #55, `45c4258`). `npm run release:minor` →
  `chore(release): v2.1.0`, tag `v2.1.0`.
- **CHANGELOG entry:** ☑ `## [2.1.0] - 2026-11-20`.
- **Deploy notes:**
  - **Site:** deploys with the merge, as every release. Admin area only; the public site is unchanged.
  - **Rules, data, seed, settings:** none. The tour remembers its answer in each browser (`taal-yatra.tour.seen.<account>`),
    nothing is stored in Firestore.
  - **Dependencies:** none added.
- **First use:** each account sees the offer once per browser. The manager sees it on their first sign-in after the
  release; it can be replayed from **Help → Take the tour**. Changing the tour's steps later and raising `TOUR_VERSION`
  offers it once more.
- **Monitoring:** nothing new to watch: no new reads or writes.
- **Rollback:** redeploy tag `v2.0.2`. Nothing stored changes; the remembered answers stay in browsers, unused.

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-20.
