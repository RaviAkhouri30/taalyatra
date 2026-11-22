# 05 · Operations — The admin on your phone (2.8.0)

- **Version:** 2.8.0, merged by the owner on 2026-11-22 (PR #63). Main was still at 2.5.0, so instead of
  `release:minor` (which would have made 2.6.0) it was set with `npm version 2.8.0` → `chore(release): v2.8.0`
  (`a87dcef`), tag `v2.8.0`, pushed on 2026-11-22 at the owner's request. A stray local `v2.6.0` tag, made on the
  feature branch after the merge, was deleted; it was never pushed.
- **CHANGELOG entry:** ☑ `## [2.8.0] - 2026-11-22`.
- **Deploy notes:**
  - **Site:** deploys with the merge, `public/admin.webmanifest` and the icons with it. `staticwebapp.config.json`
    serves the manifest as `application/manifest+json` with `no-cache`.
  - **Rules, data, dependencies:** none.
- **On the phones** (☐ by the owner, after the deploy; also in [deployment.md](../../architecture/deployment.md)):
  - ☐ Android: Chrome → ⋮ → **Install app** on an admin page; the icon and "TY Admin" on the home screen.
  - ☐ iPhone: Safari → Share → **Add to Home Screen**; the same icon and name; it asks for a sign-in once.
  - ☐ Both: it opens full screen at the admin; the top bar sits below the status bar; **View site** opens the browser.
  - ☐ After the next release: the app shows it on the next open.
- **Icons:** ☐ placeholders until the original logo (SVG, or PNG ≥ 1024 px) arrives; replacing them is four files.
- **Monitoring:** none new.
- **Rollback:** redeploy the merge before 2.8.0, `d8ca037` (no tag: see 0025's operations). An installed app then opens
  `/admin` like a bookmark, without full screen.

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-22.
