# 05 · Operations — More themes, and your own saved (2.9.0, 2.9.1)

## 2.9.0

- **Version:** 2.9.0, merged by the owner on 2026-11-22 (PR #64). ☐ `npm run release:minor` on main →
  `chore(release): v2.9.0`, tag `v2.9.0` (main is at 2.8.0).
- **CHANGELOG entry:** ☑ `## [2.9.0] - 2026-11-22`.
- **Deploy notes:**
  - **Site:** deploys with the merge.
  - **Rules:** ☐ **deploy at once** (`npm run deploy:rules`). Until then, publishing one of the 12 new themes is refused,
    and saving a theme fails.
  - **Data, seed, dependencies:** none. `savedThemes` starts empty.
- **First use:** Theme page → choose a theme or adjust one → **Save as my theme** with a name; it's listed under **Your
  themes** to choose again.
- **Monitoring:** none new. A failed save says so on the page.
- **Rollback:** redeploy tag `v2.8.0`. The 2.9.0 rules can stay: they accept everything 2.8.0 writes. But 2.8.0's site
  knows only the four old theme names and shows today's look for any other, so if one of the 12 new themes is
  published, first publish one of the old four (or Reset).

## 2.9.1

- **Version:** 2.9.1, a patch. ☐ after merging, `npm run release:patch` on main → `chore(release): v2.9.1`, tag
  `v2.9.1` (after 2.9.0's release commit).
- **CHANGELOG entry:** ☑ `## [2.9.1] - 2026-11-22`.
- **Deploy notes:** the site, with the merge. No rules, data or dependency change.
- **What to expect:** a theme already published stays on the site. If its contact note is hard to read, the Theme page
  now says so, and Publish waits until the second accent is changed.
- **Rollback:** redeploy tag `v2.9.0`.

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-22.
