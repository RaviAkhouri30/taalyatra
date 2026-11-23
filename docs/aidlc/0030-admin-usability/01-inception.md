# 01 · Inception — An admin that's easier to use (2.14.0)

## Problem / goal

The owner walked through the admin and found it hard to read and, in places, hard to use (2026-11-23). A screenshot
tour of every admin page, on desktop and phone, confirmed it:

- **Dashboard:** ten cards that look the same, all text, so nothing says what needs attention first. The owner finds
  it cluttered.
- **Team access:** adding a manager means going to the Firebase console, creating the account there and copying a
  **User UID** back. The form's two boxes don't line up (the UID box is taller and sits lower), the long line
  explaining the three settings is too big, and each page's setting is a plain browser dropdown.
- **Dropdowns everywhere** (Leads' filters, choices in the editor, Team access) are the browser's own: taller or
  shorter than the text boxes beside them, with a cramped arrow.
- **Leads:** "Show all" sits alone on a row under the filters.
- **The publish bar** ("All changes published · Undo changes · Publish", both greyed out) shows on pages with nothing
  to publish: Dashboard, Photo library, Leads, Visits, Features, Team access, What's new.

**Goal:** a calmer, clearer admin: the dashboard says at a glance what needs you, each card's colour says what it's
about, adding a manager takes only their email, and every form control looks like it belongs.

## User stories

- **As the owner, I want the dashboard to show first what needs me** (changes to publish, approvals, a backup due,
  new leads), and to tell cards apart at a glance by their colour and icon.
- **As the owner, I want to add a manager with just their email**: the site creates their account and they get an
  email to set their own password. No Firebase console, no User UID.
- **As the owner, I want each page's setting to be a clear choice** of Hidden, Needs approval or Can publish, and to
  set them all at once.
- **As anyone using the admin, I want every dropdown and box to look the same**, the same height and style.
- **As anyone, I want the publish bar only where there's something to publish.**

## Acceptance criteria

- [ ] **Dashboard:** a "Needs you" row first, with only what's waiting (changes, approvals, a due backup, new leads),
      or a single "You're all caught up" line when nothing is. Then the other cards, grouped: **Your site** (offer,
      shown sections, history), **Visitors** (leads, visits, with a small 7-day chart in the Visits card), **News**
      (what's new). Each card has a coloured icon and a tint of its own colour, from the theme, so it fits all 16 themes
      and the owner's own; axe passes on three sizes.
- [ ] **Add a manager:** the form asks for their **email**, then what they can do. **Create and invite** creates their
      account and sends them Firebase's email to choose a password; their card appears at once. If they already have an
      account (or the project doesn't allow new accounts), the form says so and offers **Paste their User UID instead**,
      as today. The owner stays signed in throughout.
- [ ] **Each page's setting** is three buttons in a row (Hidden · Needs approval · Can publish), one pressed, with a
      **Set all to** choice above the list. The explanation becomes three small labelled chips.
- [ ] **The form's boxes line up:** same height, same label style, errors and hints under each.
- [ ] **Every dropdown** in the admin has the boxes' height, border and corner, with its own arrow, in every theme.
- [ ] **Leads:** "Show all" sits in the filters' row as a reset.
- [ ] **The publish bar** shows on editor pages, and elsewhere only while there are changes to publish.
- [ ] **No change to the public site.** Rules change only if inviting needs it (see D3).

## Units of work

1. **Dropdowns and boxes:** one style for every select in the admin; the publish bar's visibility; Leads' row.
2. **Team access:** the three-way setting and Set all; the chips; the aligned form.
3. **Invite by email:** an `IAuthService` method that creates the account and sends the email, through Firebase's
   own API, without signing the owner out; its Fake for tests; the form's fallback to the UID.
4. **Dashboard:** "Needs you", the groups, the colours and icons, the 7-day chart.
5. E2E, screenshots, axe on three sizes; the Theme spec marked slow (it times out under the full run's load).

## Decisions (recommendations; please confirm or change)

| #   | Question                                | Recommendation                                                                                                                                                                                                                                                                                                                                                                          |
| --- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | **How the manager's account is made**   | **Through Firebase's own sign-up API from the browser** (the site's public key, which it already uses), then Firebase's "set your password" email. It doesn't sign the owner out, needs no new secret and no change to the Azure function. The alternative, an Azure function with Firebase's admin key, could also find existing accounts by email, but adds a secret and a dependency |
| D2  | **The email they get**                  | **Firebase's password email**, which you can reword in the Firebase console (Authentication → Templates), e.g. "Set your password for the Taal Yatra admin". The site doesn't send its own                                                                                                                                                                                              |
| D3  | **If the project refuses new accounts** | **Fall back to pasting the UID**, with a line saying why. Firebase allows it unless "Enable create (sign-up)" was turned off; nothing in the rules changes, because a new account can do nothing until it's on Team access                                                                                                                                                              |
| D4  | **The dashboard's colours**             | **By purpose, as tints of the theme:** amber for what to publish, clay for approvals and backups, sage for leads, a cool blue for visits, violet for news, the theme's own for the site. Text keeps the theme's colours, so it stays readable; only icons and tints carry the colour                                                                                                    |
| D5  | **"Small graphs above the tiles"**      | I read this as the dashboard feeling crowded. The redesign puts the one chart (visits) inside its own card and the speed report at the end. **If you meant something else, tell me which graphs**                                                                                                                                                                                       |
| D6  | **Release**                             | **2.14.0.** The content programme moves again: hiding an item 2.15.0, the festival animations 2.16.0                                                                                                                                                                                                                                                                                    |

## Risks & open questions

- **Account creation from the browser** shows Firebase's raw errors; each is translated (email already used, sign-up
  turned off, too many attempts, a weak or missing email).
- **Email enumeration protection** (a Firebase setting) can hide "email already used"; then the invite still sends
  the password email to the existing account, and the owner pastes the UID as today. The design checks both cases.
- **Style budgets:** the dashboard's stylesheet is near 3 kB of its 4 kB; its cards may move to a component of their
  own.
- **Screenshots:** the dashboard and Team access baselines are re-recorded and checked by eye.

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-23, with D1–D6 as recommended.
