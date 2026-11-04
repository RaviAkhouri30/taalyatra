# 05 · Operations — Media (1.7.0)

- **Version:** 1.7.0. The code went live in stages through PRs #18 to #24 (`109f979`, 2026-11-04). Tag `v1.7.0` is on the
  release commit.
- **CHANGELOG entry:** ☑ `## [1.7.0] - 2026-11-05`
- **Deploy notes:**
  - **Backup:** `backups/firestore-2026-11-04.json`, taken before the rules (git-ignored).
  - **Rules:** the owner deployed them on 2026-11-04, after the first merge. `/admin` couldn't load the media library or
    the review page for that gap, and the public site wasn't affected. **The same ordering slip as 1.6.0,** so the deploy
    notes and PR text must say it before a merge, not after.
  - **Azure settings:** the owner added `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`.
  - **Seed:** none needed. This release adds no content documents.
  - **Cloudinary account:** `zqu2cpih`. Its console labels it "(Test)", and the owner decided not to pursue that. Uploads and
    delivery work; if the account ever stops serving images, ask Cloudinary support about the label first.
  - **Preview sites:** Azure's limit on staging environments is full, so PR previews fail with "maximum number of staging
    environments". It doesn't affect deploys to the live site. Delete old ones under the Static Web App's **Environments**.
- **Monitoring:**
  - Cloudinary's console shows usage against the free plan's 25 credits a month.
  - Failed uploads and function calls show in the browser's console with their original cause.
  - Function errors show under the Static Web App's Application Insights, if it's enabled.
  - Run Lighthouse on the live home page after each release (see [04-verification.md](04-verification.md)).
- **Rollback:**
  - **One bad edit:** undo that publish on the Review & publish page, then publish again.
  - **The release:** redeploy tag `v1.6.0`. **Once published content points at Cloudinary, a 1.6.0 build can't show those
    images,** because it has no loader, so restore the content too. There's no restore script yet: `export:firestore` files are
    restored by hand.
  - **The rules** can stay: they only add admin permissions.
- **Secrets:** the Cloudinary API secret was never sent to the browser or committed. Rotate it in Cloudinary and update Azure
  if it's ever exposed; nothing else depends on it.

---

**Approval:** ☐ Pending
