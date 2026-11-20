# 01 · Inception — A manager who can approve (2.4.0)

From the [version 2 programme](../0014-version-2/01-inception.md): V20, added by the owner on 2026-11-20. The second of
the three manager releases (V22 → **V20** → V21); the super manager (V21) will extend it to other managers' requests.

## Problem / goal

A manager's page is either **Needs approval** (every change waits for the owner) or **Can publish** (it goes live with
no record of why). The owner wants a middle way for a trusted manager: their changes still go through an approval step,
but they give it themselves, saying what they changed and why, so the change goes live at once and the owner can read
afterwards who approved what.

## User stories

- **As the owner, I want to mark a manager "Can approve"**, so their changes on pages that need approval don't wait for
  me.
- **As that manager, I want to approve my own changes** with a short title and description, so they go live now and the
  owner knows what I did.
- **As the owner, I want to see each self-approval** in the history and on my dashboard, with its title, description
  and who, and go back over it if I disagree.

## Acceptance criteria

- [ ] Given Team access, then each manager has a **Can approve their own changes** switch, off by default (existing
      managers too), with one line on what it allows.
- [ ] Given a manager with it, then on Review & publish their changes on **Needs approval** pages offer **Approve and
      publish** instead of **Send for approval**; a dialog asks for an optional title and description; confirming
      publishes at once. Pages set to **Can publish** publish as before; **Hidden** pages stay hidden.
- [ ] Given a self-approval, then the publish history shows it as "self-approved by priya@…", with the title and
      description; the owner's dashboard counts the self-approvals since they last looked.
- [ ] Given a manager's request already waiting, then a manager with the switch may approve it themselves the same way.
- [ ] Given the switch off, or a manager without it, then the rules refuse their live writes to **Needs approval** pages,
      as now; given it on, then the rules accept them only together with the self-approval's record.
- [ ] Given the changes, then axe finds no WCAG 2.2 AA violations on Review & publish, the dialog and Team access, on all
      three sizes; the public site's first download is unchanged.

## Units of work

1. **Role:** `canApprove` in `roles/{uid}`, off when missing; `Permissions.canApproveOwn`; Team access's switch.
2. **Plan:** Review & publish's plan gains "approve yourself" for a manager with the switch: the dialog, then one commit
   with the live writes and a history record carrying `selfApproval { title, note }`.
3. **Rules:** live writes to a **Needs approval** page allowed for a manager with `canApprove`, only in a commit that
   also writes their self-approval record (checked with `getAfter`, so the record can't be skipped).
4. **The owner's view:** history entries and the dashboard's count of self-approvals since last seen.
5. Tests (unit, rules, e2e on three sizes with axe), records, CHANGELOG, release 2.4.0.

## Decisions for the owner

| #   | Decision                      | Recommendation                                                                                                                                                                                                                       |
| --- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D1  | **One switch, or per page**   | **One switch per manager**, "Can approve their own changes", for every page set to Needs approval. Per page it would be a fourth setting beside Hidden, Needs approval and Can publish, harder to read                               |
| D2  | **The title and description** | **Both optional**, as V20 says; an empty title shows as "Self-approved". Title up to 80 characters, description up to 500, like the approval note                                                                                    |
| D3  | **Telling the owner**         | **The dashboard's History card counts self-approvals since you last looked** ("2 changes self-approved since you last looked"), and each history entry shows its title and description. No email: it would use the EmailJS allowance |
| D4  | **Requests already waiting**  | **The manager may approve their own waiting request** the same way, with its note as the description to start from                                                                                                                   |
| D5  | **Enforced by the rules**     | **Yes:** a self-approved publish must write its record in the same commit, so the history can't miss one. A manager with the switch can't publish a Needs approval page without leaving a record                                     |

Approving other managers' requests is V21 (2.5.0); going back over a self-approved publish follows the Going back
switch (2.3.0), and the owner can always go back.

## Risks & open questions

- **Rules complexity:** a live write must find the commit's history record (`getAfter`) and check it names that page and
  carries `selfApproval`. Each check is one more document lookup; the rules tests include a large self-approved publish
  within the lookup limits, as 2.0.0's do.
- **"Can publish" vs "Can approve"** may read alike. Mitigation: Team access says plainly that Can publish goes live
  with no record, and Can approve goes live with the manager's own approval recorded.
- **Rules and data change:** `npm run test:rules` and `npm run e2e:firebase` are needed, and the owner deploys the rules
  with the release.

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-21, with D1–D5 as recommended; the owner asked to go on and implement as planned.
