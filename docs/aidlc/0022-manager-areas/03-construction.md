# 03 · Construction — The owner's areas for chosen managers (2.3.0)

Built on the approved [design](02-design.md) (decisions 1–3); [ADR-0018](../../architecture/adr/0018-roles-and-approvals.md)
gains its 2.3.0 section.

| #   | Increment            | Files                                                                                                                                                                                                                                                                                                            | Tests                                                                                                                                                   |
| --- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | The role             | `models/manager-area.enum.ts`; `role.model.ts` (`areas`, read from explicit `true`s only); `permissions.model.ts` (`canUse`, `canPublishPath`); `team-access.model.ts` (`AREA_ROWS`, `areasText`); `forms/role-form.ts`                                                                                          | `role.model.spec.ts`, `role-form.spec.ts`, `manager-areas.spec.ts`                                                                                      |
| 2   | Rules                | `firestore.rules`: `canUseArea`; `proposals`, `visits`, `visitDays`, `vitals`, `adminState` by area; a lead's change signed with the signer's email; `isValidRole` accepts `areas`                                                                                                                               | `firestore-manager-areas.rules.spec.ts` (16); `firestore-leads.rules.spec.ts` (signing); 285 in all                                                     |
| 3   | The areas in the app | menu links with an `area`, `guards/area.guard.ts` on Leads and Visits; the dashboard's cards and reads by area; the top bar's lead count; Review & publish (the backup panel by area, Restore and "Include leads" by role, going back per entry, `canGoBackOver`); the tour's "Given to you" step; Features rows | `access.guards.spec.ts`, `dashboard.view-model.spec.ts`, `backup-panel.component.spec.ts`, `publish-history.component.spec.ts`, `manager-areas.spec.ts` |
| 4   | Leads signed         | `lead.model.ts` (`statusBy`, `statusAt`, `statusLine`), `LeadsService.setStatus(…, by)`, the Leads page (`me`, `canRemove`), the lead card's line                                                                                                                                                                | `lead.model.spec.ts`, `leads.service.spec.ts`, `lead-card.component.spec.ts`                                                                            |
| 5   | Team access          | the four switches with their lines (decision 1), "Your areas" on each manager's card                                                                                                                                                                                                                             | `manager-form.component.spec.ts`, `manager-card.component.spec.ts`                                                                                      |
| 6   | Tests and records    | `e2e/specs/admin-manager-areas.e2e.ts`; `e2e/fixtures/visitor-data.ts` (the sample leads and visits, shared with `admin-visitors.e2e.ts`); ADR-0018's 2.3.0 section, the data model                                                                                                                              | three sizes: a manager with Leads and Visits, signed lead changes, Backups without Restore, axe on Team access, Leads and Visits                        |

## Decisions & deviations from design

- **`areas` is optional in `IRole`**, as it is in a stored role: missing means none. So roles built before 2.3.0, in the
  data and in twenty specs, need no change.
- **Going back saves drafts**, as it always has, so a manager's going back then goes through their usual Publish (or
  approval). The design's rule, every changed page one they may publish, still decides whether it's offered, and covers
  every publish from that one to the newest, since going back replaces them all.
- **The tour's areas step points at the first area link in the menu**, Visits for the owner (it was Leads); for a
  manager with only Backups or Going back, which have no menu link, it shows on its own.
- **"Make a backup"** is the dashboard link's wording for a manager, who can't restore.
- **The form's heading is "Your areas"**, as the owner reads Team access; the design called them the owner's areas.
- **Axe in the new e2e waits for transitions to end** before scanning: a button just clicked was caught half-way
  through its hover colours (1.09:1 and 3.83:1), which isn't how it shows once settled.
- **`admin-team-access.e2e.ts` names the uploads switch** it unticks: the form now has five switches.
- **No dependency added.** The public site's first download is unchanged (507.39 kB).

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-21.
