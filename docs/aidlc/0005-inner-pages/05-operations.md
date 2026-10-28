# 05 · Operations — Inner pages

- **Version:** 1.3.0. Deployed when PR #5 merged (`d95679e`, 2026-10-28); tag `v1.3.0` goes on
  `d95679e`.
- **CHANGELOG entry:** ☑ `## [1.3.0] - 2026-10-28`
- **Deploy notes:**
  - Rules adding `pages/*` and `showFormats/*` reads were deployed by the owner.
  - The seed ran 2026-10-28 (56 documents). It restored the phone display text and added labels,
    credit, page copy and the show formats.
  - Until that seed ran, newer code against older data blanked the footer. 1.4.1 makes the site
    tolerate missing optional fields.
- **Content:** placeholders (`[NAME]`, `[YEAR]`…) and the show illustrations are in Firestore.
  Replace them in the console, or in `fake-db.json` and then re-seed (a re-seed overwrites
  console edits).
- **Monitoring:** as 0004.
- **Rollback:** redeploy tag `v1.2.0`. Its home Shows section expects `home/shows.formats`, which
  the 1.3.0 seed removed, so restore that field or accept an empty Shows section.

---

**Approval:** ☐ Pending
