# 01 · Inception — Guided tour, features showcase and an easier admin (2.1.0)

From the [version 2 programme](../0014-version-2/01-inception.md): V9 guided tour, V18 features showcase (added by the owner
on 2026-11-19) and V6 intuitive admin pass. All three are in the admin area only, so the public site and its first download
don't change.

## Problem / goal

The admin area has grown to 20 pages over 2.0.0: drafts, previews, approvals, backups, leads, visits, Team access. The owner
learnt it as it was built; a new manager meets all of it at once, with no one beside them. Each person should be able to
find what the website does, where each thing is changed, and what their own account may do, without asking.

## User stories

- **As a new manager, I want to be shown around** on my first sign-in, so I know where my pages are, how drafts and preview
  work, and how to send a change for approval. (V9)
- **As the owner, I want the same tour for my side**, including approvals, Team access, backups and leads, and to replay it
  after an update. (V9)
- **As the owner or a manager, I want one page that shows what the website does**: each feature with a short description, a
  link to see it on the site and a link to where it's changed, limited to what my account can use. (V18)
- **As either of us, I want the admin to explain itself where I am**: what a page changes on the site, what to do when it's
  empty, and plain words instead of technical ones. (V6)

## Acceptance criteria

- [ ] Given a first sign-in on a device, when the editor opens, then the tour offers itself (start, or later); given **Help →
      Take the tour**, then it runs again at any time.
- [ ] Given the tour, then each step highlights one real area, says what it's for in one or two sentences, and offers Next,
      Back and Close; keyboard, screen readers and "reduce motion" are supported, and closing returns focus where it was.
- [ ] Given a manager, then the tour shows only the pages and actions their account has (no Leads, Visits, backups or Team
      access; uploads only when allowed); given the owner, then it includes them.
- [ ] Given **Features** in the menu, then every feature of the public site and of the admin is listed with a description, a
      **See it on the site** link (for site features) and a **Change it** link to its editor page, grouped as the menu is.
- [ ] Given a manager, then a feature whose page is hidden for them is listed as "managed by the owner", without a link to change
      it; nothing of the owner's own areas is offered.
- [ ] Given each editor page, then it says in one line what it changes on the site, and an empty list says what to add and how.
- [ ] Given the changes, then axe finds no WCAG 2.2 AA violations on the tour, the Features page and the changed pages, on all
      three screen sizes; the public site's first download is unchanged.

## Units of work

1. **Tour engine:** a highlight and a step card (no new dependency), focus kept in the card, Escape closes, works on phones
   where the menu is a drawer; steps are data, so they're easy to change.
2. **Tour steps** for the owner and for a manager, built from the same `Permissions` the menu uses; a test fails if a step's
   target disappears from the page.
3. **Help menu** in the top bar: Take the tour, Features, What's new.
4. **Features page:** a list of features as data (site and admin), filtered by permissions, with links to the site and to the
   editor.
5. **Easier admin pass:** a walkthrough of every page with the owner, then the agreed fixes: one-line page descriptions, empty
   states, clearer words, and anything the walkthrough finds.
6. Tests (unit, e2e on three sizes, axe), records, CHANGELOG, release 2.1.0.

## Decisions for the owner

| #   | Decision                          | Recommendation                                                                                                                                                                                                 |
| --- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | **Tour: our own or a library**    | **Our own**, built with what the admin already has: no dependency, our design and accessibility, and steps tied to our pages. Libraries like Driver.js save little and bring their own look and focus handling |
| D2  | **When the tour offers itself**   | On the **first sign-in on each device**, remembered in that browser, and after a release that changes the tour; never more than once without asking. Always available from Help                                |
| D3  | **Pictures on the Features page** | **The feature's icon and live links**, not screenshots: screenshots go out of date with every content change, and **See it on the site** opens the real thing                                                  |
| D4  | **The easier admin pass**         | A **20-minute walkthrough** with you (on a call or by notes on each page), turned into a list you approve before I change anything. Anything big becomes its own later release                                 |

## Risks & open questions

- **The tour falls behind the pages.** Mitigation: steps point at named areas, and a test opens each step and fails when its
  area is missing.
- **Overlays are easy to get wrong for keyboards and screen readers.** Mitigation: a dialog with focus kept inside, Escape,
  visible focus, and axe plus keyboard e2e on each size.
- **Scope of V6** depends on the walkthrough: it's limited to fixes within the existing pages; new features found there are
  listed for later.

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-20, with D1–D4 as recommended.
