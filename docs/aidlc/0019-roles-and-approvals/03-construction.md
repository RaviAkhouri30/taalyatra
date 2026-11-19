# 03 · Construction — Roles and approvals (2.0.0)

Built in increments, each merged on its own. 2.0.0 isn't released until every increment, the e2e and Firebase smoke suites
and records 04–05 are done.

| #   | Increment              | Files                                                                                                                                                                                                                                                                                                                                    | Tests                                                                                                                             |
| --- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Rules                  | `firestore.rules` (`isOwner`, `roles`, `approvals`, `locks`, per-page `canPublish`, `site/config` parts, manager drafts, publish records, uploads)                                                                                                                                                                                       | `tests/rules/firestore-roles.rules.spec.ts`, `firestore-manager-publish.rules.spec.ts`, `testing/manager.fixture.ts` (247 in all) |
| 2   | Permissions and guards | `models/role.model.ts`, `page-paths.ts`, `permissions.model.ts`, `approval.model.ts`, `services/access.service.ts`, `approval.service.ts`, `guards/editor.guard.ts` (was `admin.guard`), `owner.guard.ts`, `editor-tab.guard.ts`, `signed-out.guard.ts`, `admin.routes.ts`, menu filtered by `navGroupsFor`, drafts and publishes signed | their specs, `access.guards.spec.ts`                                                                                              |
| 3   | Fix: Team access link  | `editor-nav.constants.ts`: the link was hidden until its page shipped (#46), since the catch-all sent the owner to the home page                                                                                                                                                                                                         | `editor-layout.component.spec.ts`                                                                                                 |
| 4   | Team access page       | `models/team-access.model.ts`, `forms/role-form.ts`, `role.validators.ts`, `field-errors.ts` (3 messages), `services/roles.service.ts`, `view-models/team-access.view-model.ts`, `components/team-access-page/*`, `manager-card/*`, `manager-form/*`, route behind `ownerGuard`, menu link back                                          | their specs, `e2e/specs/admin-team-access.e2e.ts` (add, change, remove, errors, axe; 3 sizes)                                     |

Still to build: Review & publish with authors, ticks and Send for approval; the owner's approval queue; the waiting lock in
the editor; the manager's dashboard; upload and delete gated in the photo library; history showing who published; the
upload function's `verifyUploader`; a fake manager account; the manager e2e journeys and Firebase smoke tests; the ADR and
architecture diagrams.

## Decisions & deviations from design

- **Managers read every draft, approval and lock** (rules): Review & publish and the badges need list queries, and the
  rules can't filter a list by who wrote each item. Drafts are the shared working copy anyway (decision 4).
- **A manager's account id is fixed once added.** Changing it would be a different account, so the form disables the UID
  when changing a manager; adding the same UID twice is refused, so a manager's settings are never replaced unseen.
- **Team access refuses the owner's own UID** in the form as well as in the rules (decision 1), with a message saying the
  owner always has full access.
- **The UID is checked for letters, digits, `-` and `_`** (6–128 characters), as the Firebase console shows it, so it can
  only name its own `roles/{uid}` document.
- **Every page's setting is stored**, not only the ones that differ from "Needs approval": the card and the rules then read
  the same thing, and a later change of default can't silently change a manager's access.
- **Removing a manager leaves their drafts and requests** for the owner to publish or discard; the card says so before
  confirming.
- **A change reaches the manager's screens the next time they open the admin**; the rules apply it on their next click.
  The saved message says both.

---

**Approval:** ☐ Approved by \_\_\_\_ on \_\_\_\_
