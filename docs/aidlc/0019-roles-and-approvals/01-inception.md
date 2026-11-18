# 01 · Inception — Roles and approvals (2.0.0)

The fourth release of the [version 2 programme](../0014-version-2/01-inception.md), which holds the problem, user stories and
acceptance criteria. This file only records what 2.0.0 takes from it.

## Scope

| Item | Feature                                                                                                                  |
| ---- | ------------------------------------------------------------------------------------------------------------------------ |
| V4   | A second, limited account for a content manager (`content-manager@taalyatra.in`), created by the owner in Firebase       |
| V5   | Per editor page: hidden, needs approval, or can publish; photo uploads on or off; an approval queue for the owner        |
| D4   | Defaults for a new manager: needs approval everywhere, uploads on                                                        |
| D5   | The owner learns of waiting changes from a badge in the admin area, not by email                                         |
| D7   | 2.0.0 because it changes who may change what, enforced by new rules: a breaking change for anyone relying on the old one |

The guided tour and the "intuitive admin" pass for both roles follow in 2.1.0 (programme order).

## Acceptance criteria for this release

- [ ] Given the manager's account, when they sign in, then they see only the editor pages the owner allowed, and nothing
      else of the admin area that isn't theirs (leads, visits, backups, access).
- [ ] Given "Needs approval", when the manager finishes a change, then they send it for approval instead of publishing,
      and the owner sees it waiting, with a badge.
- [ ] Given a waiting change, when the owner approves it, then it goes live; when they send it back, then the manager sees
      why and can carry on editing.
- [ ] Given "Can publish", when the manager publishes, then it goes live without the owner, and the history says who
      published it.
- [ ] Given uploads off, when the manager tries to upload a photo, then it's refused by the screen, the rules and the
      upload function.
- [ ] Given anything the manager isn't allowed, when they try it outside the screen (a crafted request), then
      `firestore.rules` or the upload function refuses it.
- [ ] Given the owner, then nothing they can do today is lost, and no mistake in the access page can lock them out.
- [ ] Given an account the owner hasn't added, when it signs in, then it's told it has no access, as today.

---

**Approval:** ☑ Approved as part of the 0014 programme by Ravi Akhouri on 2026-11-17. The details are decided with the
[design](02-design.md).
