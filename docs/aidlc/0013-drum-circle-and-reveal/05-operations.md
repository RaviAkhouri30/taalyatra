# 05 · Operations — Drum circle editor and gentle reveal (1.9.0)

- **Version:** 1.9.0, tag `v1.9.0` on the release commit. Deployed as the owner merged PRs #30–#34 (last: `fbfc072`,
  2026-11-17). It includes what was planned as 1.8.1: the email changes merged alongside the reveal, so a separate 1.8.1
  couldn't be tagged cleanly. The plan moves along: the rest of the content programme is 1.10.0 (0010), the proposals inbox
  1.11.0 (0011).
- **CHANGELOG entry:** ☑ `## [1.9.0] - 2026-11-17`
- **Deploy notes:**
  - **Rules:** two releases of `firestore.rules` today, both by the owner: required email (after its merge, as the new form
    was already stricter) and `home/drumCircle` (before its merge). The live ruleset matches the repo.
  - **EmailJS:** service, template and auto-reply set up by the owner; production settings in `environment.ts`. No domain
    lock on the free plan: the exception is in ADR-0006.
  - **Backup:** not confirmed for today's rules releases. Run `npm run export:firestore` before the next one.
  - **Seed:** none needed. `home/drumCircle` was already stored with the shape the editor writes.
- **Monitoring:**
  - **Email:** EmailJS's dashboard shows requests against the 200 a month; each proposal uses two (copy and auto-reply).
    Junk arriving at `contact@taalyatra.in` means the public key is being abused: switch the auto-reply off first (ADR-0006).
  - **Proposals:** each is also stored in `proposals`, readable in the Firebase console until the inbox (1.11.0).
  - **Speed:** the dashboard's speed card, now without Lighthouse and crawler visits.
- **Rollback:**
  - **The release:** redeploy tag `v1.8.0`. The rules can stay: they only add `drumCircle` and require an email, which
    1.8.0's form doesn't send without one, so redeploy the 1.8.0 rules too if rolling back.
  - **Only the reveal:** remove `appReveal` from `home-page.component.html`.
  - **Only email:** empty `emailJs` in `environment.ts`; proposals are still stored.

---

**Approval:** ☐ Pending
