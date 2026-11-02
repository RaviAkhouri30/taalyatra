# 03 · Construction — Media (1.7.0)

Built from the approved [design](02-design.md) on `feat/media`, one commit per increment.

| #   | Increment                                            | Files                                                                                                                                                                                                                                 | Tests                       |
| --- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| 1   | Upload function (D1–D6)                              | `api/`: `media/sign`, `media/delete`, token verification, signing; `apiRuntime`; lint, `verify`, CI and Sonar cover `api/`; `scripts/prove-cloudinary.mjs` for the real-account proof                                                 | function (52), proof passed |
| 2   | Rules, `media`, port, adapters, loader (D7–D11, D22) | `firestore.rules`; `IMediaService`, `CloudinaryMediaService`, `ImagePreparer`, `FakeMediaService`, factory; `IAuthService.idToken()`; `mediaImageUrl`, `provideMediaImages`; `CLOUDINARY_CONFIG`; `MediaAsset`, `MediaLibraryService` | see Checks                  |

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

- **`media` documents also store `version` (a small addition to D11),** because `IImage.src` needs it
  (D14).
- **Local development shows a placeholder for uploaded images.** With no cloud name (fake backend and
  emulator) the loader serves a local image, so those builds never reach the real account.
- **`EmailJsEmailService` gets the SDK function through a token, `EMAILJS_SENDER`.** Its spec patched the
  module, which fails if an earlier spec has loaded the real one, and adding specs exposed that. The spec
  now replaces the function through DI (CLAUDE.md §9).
- **A file the browser can't encode goes as it is,** the same as one it can't decode, because Cloudinary's
  transformation removes its metadata either way.

## Checks

- **Increment 1:** 52 function tests, coverage 100 %; the signature matches Cloudinary's documented
  example; `npm audit --omit=dev` in `api/` shows 0 vulnerabilities.
- **Increment 2:** `npm run verify` passes (806 site tests, coverage 99.78/98.32/99.53/99.96; 52 function
  tests at 100 %); 118 rules tests; `npm run e2e` 270 passed; `npm run e2e:firebase` 15 passed. The initial
  bundle grew by 0.71 kB (0.36 kB compressed), and the upload code is in one admin chunk that the public
  pages don't load.
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

- **Full proof with the new setting (2026-11-03, run by the owner):** all 15 checks passed, including a
  HEIC with GPS and Cloudinary confirming each deletion. This opens the gate after increment 1.
- **Still to prove in Verification:** a real iPhone photo; the `x-firebase-token` header and the Azure
  settings, which need a deployed function.

---

**Approval:** ☐ Pending
