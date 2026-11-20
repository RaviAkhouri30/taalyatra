# 03 · Construction — Editable theme (2.2.0)

Built on the approved [design](02-design.md) (decisions 1–6) and [ADR-0019](../../architecture/adr/0019-editable-theme.md).

| #   | Increment                        | Files                                                                                                                                                                                                                                                                                                     | Tests                                                                                                                                      |
| --- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Colours to variables             | `_tokens.scss` (`$palette`, `color()`, `with-alpha()`), `_theme.scss` (`:root` defaults), `_bootstrap.scss` (compile-time defaults); every written-in colour onto a token in 25 stylesheets; the diya, footer map and play button coloured in their styles; the preview's pick outline from the variables | every screenshot baseline unchanged, but the contact form on phones (decision 1); `diya-icon.component.spec.ts`                            |
| 2   | Theme model                      | `shared/utils/colour.util.ts`, `shared/constants/theme.constants.ts`, `theme-default.constants.ts`, `shared/models/theme-tokens.ts`, `theme-contrast.ts`, `site-theme.model.ts`, six `Theme*` enums, `i-site-theme.ts`                                                                                    | their specs: every ready-made theme passes every check; each worked-out token is within 30 of the design's value for today's colours       |
| 3   | Storage and rules                | `firestore.rules` (`isValidTheme`, `site/theme` for the owner or a manager who may publish Theme, drafts, publish records, Team access keys); `fake-db.json` (`site.theme: {}`); `vitest.rules.config.ts` (the app's path aliases)                                                                        | `tests/rules/firestore-theme.rules.spec.ts` (20): every enum value accepted, malformed values refused, visitor, manager by setting         |
| 4   | Applying it                      | `core/services/root-style.service.ts`, `core/interfaces/i-root-style.ts`, `LocalStoreService.remove`, `shared/services/site-theme.service.ts`, `shared/tokens/site-theme-loader.token.ts`, `shared/models/site-theme-style.ts`, `theme-root-style.util.ts`, the site shell, `index.html`'s early script   | their specs; `site-shell.component.spec.ts`; e2e: the page's defaults equal the code's                                                     |
| 5   | Text size, heading weight, fonts | `t.size()` on all 390 font sizes, `t.$weight-heading` on 38 weights, `--ty-font-*`; `public/fonts/*.css` (the pairs' sized fallbacks)                                                                                                                                                                     | e2e: larger text on three sizes                                                                                                            |
| 6   | Theme page                       | `FieldKind.Colour` (validator, error, field), `SectionPanel` and `ISectionPanel`, `SectionPartsPipe`, `schemas/theme.sections.ts`, `models/theme-form.ts`, `ContrastRule`, `ThemePanelComponent` and its view model, `ThemeSwatchComponent`; menu, Find, Features, Team access                            | their specs; the counts of pages updated in five specs                                                                                     |
| 7   | Tests and records                | `e2e/specs/admin-theme.e2e.ts`, 21 new baselines; ADR-0019, the data model, overview, class, flow and component diagrams                                                                                                                                                                                  | each ready-made theme published, with axe and screenshots on the site and the admin; blocked publish; preview; Reset; a manager's approval |

## Decisions & deviations from design

- **About 60 colours were written into components, not 15:** shades of today's colours with transparency (now
  `with-alpha()`), the light sections' paper cards, the game's pads and the offer's gradient. They became 23 more tokens,
  52 in all, each worked out from the six colours. Fixed, as decoration that reads on any page: shadows, white glints, the
  photo viewer's backdrop, the sparks, the chat's online dot, WhatsApp's green and the logo's ground.
- **The light sections and paper cards are the page the other way round:** their colours are worked out with the
  background and text swapped, and two of their pairs are in the check.
- **The design's greens and the game's orange are hues the six colours don't have**, so a theme works them out from its
  second accent.
- **Shades stay readable by construction:** the quiet-text shades and the offer's text fade only as far as their pair
  allows, and field edges and outline buttons strengthen until they reach 3:1. So a custom theme rarely fails on a shade.
- **The first-download budget is 510 kB** (the owner's decision, 2026-11-20; ADR-0019): 0.2 kB were left before this
  release. The theme model is its own chunk, loaded only when a theme is stored; an empty or missing theme loads nothing.
  The first download is 507.39 kB, 118.39 kB compressed (2.1.1: 499.80 kB, 117.08 kB).
- **The fonts' fallbacks are static stylesheets** (`public/fonts/`), loaded with the pair's Google Fonts stylesheet, so
  the first download carries none of them. They were measured in Chrome against Arial as 0007 did; DM Sans came out at
  103.06 % against 0007's 103.34 %.
- **One card, not four:** the swatches, the contrast results and Reset all fill or read the same form. A card can now
  place panels among its fields (`panels`, `SectionPartsPipe`), which other pages may reuse.
- **No font samples on the page:** the preview beside it shows the fonts on the site itself.
- **The preview shows a draft theme even when it fails the check**, so the owner sees why; visitors never get one.
- **`preset` is worked out when the theme is saved**, from the colours and background, instead of being a field.
- **An empty `site/theme` is seeded** (`npm run seed:firestore` adds missing documents only): without it every visit
  would log a missing document, and a manager can only change a document that exists (creating one is the owner's).
- **Daylight's accent is `#974912`, not `#9a4a12`:** axe found the admin menu's current page at 4.47:1 on Daylight. That
  pair is now in the check (22 pairs), so a custom theme can't fail it either.
- **The deep background goes away from the text:** lighter on a light theme, where darkening made the admin and the
  site's top bar grey. Found on the Daylight screenshots.
- **The editor layout uses Bootstrap's `visually-hidden`** instead of its own copy, to stay within its 4 kB style budget.
- **The contact form's phone baseline was re-recorded** for decision 1's lighter field edges; every other existing
  baseline is unchanged.
- **No dependency added.**

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-21.
