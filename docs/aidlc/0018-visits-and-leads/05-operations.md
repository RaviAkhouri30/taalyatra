# 05 · Operations — Visits and leads (1.13.0)

- **Version:** 1.13.0. Deployed when PR #42 merged (`cda3710`, 2026-11-18; live from 15:47 UTC), in the same update as
  1.12.0 (PR #41). The owner chose one release commit for both: `npm version 1.13.0 -m "chore(release): v%s"`, tag
  `v1.13.0`, with separate 1.12.0 and 1.13.0 notes in the CHANGELOG. There is no `v1.12.0` tag.
- **CHANGELOG entry:** ☑ `## [1.13.0] - 2026-11-18` (and `## [1.12.0] - 2026-11-18`, noting they went live together)
- **Deploy notes:**
  - **Rules:** `npm run deploy:rules` adds `visits`, `visitDays`, and the admin's read, status change and delete on
    `proposals` (plus 1.12.0's `adminState/backups`). Without them the Leads page can't read and visits can't be tidied;
    visitors' visits are refused until then, silently.
  - **Data:** nothing to migrate. Proposals from before have no status and show as New. No seed.
  - **Dependencies:** none added.
  - **Privacy page:** should now say visits are counted anonymously (the owner's wording, on their list).
- **Monitoring:** the Visits page in the first days: a day's total should appear the morning after (India time), and
  `visits` should hold only today's single visits. The Firestore usage page: about one write per visit, plus the admin's
  reads (about 365 a year per opening of Visits or the dashboard).
- **Rollback:** redeploy tag `v1.11.0`. The rules can stay: they only add access. Counted days stay stored and show again
  when 1.13.0 returns; statuses set on leads stay on the documents and are ignored by 1.11.0.

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-19.
