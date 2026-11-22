# 03 · Construction — The admin on your phone (2.8.0)

Built on the approved [inception](01-inception.md) (D1–D6) and [design](02-design.md).

| #   | Increment               | Files                                                                                                                                                                                                                                      | Tests                                                                                                                                                     |
| --- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | While the admin is open | `IInstallPrompt` and `BrowserInstallPrompt` (`core/`), `provideInstallPrompt()`; `AdminAppService` (manifest link, iPhone tags, Apple icon, `viewport-fit=cover`, all put back on leaving); `AdminShellViewModel`; the shell provides both | `browser-install-prompt.spec.ts`, `admin-app.service.spec.ts`, `admin-shell.view-model.spec.ts`, the shell's spec                                         |
| 2   | Under the status bar    | `env(safe-area-inset-top)` on the top bar (`editor-top-bar`), the drawer's head, and the sign-in page                                                                                                                                      | the e2e screenshots, unchanged; the phones (operations)                                                                                                   |
| 3   | Manifest and hosting    | `public/admin.webmanifest`, placeholder `public/icons/admin-{180,192,512,maskable-512}.png` from the 156 px logo, `staticwebapp.config.json` (type, `no-cache`, fallback exclusion)                                                        | e2e: the manifest's fields and its icons                                                                                                                  |
| 4   | Install help            | `/admin/install`: `InstallPageComponent`, `InstallPageViewModel`; the Help menu's link                                                                                                                                                     | the page's and view model's specs, the Help menu's; e2e: tags on admin pages only, the steps, the Install button with a simulated offer, axe; three sizes |
| 5   | Records                 | deployment notes, component tree, CHANGELOG                                                                                                                                                                                                |                                                                                                                                                           |

## Decisions & deviations from design

- **The install offer is a port, `IInstallPrompt`, with a browser adapter in `core/backends`.** Chrome's `prompt()` and
  `userChoice` are Promises, which only `core/backends` may touch (CLAUDE.md §7); the design had them in
  `AdminAppService`.
- **The shell provides `AdminAppService` and the port**, not the admin route: every admin page sits inside the shell,
  and keeping them out of the routes file leaves its chunk smaller.
- **The admin shell gained a view model**, so its one stream (the tags and the offer) is subscribed by `BaseComponent`,
  the only place subscriptions are made.
- **The first download grew by 1.29 kB** (508.07 → 509.36 kB; 118.57 → 119.76 kB compressed), not "unchanged": no
  admin code is in it, but each new lazy piece (the Install page alone is 0.48 kB of it) makes the bundler regroup
  Angular's shared code into a new initial chunk. It's within the 510 kB warning budget, **with 0.64 kB left**: the next
  release will need either a smaller start or a decision on the budget.
- **Safe-area padding** went on the top bar's own host and the drawer's head row rather than the layout's `.ed-top` and
  the whole drawer: the layout's stylesheet is at its 4 kB budget, and padding the fixed drawer would have pushed it
  past the screen's bottom. To make room, the drawer's open state joined its media block and a redundant `height: 100vh`
  went (the drawer is already pinned top and bottom).
- **The icons are placeholders** made from the 156 px logo, until you send the original (D4). Replacing them is
  swapping four files; nothing else changes.
- **No dependency added.**

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-22.
