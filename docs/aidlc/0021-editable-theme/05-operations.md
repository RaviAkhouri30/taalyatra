# 05 · Operations — Editable theme (2.2.0)

- **Version:** 2.2.0, merged by the owner on 2026-11-21 (PR #57, `6027f6f`). `npm run release:minor` →
  `chore(release): v2.2.0`, tag `v2.2.0`.
- **CHANGELOG entry:** ☑ `## [2.2.0] - 2026-11-21`.
- **Deploy notes:**
  - **Site:** deploys with the merge. Until a theme is published it looks as before, but for the lighter form-field edges.
  - **Rules:** ☐ the owner deploys them (`npm run deploy:rules`): `site/theme`, its drafts, and the Theme page on Team
    access. Until then nobody can save a theme.
  - **Seed:** ☐ the owner runs `npm run seed:firestore -- <key.json> --dry-run`, then `--yes`: it adds an empty
    `site/theme` (today's look), so visits don't log a missing document and a manager can change it.
  - **Dependencies:** none added. **Budget:** initial 510 kB (ADR-0019).
- **First use:** the owner picks a theme on **Settings → Theme**, checks the preview, and publishes. Existing managers have
  the page set to needs approval; it can be hidden on Team access.
- **Monitoring:** after publishing a theme, open the site on a phone and the admin, and check the browser bar's colour.
  A theme the site ignores (unreadable) shows today's look.
- **Rollback:** **Reset to the default theme** and publish, or go back in the publish history; the code: redeploy tag
  `v2.1.1` (the stored theme is then ignored; the rules can stay).

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-21.
