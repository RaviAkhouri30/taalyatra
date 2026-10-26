# 05 · Operations — Home page

- **Version:** 1.1.0 (`package.json`; set with `npm version minor --no-git-tag-version`, the
  release commit and `v1.1.0` tag are created when the change is committed)
- **CHANGELOG entry:** ☑ `## [1.1.0] - 2026-10-26`
- **Deploy notes:** the site runs on the fake backend. Before go-live, fill in
  `environment.emailJs` (service id, template id, public key), allow-list the domain and set rate
  limits in the EmailJS dashboard; the factory switches to EmailJS automatically.
- **Monitoring:** none yet (no hosting decision). Watch the EmailJS dashboard for failed sends.
- **Rollback:** redeploy tag `v1.0.0`.

---

**Approval:** ☐ Pending
