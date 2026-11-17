# 05 · Operations — Site and editor polish (1.10.0)

- **Version:** 1.10.0. Deployed when PR #35 merged (`41f2bf2`, 2026-11-17). The release commit and tag `v1.10.0` are made by
  the owner (CLAUDE.md §13), with `npm run release:minor`.
- **CHANGELOG entry:** ☑ `## [1.10.0] - 2026-11-18`
- **Deploy notes:**
  - **Rules:** the owner deployed them before the merge (the `folded` map in `site/visibility`).
  - **New dependency:** `@angular/cdk` 22.2.3, exact, editor only.
  - **Seed:** none needed. `site/visibility` has no `folded` map yet, so the defaults apply until the owner saves Sections &
    pages; saving stores the defaults explicitly.
- **Monitoring:** the home page's length on phones (folded sections), and the owner's first reorder and drum circle picture.
- **Rollback:**
  - **The release:** redeploy tag `v1.9.0`. The rules can stay: they only add an optional `folded` map, which 1.9.0 ignores.
  - **Only folding:** in Sections & pages, set every section to "Never folded" and publish.
  - **Only the drum circle layout:** no data changed (the stored gallery is still a list), so 1.9.0's layout can come back with
    the code alone.

---

**Approval:** ☐ Pending
