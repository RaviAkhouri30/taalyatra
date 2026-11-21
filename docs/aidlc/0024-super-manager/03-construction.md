# 03 · Construction — A super manager (2.5.0)

Built on the approved [inception](01-inception.md) (D1–D8) and [design](02-design.md);
[ADR-0018](../../architecture/adr/0018-roles-and-approvals.md) gains its 2.5.0 section.

| #   | Increment               | Files                                                                                                                                                                                                                                                                        | Tests                                                                                                                                                                                                                   |
| --- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Role and permissions    | `models/super-manager.ts` (the entry, the end of a day in India, `isSuperActive`), `INDIA_UTC_OFFSET_MINUTES`, `role.model.ts` (`superManager`), `Permissions.isSuper`, `actsAsOwner`, `superEndsAt`, `manager(user, role, now)`                                             | `super-manager.spec.ts`, `role.model.spec.ts`, `permissions.model.spec.ts`                                                                                                                                              |
| 2   | The end, without reload | `AccessService`: emits again at the end, waiting a day at a time (`SUPER_END_STEP_MS`)                                                                                                                                                                                       | `access.service.spec.ts` (fake timers: a near end, a 40-day end, for good)                                                                                                                                              |
| 3   | The screens' checks     | `actsAsOwner` in the approvals panel, dashboard, menu badges, waiting notice, Review & publish (anyone's drafts, restore, go back, intro), review's live reads and emails, leads (delete), photos (replace, delete), tour texts. `isOwner` kept for Team access and trimming | the existing specs, plus the dashboard and permissions specs above                                                                                                                                                      |
| 4   | Rules                   | `firestore.rules`: `isSuper()`, `actsAsOwner()`, `isMomentOrNull`; every owner check but `roles` writes and history changes; `answeredBy` on answers; `isValidRole` accepts `superManager`                                                                                   | `firestore-super-manager.rules.spec.ts` (25): for good and before the end, allowed; after the end, refused; D1 refused; unsigned answers refused; a large publish; Team access storing it. Fixture signs in with emails |
| 5   | Answers and history     | `IApproval.answeredBy`, `ApprovalService` signs every answer; `IPublishRecord.forOwner`; "approved by … for the owner, sent by …"; the dashboard's count of both kinds (`unseenApprovals`, `unseenApprovalsText`); the request card names who answered                       | `approval.service.spec.ts`, `publish-page.model.spec.ts`, `self-approvals.spec.ts`, `approval-card.component.spec.ts`                                                                                                   |
| 6   | Team access             | `role-form.ts` (switch, For good / Until, last day), `superUntilValidator`, the form's fieldset, the card's "For good" / "Until …" / "Ended …", super managers listed first                                                                                                  | `role-form.spec.ts`, `manager-form.component.spec.ts`, `manager-card.component.spec.ts`, `team-access.model.spec.ts`                                                                                                    |
| 7   | Dashboard notice        | `superNotice`, `SUPER_ENDING_NOTICE_DAYS`, the dashboard's notice                                                                                                                                                                                                            | `super-manager.spec.ts`, `dashboard.model.spec.ts`                                                                                                                                                                      |
| 8   | E2E, docs, records      | `FAKE_SUPER_MANAGER_ACCOUNT`; `e2e/specs/admin-super-manager.e2e.ts`; data model, overview, class and sequence diagrams, ADR-0018, CHANGELOG                                                                                                                                 | three sizes: approve for the owner and the owner told; the end passing (`page.clock`) drops the menu items; axe on Team access with the switch on and on the super manager's dashboard                                  |

## Decisions & deviations from design

- **`forOwner: true` on the history record**, instead of working it out from `by` and `approvedFrom`: the history can't
  tell the owner's account from a super manager's without the owner's id, and an explicit flag is what the dashboard
  counts. The rules don't restrict extra fields on a record, so no rules change was needed for it.
- **A super manager reads every role** (`roles` read allows `actsAsOwner()`), so Review & publish can name who made
  each change they approve. Writing stays the owner's (D1).
- **At the end, the menu, badges and queue change at once; a page already open stays until the next navigation**, where
  the guards send them away as for any refused area. The rules refuse its reads and writes from the end moment. The
  dashboard's notice is worked out when the dashboard opens.
- **The request card says who answered** ("Approved and published by s@…"), but not "for the owner": a manager's card
  can't tell the owner's email from a super manager's.
- **An ended super manager's date must be changed or the switch turned off** before their card can be saved again: the
  last day must be today or later.
- **No seeded super manager:** the e2e suite adds one on Team access, as the other suites add managers, signing in as a
  new fake account (`FAKE_SUPER_MANAGER_ACCOUNT`).
- **A super manager isn't offered self-approval** (`canApproveOwn` is false while super): their changes publish
  directly (D7).
- **The menu's new-leads count** now shows for a super manager, as for the owner.
- **No dependency added.** The public site's first download is unchanged: everything is in the admin's lazy routes.

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-21.
