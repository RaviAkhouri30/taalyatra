# 01 · Inception — Visits and leads (1.13.0)

The third release of the [version 2 programme](../0014-version-2/01-inception.md), which holds the problem, user stories and
acceptance criteria. This file only records what 1.13.0 takes from it.

## Scope

| Item | Feature                                                                                                            |
| ---- | ------------------------------------------------------------------------------------------------------------------ |
| V11  | An anonymous visit counter, and graphs of visits and of proposals by day, week, month and year                     |
| V12  | A Leads page: every proposal, with filters, a status (new, contacted, won, lost), CSV export and delete; no AI yet |
| D6   | Backups (0016) get an "Include leads" tick box                                                                     |

The AI analysis of leads stays in 2.2.0 with the other AI work (programme decision D1).

## Acceptance criteria for this release

- [ ] Given a visit from a person, when the page has loaded, then one anonymous visit is counted for that day: no cookie, no
      id, nothing that identifies the visitor. Search robots, speed tools, test browsers, previews and "do not track"
      browsers aren't counted.
- [ ] Given the public pages, when measured, then the first download stays within its 500 kB budget, and counting starts only
      after the page has loaded.
- [ ] Given visits since counting began, when the owner opens Visits, then they see visits per day, week, month and year, and
      proposals the same way.
- [ ] Given proposals, when the owner opens Leads, then they see every proposal, newest first, can filter it, mark its status,
      export what they see as a CSV file, and delete one after a warning.
- [ ] Given a new proposal, when the owner opens the admin area, then the menu and the dashboard show how many are new.
- [ ] Given a backup, when the owner ticks "Include leads", then the file holds the leads too, and is told to keep it safe.
- [ ] Given anyone but the admin, then the rules refuse reading, changing or deleting leads and visit counts, and visitors can
      only add a well-formed visit or proposal.

---

**Approval:** ☑ Approved as part of the 0014 programme by Ravi Akhouri on 2026-11-17. The details are decided with the
[design](02-design.md).
