# 05 · Operations — An admin anyone can use (1.11.0)

- **Version:** 1.11.0. Deployed when PR #38 merged (`7805915`, 2026-11-18; live from 04:39 UTC). PR #37 (click-to-edit in the
  preview, the drum circle's own tab) merged just before and ships in the same release. The release commit and tag `v1.11.0`
  are made by the owner (CLAUDE.md §13), with `npm run release:minor`.
- **CHANGELOG entry:** ☑ `## [1.11.0] - 2026-11-18`
- **Deploy notes:**
  - **Rules:** unchanged; nothing to deploy.
  - **Data:** unchanged. Tabs are routes and cards are schema only, so the stored documents are read and written exactly as in
    1.10.0. No seed.
  - **Dependencies:** none added.
  - **Old links:** `/admin/content` redirects to `/admin/hero`, so bookmarks from 1.10.0 still open the editor.
- **Monitoring:** the owner's first sessions with the new menu and Find: anything they search for and don't find goes into
  Find's everyday words; the "Still to fill in" count on the dashboard (54 at release) should fall as the sample text is
  replaced.
- **Rollback:** redeploy tag `v1.10.0`. Nothing in the data or rules changed, so the code alone goes back; drafts saved in
  1.11.0 open unchanged in 1.10.0's editor.

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-18.
