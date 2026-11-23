# 05 · Operations — An admin that's easier to use (2.14.0)

- **Version:** 2.14.0, merged by the owner on 2026-11-23 (PR #70). ☑ `chore(release): v2.14.0`, tag `v2.14.0`,
  pushed 2026-11-23.
- **CHANGELOG entry:** ☑ `## [2.14.0] - 2026-11-23`.
- **Deploy notes:**
  - **Site:** deploys with the merge.
  - **Rules:** none changed.
  - **Firebase:** inviting needs Authentication's **Enable create (sign-up)** left on (Firebase's default); if it's
    turned off, the form says so and asks for the UID. The password email's wording is in Authentication →
    Templates → Password reset.
  - **Data, settings, dependencies:** none.
- **First use:** Team access → Add a manager → their email → Create and invite. The dashboard shows Needs you first.
- **Monitoring:** if an invite says sign-up is turned off, check the setting above; if the email doesn't arrive,
  the manager can use Forgot password on the sign-in page.
- **Rollback:** redeploy tag `v2.13.0` (which has the wide-screen slide) or `v2.12.0`. Managers already invited keep
  their accounts and roles.

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-23.
