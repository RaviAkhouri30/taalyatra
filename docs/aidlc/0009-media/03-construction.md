# 03 · Construction — Media (1.7.0)

Built from the approved [design](02-design.md) on `feat/media`, one commit per increment.

| #   | Increment               | Files                                                                                                                                                                                 | Tests                      |
| --- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| 1   | Upload function (D1–D6) | `api/`: `media/sign`, `media/delete`, token verification, signing; `apiRuntime`; lint, `verify`, CI and Sonar cover `api/`; `scripts/prove-cloudinary.mjs` for the real-account proof | function (52), proof below |

## Decisions & deviations from design

- **The rule exception is smaller than approved.** All function logic stays in RxJS, including token
  verification and calls to Cloudinary. One helper, `toAzureResponse`, turns the result into the Promise
  Azure requires, so `api/` has no `async` or `await` and needs no ESLint exception.
- **`rxjs` is a dependency of `api/`,** to keep CLAUDE.md §7 there too.
- **The folder is part of `public_id`,** not a separate `folder` setting, so it behaves the same whichever
  folder mode the Cloudinary account uses. Delete only accepts an id of that exact form.
- **The function is built on the CI runner** (`skip_api_build: true`), like the site.
- **The incoming transformation changed after the proof failed (D7, approved by the owner on
  2026-11-03).** `a_exif/c_limit,w_2400` became `a_exif/c_limit,fl_force_strip,w_2400`. See the proof
  results below.
- **The owner keeps the Cloudinary account `zqu2cpih`,** which the console labels "(Test)". Cloudinary's
  docs don't explain the label, and the owner decided on 2026-11-03 not to pursue it.

## Checks

- **Increment 1:** 52 function tests, coverage 100 %; the signature matches Cloudinary's documented
  example; `npm audit --omit=dev` in `api/` shows 0 vulnerabilities.
- **Real-account proof (2026-11-03, account `zqu2cpih`, run by the owner):** a signed SHA-256 upload is
  accepted, and delivered images have no GPS. The approved setting failed on the stored file, so three
  placements of Cloudinary's `fl_force_strip` were compared. Each cell is the stored file:

  | Photo with GPS            | `a_exif/c_limit,w_2400` | All three `fl_force_strip` placements |
  | ------------------------- | ----------------------- | ------------------------------------- |
  | Small, upright JPEG       | **GPS kept**            | No GPS, 1200×630                      |
  | Large JPEG (3000 px)      | No GPS, 2400×1260       | No GPS, 2400×1260                     |
  | Sideways JPEG             | No GPS, 630×1200        | No GPS, 630×1200                      |
  | Small HEIC, made on a Mac | **GPS kept**            | No GPS, 1200×630                      |

  Cloudinary appears to rewrite a file only when it has to change it. `a_exif/c_limit,fl_force_strip,w_2400`
  was chosen because it keeps the flag in the resize step; the results don't separate the three.

- **Still to prove:** the full proof with the new setting; a real iPhone photo; the `x-firebase-token`
  header, which needs a deployed function. The last two belong to Verification.

---

**Approval:** ☐ Pending
