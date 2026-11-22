# 01 · Inception — More themes, and your own saved (2.9.0)

From the [version 2 programme](../0014-version-2/01-inception.md): V23, added by the owner on 2026-11-21 after using the
themes (0021, 2.2.0), to come last: **at least 10 more ready-made themes** on the Theme page, and a theme you make
**saved under a name**, listed beside the ready-made ones to pick again later. Each passes the same contrast check.

## Problem / goal

The Theme page offers four ready-made themes: Warm night, Daylight, Festival and High contrast. Anything else has to be
made by hand from six colours, and a theme you made is lost as soon as you choose another: going back means typing
the colours in again. The owner wants more starting points, for seasons, festivals and corporate events, and wants to
keep the themes they make so they can switch between them.

## What's true today (checked 2026-11-22)

- **A theme** is one site document, `site/theme`: six colours, background, text size, heading weight, fonts, and which
  ready-made theme it came from (`preset`, or `custom` once a colour changes, shown as "Daylight, adjusted").
- **Choosing a ready-made theme** fills the six colours and the background only. Text and fonts stay as they are (0021
  decision 4).
- **The contrast check** (WCAG 2.2 AA, 4.5:1 for text and 3:1 for edges) blocks publishing a hard-to-read theme, and the
  site checks again when it loads one.
- **The rules** accept only the four ready-made names in `preset`, so every new theme needs a rules change.
- **The ready-made list** is admin code only. The public site doesn't load it, so more themes don't add to its first
  download. The 2.8.0 build is 0.64 kB under the 510 kB warning.

## User stories

- **As the owner, I want more ready-made themes**, so I can start from one that fits the season or the event.
- **As the owner, I want to save the theme I made under a name**, so I can pick it again later without typing colours.
- **As the owner, I want my saved themes listed beside the ready-made ones**, and to rename or delete them.
- **As a manager with the Theme page**, I want the same, within the permissions I already have for that page.

## Acceptance criteria

- [ ] Given the Theme page, then it offers **at least 14 ready-made themes**: the 4 from 2.2.0 plus at least 10 new
      ones. Each passes every contrast pair, which a unit test checks for every theme.
- [ ] Given a theme on the page, when I choose **Save as my theme** and give it a name, then it's listed under **Your
      themes**, on this device and every other.
- [ ] Given a saved theme, when I choose it, then the form is filled from it as a draft, like any change. Nothing goes
      live until it's published, with approval where the page needs it.
- [ ] Given a saved theme, when I rename or delete it, then the list changes. The published site doesn't, even if
      the deleted theme is the one in use.
- [ ] Given saving a theme that fails the contrast check, then it isn't saved, and the page says which pair fails.
- [ ] Given a visitor, then nothing about the public site changes, its first download included.
- [ ] Given the changes, then axe finds no WCAG 2.2 AA violations on the Theme page, on three sizes.

## Units of work

1. **Ready-made themes:** 12 new ones (D1), with their colours checked by the contrast test. They're added to the
   rules' list and the swatch panel.
2. **Your themes:** save, pick, rename and delete, kept in a theme library of their own (D3), with rules and rules
   tests.
3. **The page:** the swatches grouped so 16 themes and the saved ones stay easy to scan (D5).
4. **Backups:** the library goes in the backup file and comes back on restore (D6).
5. Tests (unit, rules on the emulator, e2e on three sizes with axe), records, CHANGELOG, release 2.9.0, `deploy:rules`.

## Decisions for the owner

| #   | Decision                     | Recommendation                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| --- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | **Which new themes**         | **12, half dark and half light.** Dark: **Indigo night**, **Monsoon** (deep teal), **Forest**, **Diwali** (plum and gold), **Ocean** (navy and coral), **Charcoal** (neutral, for corporate). Light: **Marigold** (cream and saffron), **Sandstone** (sand and terracotta), **Holi** (white, magenta and teal), **Mint**, **Rose** (blush and maroon), **Slate** (grey-white and navy, for corporate). Exact colours in the design. Rename or swap any you like |
| D2  | **What a saved theme holds** | **Everything on the page:** the six colours, background, text size, heading weight and fonts. It's your whole look, so picking it brings all of it back. Ready-made themes keep filling only the colours and background, as today                                                                                                                                                                                                                               |
| D3  | **Where saved themes live**  | **In a theme library of their own, apart from the site.** Saving one doesn't change the site, so it needs no draft, approval or publish, and visitors never download it. Anyone who can open the Theme page can save, pick, rename and delete. Only publishing goes through the page's approval, as today                                                                                                                                                       |
| D4  | **Limits**                   | **Up to 20 saved themes, each with a name of up to 40 characters, different from the others.** The rules check these too                                                                                                                                                                                                                                                                                                                                        |
| D5  | **How the page lists them**  | **Three groups of swatches: Your themes (first, when there are any), Dark, Light.** Each keeps today's swatch and its pressed state. The theme in the form is marked, and a saved one reads "Your theme: Spring show" instead of "custom"                                                                                                                                                                                                                       |
| D6  | **Backups**                  | **The library goes in the backup file and comes back on restore**, as the rest of the content does. Restoring it replaces the list                                                                                                                                                                                                                                                                                                                              |

## Risks & open questions

- **Rules change.** The `preset` list grows and the library is new. Mitigation: rules tests on the emulator for each
  role (owner, manager with and without the Theme page, visitor), and `npm run deploy:rules` with the release.
- **Download headroom.** The site's theme model checks `preset` against the list of names, so 12 more names would add a
  few hundred bytes to the first download, which has only 0.64 kB to spare. Mitigation: the site stops checking the
  name, since it doesn't change how the site looks. The swatches and their colours stay in admin code.
- **A saved theme that later fails the check.** It can't happen while the check is the same: a theme is checked when
  it's saved and again when it's published. If the check ever gets stricter, an old saved theme would be marked
  and blocked at publish, never applied.
- **Two people saving at once.** The library is one document written in a transaction, so neither save is lost.

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-22, with D1–D6 as recommended.
