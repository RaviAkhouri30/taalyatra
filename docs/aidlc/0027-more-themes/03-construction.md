# 03 · Construction — More themes, and your own saved (2.9.0)

Built on the approved [inception](01-inception.md) (D1–D6) and [design](02-design.md) (with its two refinements).

| #   | Increment            | Files                                                                                                                                                        | Tests                                                                                                                             |
| --- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 12 ready-made themes | `ThemePreset` (12 keys), `theme-presets.constants.ts` (the list, moved out of `theme.constants.ts`), `SiteTheme` without the names, the rules' `preset` list | every theme through the contrast check (`site-theme.model.spec.ts`); rules: every key; e2e: each published, axe on site and admin |
| 2   | Saved themes         | `SavedTheme`, `saved-theme.constants.ts`, `SavedThemesService` (admin routes), `savedThemes/{uuid}` in the rules with `isValidSavedTheme`                    | model, service; `firestore-saved-themes.rules.spec.ts` (owner, manager, hidden page, Backups only, outsider, bad shapes)          |
| 3   | Themes panel         | `ThemePanelViewModel` (dark and light groups, `savedMatch`, `themeLabel`, `chooseSaved`), the panel's template and styles, `ThemeSwatchComponent` on colours | view model, panel, swatch                                                                                                         |
| 4   | Saved themes panel   | `SavedThemesPanelComponent`, `SavedThemesViewModel`, `nameNotTakenValidator`, `SectionPanel.ThemeSaved`                                                      | view model, panel, validator; e2e: save and choose again, rename and delete, the contrast refusal, axe; three sizes               |
| 5   | Backups and records  | `BackupService` (reads, restores beside newer ones), `backup-file.ts` (accepts `savedThemes/{uuid}`); data model, component tree, CHANGELOG                  | backup service and file check                                                                                                     |

## Decisions & deviations from design

- **Sandstone's second accent is `#2f5a3b`, not `#3f6b4a`.** The design's colours passed the Theme page's contrast
  check, but axe on the published site found the contact note at 4.27:1: background-coloured text on the second
  accent lightened by a 10 % white tint. **That pair isn't in the contrast check** (a gap since 0021), so a custom
  light theme with a darker second accent could still publish it. See the open question below.
- **The site leaves `preset` out entirely** rather than keeping it as a checked string: nothing on the site used it. A
  name it doesn't know is accepted, so a theme from a newer release still shows. The first download is **unchanged**
  at 509.36 kB (the design expected slightly smaller): the enum hadn't been in it.
- **A saved theme's swatch counts as chosen even when its colours are a ready-made theme's**, and its name is the label.
  The design had the saved match only for "custom" colours, but a saved theme also holds the text and fonts, so it's
  the more exact answer. Both swatches show as pressed.
- **The panel is a named group, "Saved themes", not a region "Your themes".** The editor's cards are regions, and a
  nested one would make "Theme" ambiguous for assistive tech and for the e2e page object. "Your themes" stays the
  group of swatches.
- **A malformed saved theme in a backup is left out on restore**, not the whole file refused. The rules would refuse it
  anyway, and refusing the file after the drafts were restored would leave a half restore.
- **Screenshots only for the first four themes.** The twelve new ones are each published and checked by axe on the
  site and the admin. Pictures of each would have added 72 baselines for little gain.
- **The 20-theme limit is checked in unit tests, not e2e.** Filling 20 in the browser adds minutes for a single
  message.
- **No dependency added.**

## Open question for the owner

- **Add the contact note's pair to the contrast check?** It would stop any custom theme publishing that note below
  4.5:1. But the site also checks a published theme when it loads, so an already-published custom theme that fails the
  new pair would drop back to today's look until it's fixed. Recommended: a 2.9.1 patch that adds the pair to the
  Theme page's check, with the site's own check unchanged, so nothing live changes.

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-22.
