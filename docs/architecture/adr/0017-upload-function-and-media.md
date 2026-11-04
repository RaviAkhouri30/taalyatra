# ADR-0017: Upload function and media

- **Status:** Accepted · **Date:** 2026-11-04 · **Version:** 1.7.0

## Context

The owner needs to add photos from a phone or computer. Cloudinary stores and delivers them. Its API
secret must never reach the browser (CLAUDE.md §10), so something on a server has to sign uploads and
deletes. The site is on Azure Static Web Apps and has no server of its own.

## Decision

- **A managed Azure Function in `api/`, deployed by the existing workflow.** It has two routes:
  `POST /api/media/sign` and `POST /api/media/delete`. Files go straight from the browser to Cloudinary,
  so the function never sees them and the platform's 45-second API limit doesn't apply.
- **Only the admin can call it.** The browser sends its Firebase ID token in `x-firebase-token`, not
  `Authorization`, because users report the platform replacing that header. The function checks it with
  `jose` against Google's public keys, including `sub` against the admin UID. No Google credential sits on
  the server.
- **The function alone decides what's signed.** It ignores the request's body when signing: a random id
  inside `taal-yatra/media`, the allowed file types and the incoming transformation. Delete accepts only
  ids of that exact form.
- **`a_exif/c_limit,fl_force_strip,w_2400` is applied before Cloudinary stores a file.** See the proof
  below for why the flag is required.
- **`IMediaService` is provided only on the admin routes,** so public pages never download upload code.
  `CloudinaryMediaService` uses `HttpClient` with no SDK. `FakeMediaService` serves development, e2e and the
  emulator, which must never reach the real account.
- **Our own `IMAGE_LOADER` instead of `provideCloudinaryLoader`.** The built-in loader rewrites every image,
  but the site still has local ones, and it can't put a crop before the resize. Ours passes local paths and
  full URLs through, and sends anything else to Cloudinary.
- **A crop belongs to one use, not the file:** `IImage.src` holds `c_crop,x_…,y_…,w_…,h_…/v…/<id>`.
- **`media/{id}` is an admin-only library, not drafted.** A file is invisible to visitors until a published
  document uses it.
- **Collections are drafted as one document** (`{ _items: [...] }`) and expanded into numbered documents
  when published, in the same atomic commit. Autosave, reorder, publish checks, preview and undo work
  unchanged.
- **Usage is worked out from the documents each time,** so no stored count can fall out of step. Delete is
  refused while an image is used live or in a draft, and a publish check blocks an image no longer in the
  library, which undo could otherwise bring back.

## The proof that changed this decision

The design first used `a_exif/c_limit,w_2400`, because a Cloudinary forum reply said a transformation strips
the stored file's metadata. On the real account (2026-11-03), a stored file kept its GPS location:

| Photo with GPS            | `a_exif/c_limit,w_2400` | With `fl_force_strip` |
| ------------------------- | ----------------------- | --------------------- |
| Small, upright JPEG       | **GPS kept**            | No GPS                |
| Large JPEG                | No GPS                  | No GPS                |
| Sideways JPEG             | No GPS                  | No GPS                |
| Small HEIC, made on a Mac | **GPS kept**            | No GPS                |

Cloudinary appears to rewrite a file only when it has to change it. Stored files can be fetched from a public
URL, so this would have exposed where a photo was taken. `npm run prove:cloudinary` repeats these checks on
the real account. Its HEIC check still needs a real iPhone photo, which Verification covers.

## Rule exceptions

- **CLAUDE.md §7 (no Promises):** Azure requires a handler to return a Promise. All function logic stays in
  RxJS, and one helper, `toAzureResponse`, converts the result, so `api/` has no `async`, no `await` and no
  ESLint exception.
- **CLAUDE.md §1:** the custom loader above. §1 is updated.

## Alternatives

- **Cloudinary's unsigned upload presets:** anyone who finds the preset name could upload to the account.
- **Firebase Cloud Functions:** needs the paid Blaze plan, and a second host for one small job.
- **The Firebase Admin SDK for checking tokens:** requires a service account on the server. `jose` needs none.
- **Sending files through the function:** the 45-second limit would fail large uploads on slow connections.

## Consequences

- Azure holds three settings: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`.
- Rollback is harder. Once published data points at Cloudinary, a 1.6.0 build can't show those images, so
  rolling back means restoring content too.
- Pull request preview sites don't have the Azure settings, so uploads fail there with a clear message.
- The free plan's 25 credits a month are enough to start, but a popular gallery could use them up. The
  dashboard is in Cloudinary's console.
- `api/` is its own package with exact versions, tests and a 90 % coverage threshold.
