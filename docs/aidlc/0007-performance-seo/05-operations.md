# 05 · Operations — Performance & SEO

- **Version:** 1.5.0. Deployed when PR #11 merged (`5a996f8`, 2026-10-29). PR #12 (`64c1165`,
  2026-10-30) added the record of the rules and smoke suite runs; tag `v1.5.0` goes on `64c1165`.
- **Late tag:** the version bump was missed at the time, so `package.json` on that commit still says
  1.4.1. `package.json` moved straight to 1.6.0 in the 1.6.0 release (the same happened with `v1.4.0`).
- **CHANGELOG entry:** ☑ `## [1.5.0] - 2026-10-30`
- **Deploy notes:**
  - The seed ran on 2026-10-30 and wrote 56 documents, deleting none. It was needed because the
    data now points at the `.webp` photos.
  - The JPEGs stay in the build, so the older data kept working until the seed ran.
- **Monitoring:** run Lighthouse on the live home page after each release, and compare with
  [04-verification.md](04-verification.md).
- **Rollback:** redeploy tag `v1.4.1`, then seed from that tag. The `v1.4.1` build has no `.webp`
  photos, so it can't use the current data. Take a backup first with `npm run export:firestore`:
  that seed replaces every document, including anything the owner has published since.

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-05.
