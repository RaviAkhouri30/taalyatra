# 01 · Inception — The owner's areas for chosen managers (2.3.0)

From the [version 2 programme](../0014-version-2/01-inception.md): V22, added by the owner on 2026-11-20. The first of the
three manager releases (V22 → V20 → V21); the super manager (V21) will build on these switches.

## Problem / goal

Since 2.0.0 a manager edits the pages the owner gives them, but some areas are always the owner's (0019 decision 6):
Leads, Visits and the speed report, Backups, and Going back to an earlier publish. A trusted manager who answers enquiries,
or keeps the site backed up while the owner is away, can't. The owner wants to give each of these areas to a manager
separately, on Team access, with the rules enforcing each switch as they already do for uploads.

## User stories

- **As the owner, I want to give a manager the Leads**, so they can follow up enquiries, knowing it shows customers'
  names, phone numbers and emails.
- **As the owner, I want to give a manager Visits and the speed report**, so they can see how the site is doing.
- **As the owner, I want to give a manager Backups**, so the site is backed up when I'm away.
- **As the owner, I want to give a manager Going back**, so they can undo a bad publish on their own pages.
- **As a manager given an area, I want it in my menu, my dashboard and my tour**, as it is for the owner.
- **As the owner, I want to see who changed a lead**, as the history shows who published.

## Acceptance criteria

- [ ] Given Team access, then each manager has four switches below their page settings, **Leads**, **Visits and speed**,
      **Backups** and **Going back**, each with one line on what it allows; Leads says it shows customers' personal
      details. All are off for every manager, existing ones too, until the owner turns them on.
- [ ] Given a switch on, then that area is in the manager's menu, dashboard, tour and Features page; given it off, then
      it isn't, and the rules refuse its reads and writes.
- [ ] Given **Leads**, then the manager sees the leads and changes their status, and the lead records who changed it;
      deleting a lead stays the owner's.
- [ ] Given **Visits and speed**, then the manager sees the Visits page and the speed report, and their visit adds up past
      days as the owner's does.
- [ ] Given **Backups**, then the manager downloads a backup and sees the reminder; a backup includes the leads only when
      they also have Leads; restoring a backup stays the owner's.
- [ ] Given **Going back**, then the manager goes back to an earlier publish only when every page it changed is one they
      may publish; otherwise it says "Ask the owner".
- [ ] Given a switch turned off, then it takes effect at the manager's next request, as page settings do.
- [ ] Given the changes, then axe finds no WCAG 2.2 AA violations on Team access and each area for a manager, on all three
      sizes; the public site's first download is unchanged.

## Units of work

1. **Role:** four switches in `roles/{uid}` (`areas`), read into `Permissions`, all off when missing.
2. **Rules:** each area's collections check its switch (`proposals`, `visits`, `visitDays`, `vitals`, `adminState`,
   `publishes` for going back), with the limits above; `isValidRole` accepts the switches.
3. **Team access:** the switches, with their lines, below the page settings.
4. **The areas for a manager:** menu, dashboard cards, tour steps and Features rows follow `Permissions`; Leads records who
   changed a status; Going back checks the pages first; Backups leave the leads out without Leads.
5. Tests (unit, rules, e2e on three sizes with axe), records, CHANGELOG, release 2.3.0.

## Decisions for the owner

| #   | Decision                           | Recommendation                                                                                                                                                                                                              |
| --- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | **The switches**                   | **Four:** Leads; Visits and speed (both say how the site is doing, and neither identifies anyone); Backups; Going back. History stays visible to every manager, as now                                                      |
| D2  | **Leads: what a manager may do**   | **See them and change their status**, with their name on the change. **Deleting a lead stays yours**: it's how a customer's request to be forgotten is honoured                                                             |
| D3  | **Backups: what a manager may do** | **Download a backup**, which resets everyone's reminder. **Restoring stays yours**: it puts every page back as a draft, including pages the manager can't see                                                               |
| D4  | **Going back: how far**            | **Only a publish whose every page the manager may publish.** A publish that changed one of your pages, or one they need approval for, says "Ask the owner". (V20's manager who can approve, next release, could go further) |
| D5  | **Who changed a lead**             | **Record it** (`statusBy`, their email) and show it on the lead's card: "Contacted by priya@…, 21 Nov". Your own changes show "by you"                                                                                      |
| D6  | **Defaults**                       | **All off**, for existing and new managers: nothing they can do changes until you turn a switch on                                                                                                                          |

Team access and your own account stay yours alone; deleting photos and the approval queue are for V20 and V21.

## Risks & open questions

- **Leads hold personal data.** Mitigation: off by default, the switch says so, every status change names who made it,
  and the rules enforce it, not only the menu.
- **Rules size:** each switch is one more lookup of the manager's role; the rules already read it once per request and
  reuse it (as `publishableConfigKeys` does). The rules tests include a manager with every switch on.
- **Visits' adding-up writes:** a manager's visit must add up past days as the owner's does, or the counts pile up; the
  rules allow it only with the switch.
- **Rules and data change:** `npm run test:rules` and `npm run e2e:firebase` are needed, and the owner deploys the rules
  with the release.

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-21, with D1–D6 as recommended.
