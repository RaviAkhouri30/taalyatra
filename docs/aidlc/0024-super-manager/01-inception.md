# 01 · Inception — A super manager (2.5.0)

From the [version 2 programme](../0014-version-2/01-inception.md): V21, added by the owner on 2026-11-20. The last of the
three manager releases (V22 → V20 → **V21**). It reuses V22's areas (2.3.0) and V20's approving (2.4.0) and extends them
to the approval queue, with an end date.

## Problem / goal

Only the owner answers the approval queue, so when they're away, managers' changes wait. V20 lets a trusted manager
approve **their own** changes, but no one can approve **someone else's**. The owner wants to make a manager a **super
manager**, permanently or **until a chosen date**, who answers the queue on their behalf and has powers close to theirs.
The access must end on that date even if nobody remembers to remove it, so the rules check the date on every request.
Every answer records who gave it.

## User stories

- **As the owner, I want to make a manager a super manager**, for good or until a date, so the queue keeps moving while
  I'm away.
- **As the owner, I want the access to end by itself** on that date, so I don't have to remember to remove it.
- **As a super manager, I want to approve or send back other managers' requests**, as the owner does, with my name on
  the answer.
- **As a super manager, I want to edit and publish every page and use every area**, so I can stand in for the owner.
- **As the owner, I want some things to stay mine alone**, so no one else can lock me out or hide what was done.
- **As the owner, I want to see what super managers did** in the history and on my dashboard.

## Acceptance criteria

- [ ] Given Team access, then each manager has a **Super manager** switch, off by default (existing managers too), with
      a choice of **For good** or **Until** a date, and one line on what it allows and what stays the owner's.
- [ ] Given a super manager, then they see and publish every page with no approval, use all four areas (Leads, Visits
      and speed, Backups, Going back) and see the approval queue as the owner does: **Approve** publishes the request,
      **Send back** returns it with a note.
- [ ] Given an answer from a super manager, then the request and the history name them ("Approved by priya@… for the
      owner"); the owner's dashboard counts the requests they answered since the owner last looked.
- [ ] Given the end date passes, then from the next request the rules treat them as an ordinary manager again, with the
      page settings and switches they had before; the admin drops their extra menu items without a reload. Team access
      shows "Super manager until 30 Nov" before and "Ended 30 Nov" after.
- [ ] Given the last three days before the end, then the super manager's dashboard says when it ends.
- [ ] Given a super manager, then the rules still refuse: Team access (any change to `roles`), deleting or trimming the
      publish history, and anything on the owner's own account.
- [ ] Given the changes, then axe finds no WCAG 2.2 AA violations on Team access, the dashboard and the queue for a super
      manager, on all three sizes; the public site's first download is unchanged.

## Units of work

1. **Role:** `super { since, until }` in `roles/{uid}` (`until` null for good), missing when off; `Permissions.isSuper`
   from it and the `CLOCK`, so the admin follows the end date as the rules do. A super manager's own page settings and
   switches stay stored, untouched, for when it ends.
2. **Rules:** `isSuper()` (a manager whose `super.until` is null or later than `request.time`) and `actsAsOwner()`
   (`isOwner() || isSuper()`), used wherever the owner is allowed today except the owner-only list (D1). `approvals`
   answers record `answeredBy`; `isValidRole` accepts `super`.
3. **Team access:** the switch, For good / Until (a date picker, today or later), the line on what it allows, and the
   "until" / "ended" status on each manager's card.
4. **Super manager's admin:** every page and area in the menu, dashboard, tour and Features page; the approval queue;
   the ending notice; the owner's dashboard count and the history's "for the owner".
5. Tests (unit, rules with a lapsed and a running date, e2e on three sizes with axe), records, CHANGELOG, release 2.5.0.

## Decisions for the owner

| #   | Decision                        | Recommendation                                                                                                                                                                                                                                                           |
| --- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D1  | **What stays yours alone**      | **Team access** (adding, changing or removing managers and super managers, themselves included), **your own account**, and **deleting or trimming the publish history**. These are the ones that could lock you out or hide what was done; the programme recommends them |
| D2  | **What a super manager can do** | **Everything else:** publish every page without approval, all four areas, answer the queue, delete photos, restore a backup and delete a lead. Each of these already names who did it, or leaves a draft you can see. If you'd rather keep any of them yours, say which  |
| D3  | **For good, or until a date**   | **Both**, as V21 says. "Until" ends at **the end of the chosen day, India time**, so "until 30 Nov" includes the 30th. The date can be changed or the switch turned off at any time, taking effect at their next request                                                 |
| D4  | **When it ends**                | **They go back to the manager they were**: their page settings, areas and Can approve stay stored and return as they were. Nothing is deleted, so making them super again later is one switch                                                                            |
| D5  | **How many**                    | **Any number of managers**, each with their own date. Team access lists who is a super manager at the top, so it's plain who can approve                                                                                                                                 |
| D6  | **Who answered**                | **Every answer records who gave it** (`answeredBy`, an email): your answers too, from 2.5.0. The request, the history and your dashboard show "for the owner"; the dashboard's History card counts their answers beside V20's self-approvals                             |
| D7  | **Their own changes**           | **Published directly**, like yours, and named in the history as theirs. Their own requests still waiting from before can be approved by them like anyone's                                                                                                               |
| D8  | **Telling them it's ending**    | **A notice on their dashboard from three days before** ("Your super manager access ends on 30 Nov"). No email: it would use the EmailJS allowance, as V20 D3 decided                                                                                                     |

## Risks & open questions

- **The biggest rules change so far.** Most `isOwner()` checks become `actsAsOwner()`, and each adds a read of the
  manager's role. Mitigation: the role is read once per request and reused, as V22's switches are; the rules tests cover a
  super manager on every collection, a lapsed one on every collection (refused as an ordinary manager), and each item in
  D1 (refused).
- **Locking the owner out.** A super manager must never change `roles` (their own end date included). Mitigation: the
  `roles` match keeps `isOwner()` only, and a rules test tries it.
- **Time.** The rules use the server's `request.time`; the admin uses the device's clock through `CLOCK`, so a device
  with a wrong clock may show menus the rules then refuse. The rules are what count; the admin shows their refusal as
  today.
- **History length.** Only your publishes trim the history to its limit; a long stretch of super-manager publishes lets
  it grow past it until your next publish. Mitigation: the trim runs on your next publish, as it does after a manager's.
- **"Can approve" vs "Super manager"** may read alike. Mitigation: Team access says plainly that Can approve covers their
  own changes, and Super manager covers everyone's, on your behalf.
- **Rules and data change:** `npm run test:rules` and `npm run e2e:firebase` are needed, and the owner deploys the rules
  with the release.

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-21, with D1–D8 as recommended.
