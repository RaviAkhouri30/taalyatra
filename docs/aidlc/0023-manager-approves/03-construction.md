# 03 · Construction — A manager who can approve (2.4.0)

Built on the approved [inception](01-inception.md) (D1–D5) and the [design](02-design.md), written alongside at the
owner's request; [ADR-0018](../../architecture/adr/0018-roles-and-approvals.md) gains its 2.4.0 section.

| #   | Increment         | Files                                                                                                                                                                                                               | Tests                                                                                                                                                                                             |
| --- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | The role          | `role.model.ts` (`canApprove`), `Permissions.canApproveOwn`, `forms/role-form.ts`, Team access's switch and the card's "Approving" line                                                                             | `self-approvals.spec.ts`, `role.model.spec.ts`, `manager-form.component.spec.ts`, `manager-card.component.spec.ts`                                                                                |
| 2   | The plan          | `IPublishPlan.approve`, `Review.planFor`, the button and confirmation wording; the publish bar's "1 to approve"                                                                                                     | `review.model.spec.ts`, `publish-bar.component.spec.ts`                                                                                                                                           |
| 3   | The commit        | `i-publish-record.ts` (`selfApproval`, `SELF_APPROVALS_COLLECTION`), `PublishService` (the record's approval, the marker, reading it back); Review & publish's **Your approval** fields and run                     | `publish.service.spec.ts`, `publish-page.view-model.spec.ts`                                                                                                                                      |
| 4   | Rules             | `firestore.rules`: `canPublishHere` on every live write, `selfApprovesShared`, `approvableConfigKeys`, `approvablePaths`, `selfApprovals/{uid}`, a self-approved record's shape, `isValidRole` accepts `canApprove` | `firestore-self-approval.rules.spec.ts` (12): accepted with its marker; refused without the switch, the marker, with a reused marker, an old record, a hidden page, a bad record; a large publish |
| 5   | The owner's view  | the history's "self-approved by …" with its title and note; `models/self-approvals.ts`; the dashboard's count since last looked, marked seen on Review & publish                                                    | `publish-page.model.spec.ts`, `publish-history.component.spec.ts`, `dashboard.view-model.spec.ts`                                                                                                 |
| 6   | A waiting request | **Approve it yourself** on the manager's waiting request                                                                                                                                                            | `approval-card.component.spec.ts`, `approvals-panel.view-model.spec.ts`                                                                                                                           |
| 7   | Tests and records | `e2e/specs/admin-self-approval.e2e.ts`; ADR-0018, the data model                                                                                                                                                    | three sizes: the owner turns it on, the manager approves with a title and note, the site, the history and the dashboard; axe with the form showing                                                |

## Decisions & deviations from design

- **The rules can't check the time**, as the document store can't write the server's: instead the marker must change in
  the commit and point at a history record that didn't exist before it. A reused marker is refused (rules test).
- **Approve it yourself withdraws the request**, which ticks its changes on Review & publish as the manager's own, ready
  to approve; the request's note isn't copied into the description, which the manager writes afresh.
- **The marker names every document of the publish**, those the manager could publish anyway included; the rules check
  only that each is one of their pages.
- **"Seen" is per device**, as the release notes' "New" is: another device counts the same self-approvals again.
- **No dependency added.** The public site's first download is unchanged.

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-21.
