# 05 · Operations — Roles and approvals (2.0.0)

- **Version:** 2.0.0, released by the owner's choice (2026-11-19) once the waiting lock merged (PR #49, `4b3163f`): every
  merge to `main` goes live, so each now carries its version. `npm run release:major` → `chore(release): v2.0.0`, tag
  `v2.0.0`. Photo permissions, the Firebase smoke tests with a manager, the ADR and diagrams, and record 04 follow as
  2.0.x releases.
- **2.0.1:** photo permissions: managers with **Can upload photos** upload; replace and delete stay the owner's. The upload
  function deploys with the site (`api_location: "api"`), so merging updates both; it needs no new Azure setting. Rollback:
  redeploy tag `v2.0.0` (managers then can't upload again; nothing stored changes).
- **CHANGELOG entry:** ☑ `## [2.0.0] - 2026-11-19`, with what's still to come in 2.0.x; ☑ `## [2.0.1] - 2026-11-19`.
- **Deploy notes:**
  - **Backup first:** `npm run export:firestore -- <key.json>` (live content to `backups/`).
  - **Rules:** `npm run deploy:rules` adds `roles`, `approvals` and `locks`, per-page publishing for managers, and
    managers' drafts and history records. They keep the owner fixed by account id, so they work with the 1.13.0 app too and
    can go first. Until they're deployed, Team access can't read or save managers ("Couldn't load the managers"), and
    nothing shows as waiting; the owner's editing and publishing work as before.
  - **Data:** nothing to migrate. Drafts and history records from before aren't signed and count as the owner's. No seed.
  - **Dependencies:** none added.
  - **Adding the manager:** Firebase console → Authentication → Add user (email and a password given to them directly),
    copy the User UID, then Team access → Add a manager. From 2.0.1, **Can upload photos** takes effect.
- **Monitoring:** the first days of the manager's use: Review & publish's "Waiting for your approval", and the Firestore
  usage page (a few extra reads per page: the role, the requests and the locks).
- **Rollback:** redeploy tag `v1.13.0`. The rules can stay: the owner's access is unchanged, and 1.13.0 ignores the new
  collections and the extra fields on drafts and history. Remove the managers on Team access first if they shouldn't keep
  editing drafts in the meantime.

---

**Approval:** ☐ Approved by \_\_\_\_ on \_\_\_\_
