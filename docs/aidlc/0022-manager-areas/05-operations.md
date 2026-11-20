# 05 · Operations — The owner's areas for chosen managers (2.3.0)

- **Version:** 2.3.0, merged by the owner on 2026-11-21. `npm run release:minor` → `chore(release): v2.3.0`, tag `v2.3.0`.
- **CHANGELOG entry:** ☑ `## [2.3.0] - 2026-11-21`.
- **Deploy notes:**
  - **Site:** deploys with the merge.
  - **Rules:** ☐ the owner deploys them at once (`npm run deploy:rules`): the app signs every lead status change, which the
    2.2.0 rules refuse, so marking a lead fails until they're live.
  - **Data, seed, dependencies:** none. Existing roles have no `areas`, which means none.
- **First use:** on Team access, **Change** a manager and turn on the areas they need; they see them on their next click.
- **Monitoring:** a lead's card says who last changed it; the publish history says who went back.
- **Rollback:** redeploy tag `v2.2.0`. The 2.3.0 rules can stay: they still accept the owner's signed changes, and a
  role's `areas` is then unused. Rolling the rules back to 2.2.0's makes signed lead changes fail.

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-21.
