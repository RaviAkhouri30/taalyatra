# 02 · Design — A manager who can approve (2.4.0)

Built on the approved [inception](01-inception.md) (D1–D5). It extends
[ADR-0018](../../architecture/adr/0018-roles-and-approvals.md) (roles and approvals), which gains a 2.4.0 section. The
owner asked to go on and implement as planned, so this design was written for review alongside the construction rather
than before it.

## The role and the plan

- `roles/{uid}` gains an optional `canApprove: boolean`; missing is off (D1). `Permissions.canApproveOwn` reads it.
  Team access shows **Can approve their own changes** beside the uploads switch: _"Their changes on pages that need
  approval go live when they approve them, with a title and a note you can read in the history. Can publish goes live
  with no note."_
- `IPublishPlan` gains `approve`: for a manager with the switch, the ticked changes that would be sent for approval are
  approved instead (none are sent). The button reads **Approve and publish 2 changes**; with changes they may publish
  too, **Publish 1 change, approve and publish 2**.
- The confirmation opens a small form: **Title** (optional, up to 80 characters) and **What changed and why**
  (optional, up to 500), D2.

## The commit

One atomic commit, as every publish (ADR-0013):

| Write                 | What                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------- |
| Live documents        | the drafts, as any publish                                                                  |
| `publishes/{id}`      | the history record, with `selfApproval: { title, note }`                                    |
| `selfApprovals/{uid}` | the manager's marker: `{ record: id, paths }`, the record's id and the documents it changes |
| `drafts/…`            | removed, as any publish                                                                     |

## Rules (D5)

```text
// A live write to a page that needs approval, by a manager who can approve, made in the same commit as their
// self-approval: their marker changes in this commit, names this document, and points at a new history record.
function selfApproves(page, path) {
  let marker = /databases/$(database)/documents/selfApprovals/$(request.auth.uid);
  return isManager() && role().get('canApprove', false) == true
    && pageSetting(page) == 'approval'
    && existsAfter(marker) && path in getAfter(marker).data.paths
    && (!exists(marker) || get(marker).data.record != getAfter(marker).data.record);
}
```

- Every live content write accepts `canPublish(page) || selfApproves(page, path)`; `site/config`'s parts likewise.
- `selfApprovals/{uid}`: written only by that manager, with the switch; its `record` must be a history record that
  doesn't exist before the commit and does after, signed by them, with `selfApproval`; its `paths` only pages they see.
- A manager's history record may name pages that need approval only with `selfApproval` (title ≤ 80, note ≤ 500).
- So a stale marker can't be reused, and no self-approved write goes live without its record. Lookups are cached
  across the commit's writes; the rules tests include a large self-approved publish.

## The owner's view (D3)

- A history entry reads "self-approved by priya@…" with the title (or "Self-approved") and the note.
- The dashboard's History card adds "2 changes self-approved since you last looked", counting self-approved records newer
  than the last one the owner saw on Review & publish (kept per device, like the release notes' "New").

## A waiting request (D4)

A manager with the switch sees **Approve it yourself** on their waiting request: it withdraws the request (as Withdraw
does now), ticks its changes, puts its note in **What changed and why**, and opens the confirmation.

## Tests

Unit: the role, the plan and its texts, the record's `selfApproval`, the marker write, the history line, the dashboard
count, Team access's switch, Approve it yourself. Rules: self-approval accepted with its marker and record; refused
without the switch, without the marker, with a stale marker, with a record that isn't new, for a hidden page; a large
self-approved publish. E2E on three sizes: the owner turns the switch on, the manager approves a change, the site shows
it, the owner sees it in the history and on the dashboard; axe on the dialog.

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-21.
