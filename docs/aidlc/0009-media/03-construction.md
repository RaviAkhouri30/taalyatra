# 03 · Construction — Media (1.7.0)

Built from the approved [design](02-design.md) on `feat/media`, one commit per increment.

| #   | Increment                  | Files                                                                                                                                                                    | Tests                   |
| --- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------- |
| 1   | Upload function (D1–D6)    | `api/`: `media/sign`, `media/delete`, token verification, signing; `apiRuntime`; lint, `verify`, CI and Sonar cover `api/`; `scripts/prove-cloudinary.mjs` for the real-account proof | function (52), proof pending |

## Decisions & deviations from design

- **The rule exception is smaller than approved.** All function logic stays in RxJS, including token
  verification and calls to Cloudinary. One helper, `toAzureResponse`, turns the result into the Promise
  Azure requires, so `api/` has no `async` or `await` and needs no ESLint exception.
- **`rxjs` is a dependency of `api/`,** to keep CLAUDE.md §7 there too.
- **The folder is part of `public_id`,** not a separate `folder` setting, so it behaves the same whichever
  folder mode the Cloudinary account uses. Delete only accepts an id of that exact form.
- **The function is built on the CI runner** (`skip_api_build: true`), like the site.

## Checks

- **Increment 1:** 52 function tests, coverage 100 %; the signature matches Cloudinary's documented
  example; `npm audit --omit=dev` in `api/` shows 0 vulnerabilities.
- **Real-account proof:** pending the owner's Cloudinary account. It can't be skipped: the design makes
  it the gate for everything after increment 1.

---

**Approval:** ☐ Pending
