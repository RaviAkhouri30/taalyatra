# 03 · Construction — Media (1.7.0)

Built from the approved [design](02-design.md) on `feat/media`, one commit per increment.

| #   | Increment                                                  | Files                                                                                                                                                                                                                                 | Tests                       |
| --- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| 1   | Upload function (D1–D6)                                    | `api/`: `media/sign`, `media/delete`, token verification, signing; `apiRuntime`; lint, `verify`, CI and Sonar cover `api/`; `scripts/prove-cloudinary.mjs` for the real-account proof                                                 | function (52), proof passed |
| 2   | Rules, `media`, port, adapters, loader (D7–D11, D22)       | `firestore.rules`; `IMediaService`, `CloudinaryMediaService`, `ImagePreparer`, `FakeMediaService`, factory; `IAuthService.idToken()`; `mediaImageUrl`, `provideMediaImages`; `CLOUDINARY_CONFIG`; `MediaAsset`, `MediaLibraryService` | see Checks                  |
| 3   | Upload and library UI (D13, G5)                            | `MediaUploadComponent` and view model (queue of three, progress, retry); `MediaLibraryComponent` and view model; `MediaCardComponent`; **Media library** tab                                                                          | see Checks                  |
| 4   | Image field and crop (D12, D14)                            | `FieldKind.Image`; `ImageFieldComponent` and view model; `MediaPickerComponent`; `ImageCropComponent`, `CropFrame`, `parseImageSrc`                                                                                                   | see Checks                  |
| 5   | Collections (D15, D16)                                     | `collapseCollection`, `expandCollection`, `isCollection`; `DraftService.live`; `PublishService` expands on publish; `FakeDataStore` answers collections like Firestore                                                                | see Checks                  |
| 6   | Gallery, Team, Shows and Videos tabs (E1–E3, E5, D20, D21) | `media.sections.ts`; four tabs; `OneFeaturedShowRule`; a group shown by a switch (`onlyWhen`); a switch off by default; `youtubeThumbnail`                                                                                            | see Checks                  |
| 7   | Replace and delete with usage (D17–D19, G5–G7)             | `MediaUsageService`; `imageUsesIn`, `replaceImage`; `MediaManageViewModel`; `ImageInLibraryRule`                                                                                                                                      | see Checks                  |
| 8   | Docs (D1–D23)                                              | ADR-0017; ADR-0010 update; CLAUDE.md; overview, class, component, sequence, data and deployment docs; CHANGELOG                                                                                                                       | n/a                         |

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
- **A retry after a failed library save doesn't upload again.** The queue keeps the stored file and only
  retries the save, so a Firestore failure can't leave a duplicate at Cloudinary.
- **Each library image has its own description,** offered as the default wherever it's used.
- **The image description check is a validator, not a separate `ImageDescriptionRule`.** The existing
  `SchemaRule` already blocks publishing on any field error, and the form shows the same message.
- **An image field can be marked decorative,** so it needs no description. Video thumbnails sit next to a
  title saying the same thing, and blocking them would add screen-reader noise.
- **Choosing and cropping open in place, not in a pop-up.** It works the same on a phone and needs no focus
  trap. Crop also has move buttons: arrow keys alone wouldn't meet WCAG 2.2's dragging rule for pointer
  users.
- **Collection expansion is two functions, not a `CollectionExpander` class:** the lint rules refuse a class
  with only static members.
- **`DraftOverlayBackend` needed no code for collections (D16).** A collection's draft is read like any list
  section, so only a test was added.
- **Fixed an autosave bug that could lose a change (present since 1.6.0).** A change made while an earlier save
  was running was marked "Saved" when that save finished, so the owner could leave and lose it. "Saved" now
  appears only when no newer change is waiting, and "Saving…" shows as soon as something changes.
- **Videos get their thumbnail with a button, not automatically (D20).** The owner pastes the link and presses
  **Use the YouTube thumbnail**, so a typed or half-pasted link can't replace a thumbnail they uploaded.
- **The dashboard's placeholder list grew,** because the editor now covers team, shows and videos, so its
  screenshot baselines were re-recorded.
- **Replacing a photo removes its crops** (D19 kept them only as a warning). Their numbers refer to the old
  file, and could cut off the wrong part or fall outside the new one. The owner re-crops if they want to.
- **Uploads failed on the live site, found in the owner's first test (2026-11-05).** Angular 22 uses `fetch` by
  default, which refuses a request asking for upload progress, so every real upload failed before anything was
  sent. No test ran the real adapter in a browser: unit tests use a fake transport and e2e uses the fake adapter.
  `provideMedia` now brings an XHR `HttpClient` for the admin routes, and the Firebase smoke suite runs the real
  adapter in a browser, with the function and Cloudinary answered by stand-ins.
- **A file the browser can't encode goes as it is,** the same as one it can't decode, because Cloudinary's
  transformation removes its metadata either way.

## Checks

- **Increment 1:** 52 function tests, coverage 100 %; the signature matches Cloudinary's documented
  example; `npm audit --omit=dev` in `api/` shows 0 vulnerabilities.
- **Increment 2:** `npm run verify` passes (806 site tests, coverage 99.78/98.32/99.53/99.96; 52 function
  tests at 100 %); 118 rules tests; `npm run e2e` 270 passed; `npm run e2e:firebase` 15 passed. The initial
  bundle grew by 0.71 kB (0.36 kB compressed), and the upload code is in one admin chunk that the public
  pages don't load.
- **Increment 3:** `npm run verify` passes (845 site tests, coverage 99.78/98.24/99.55/99.96; 52 function
  tests at 100 %); `npm run e2e` 282 passed in 3.5 minutes. Earlier runs failed with timeouts while other
  software held the CPU (load average 40–67); the same code passed once the load fell.
- **Increment 4:** `npm run verify` passes (920 site tests, coverage 99.79/98.19/99.57/99.96; 52 function
  tests at 100 %); `npm run e2e` 282 passed. No admin code in the files public pages load. The field has
  no browser test yet, because no tab uses it until increment 6.
- **Increment 5:** `npm run verify` passes (950 site tests, coverage 99.8/98.04/99.58/99.96; 52 function
  tests at 100 %); `npm run e2e` 282 passed; `npm run e2e:firebase` 15 passed. Publishing a collection through
  the real rules gets its browser test with the tabs, in increment 6.
- **Increment 6:** `npm run verify` passes (991 site tests, coverage 99.8/97.99/99.59/99.96; 52 function tests at
  100 %); 118 rules tests; `npm run e2e` 309 passed; `npm run e2e:firebase` 21 passed, including publishing a
  collection and storing a library entry through the real rules.
- **Increment 7:** `npm run verify` passes (1042 site tests, coverage 99.78/98/99.53/99.96; 52 function tests at
  100 %); 118 rules tests; `npm run e2e:firebase` 21 passed; no admin code in the files public pages load.
  **`npm run e2e` has no single clean run for this increment.** Under heavy load from other software (load average
  20–26), two full runs ended with 14 and 10 timeouts, in different tests each time; every test passed on a rerun
  (305 + 9 + 1 of 315). Once the load fell, `npm run e2e` passed in one clean run: 315 passed in 3 minutes (2026-11-04).
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

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-04, including the deviations from the design above.
