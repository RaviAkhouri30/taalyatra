# 03 · Construction — Visits and leads (1.13.0)

| #   | Increment        | Files                                                                                                                                                                                                                                                                | Tests                                                                                                                                  |
| --- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Rules            | `firestore.rules` (`visits`, `visitDays`, admin access to `proposals`)                                                                                                                                                                                               | `tests/rules/firestore-leads.rules.spec.ts` (32 new, 189 in all)                                                                       |
| 2   | Visit counter    | `core/backends/browser/visitor.ts`, `browser-visit-source.ts`, `browser-after-load.ts`, `after-load-loader.token.ts` (was `vitals-source-loader`), `browser-vitals-reporter.ts`, `i-vitals-reporter.ts`, `shared/constants/visit.constants.ts`, `ApiEndpoint.Visits` | `visitor.spec.ts`, `browser-visit-source.spec.ts`, `browser-after-load.spec.ts`, `browser-vitals-reporter.spec.ts`, Firebase smoke     |
| 3   | Visits page      | `models/site-days.ts`, `visit-days.ts`, `chart.ts`, `visits-page.model.ts`, `services/visits.service.ts`, `view-models/visits-page.view-model.ts`, `components/bar-chart/*`, `components/visits-page/*`                                                              | their specs, `admin-visitors.e2e.ts`, Firebase smoke                                                                                   |
| 4   | Leads page       | `models/lead.model.ts`, `leads-page.model.ts`, `forms/lead-filter-form.ts`, `services/leads.service.ts`, `view-models/leads-page.view-model.ts`, `components/lead-card/*`, `lead-filters/*`, `leads-page/*`                                                          | their specs, `admin-visitors.e2e.ts`, Firebase smoke                                                                                   |
| 5   | Menu, dashboard  | `editor-nav.constants.ts` (`NavBadge`, Visitors group), editor layout (new-leads count, marks the owner's browser), dashboard (Leads and Visits cards)                                                                                                               | `editor-layout.component.spec.ts`, `dashboard.*.spec.ts`, `admin-visitors.e2e.ts`                                                      |
| 6   | Leads in backups | `backup-file.ts` (`proposals/*` paths), `backup.service.ts` (`make(withLeads)`), `backup-download.ts`, backup panel (tick box)                                                                                                                                       | `backup-file.spec.ts`, `backup.service.spec.ts`, `backup-download.spec.ts`, `backup-panel.view-model.spec.ts`, `admin-visitors.e2e.ts` |

## Decisions & deviations from design

- **The menu group is "Visitors", not "Business":** Settings already has "Business details", and two "Business" labels
  read as one.
- **Icons are reused** (an up-right arrow for Visits, the briefcase for Leads): the icon list ships with the public site's
  first download, which has about 0.4 kB to spare; two new icons would have taken most of it.
- **A bar's number shows on hover; on phones it's in the table under each graph** ("See the numbers"), not on tap. The
  table also serves keyboards and screen readers, and needs no tap handling on drawn shapes.
- **A status change writes the lead back whole, exactly as read, plus the status and its time.** The rules accept a
  change to `status` and `statusAt` only, so nothing a visitor sent can be altered. That avoids a new "update" write in
  the document port; the Firebase smoke test proves it passes the real rules.
- **A visit is counted about three seconds after the page loads**, the speed reports' existing wait, so it can't slow the
  page. Someone who leaves sooner isn't counted (as the design says).
- **A lead's arrival time is saved as a readable date in a backup**, not Firestore's seconds.
- **The Visits page and the dashboard read every day's total** (about 365 reads a year), well inside the free plan. If that
  ever matters, days can be grouped into one document per month.
- **The e2e sample leads and visits are added by the test**, not to `fake-db.json`: the seed script copies that file into
  the live database, and sample customers mustn't land there.
- **The speed report smoke test now waits for the speed report's own write**, since the visit is written first.

## Own walkthrough before review

- On a phone, the graph's last label ran off the card and the last two ran into each other: labels now sit under their
  bars, the first and last lean inwards, and a graph shows at most six.
- The search box sat higher than the lists beside it, and "Show all" stretched across a column: same height for all, and
  the button keeps its own width.

## Screenshots for approval

In [`screenshots/`](screenshots/): the dashboard with its Leads and Visits cards, Visits by day and by month, Leads with
a filter and the remove warning, the backups card with "Include leads", and Leads and Visits on a phone. The dashboard's e2e
screenshot baselines change with the two new cards; they are re-recorded only after the owner approves the look.

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-18.
