# 05 · Operations — The rest of the content (2.10.0, 2.11.0, 2.12.0)

## 2.10.0

- **Version:** 2.10.0, merged by the owner on 2026-11-22 (PR #66). ☑ `chore(release): v2.10.0`, tag `v2.10.0`,
  committed on main on 2026-11-23 (☐ tag pushed).
- **CHANGELOG entry:** ☑ `## [2.10.0] - 2026-11-22`.
- **Deploy notes:**
  - **Site:** deploys with the merge.
  - **Rules:** ☑ **deployed** by the owner on 2026-11-23 (`npm run deploy:rules`).
  - **Data, seed, dependencies:** none.
- **First use:** the six new pages in the menu (Our philosophy, Where we play, How it works, Instagram, Testimonials,
  FAQ); Hero and Who it's for have new cards.
- **Rollback:** redeploy tag `v2.9.1`. The rules can stay: they accept everything 2.9.1 writes.

## 2.11.0

- **Version:** 2.11.0, merged on 2026-11-23 (PR #67). ☑ `chore(release): v2.11.0`, tag `v2.11.0` (☐ tag pushed).
- **CHANGELOG entry:** ☑ `## [2.11.0] - 2026-11-22`.
- **Deploy notes:**
  - **Site:** deploys with the merge. The tab's title is now set by the site for every page, from the owner's text or
    the defaults.
  - **Rules:** ☑ **deployed** by the owner on 2026-11-23 (`npm run deploy:rules`).
  - **Data:** none needed; `site/config.seo` is created by the first save on Search and sharing.
- **First use:** Videos, Team and Shows have a page card at the end; Achievements under **Other pages**; **Search and
  sharing** under Settings.
- **Monitoring:** after publishing a title or description, check the page's tab and a shared link's preview (link
  previews may be cached by WhatsApp for a while).
- **Rollback:** redeploy tag `v2.10.0`. Its site ignores `seo` and shows the defaults; the rules can stay.

## 2.12.0

- **Version:** 2.12.0, merged on 2026-11-23 (PR #68). ☐ `npm run release:minor` on main →
  `chore(release): v2.12.0`, tag `v2.12.0`.
- **CHANGELOG entry:** ☑ `## [2.12.0] - 2026-11-23`.
- **Deploy notes:**
  - **Site:** deploys with the merge.
  - **Rules:** ☑ **deployed** by the owner on 2026-11-23 (`npm run deploy:rules`).
  - **Data, seed, dependencies:** none.
- **First use:** **Chat assistant** under Settings; **Proposal form** has five new cards.
- **What to expect:** renaming a form choice leaves old leads with the old words; both can show in Leads' filters.
- **Rollback:** redeploy tag `v2.11.0`; the rules can stay.

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-23.
