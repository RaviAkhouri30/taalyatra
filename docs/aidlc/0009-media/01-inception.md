# 01 · Inception — Media (1.7.0)

The programme was approved once, in the [0008 inception](../0008-admin-content-editor/01-inception.md),
which holds the problem, user stories, acceptance criteria and feature catalogue. This file only
records what release 1.7.0 takes from it.

## Goal

The owner can upload photos from a phone or computer, and manage the gallery, team, show formats and
videos without a developer.

## Scope

| Item     | Feature                                                                                     |
| -------- | ------------------------------------------------------------------------------------------- |
| G1–G9    | Upload, automatic optimisation, required descriptions, crop, library, replace, delete, privacy, limits |
| E1       | Gallery: add, remove, reorder, descriptions, section heading                                |
| E2       | Team: every field including skills, photo, add, remove, reorder                             |
| E3       | Show formats: every field including image, icon, featured and spotlight text                |
| E5       | Videos: YouTube link, title, category, caption, duration, thumbnail, reorder                |

## Moved out of 1.7.0 (proposed in the [design](02-design.md))

| Item | Feature                                | Goes to | Why                                                           |
| ---- | -------------------------------------- | ------- | ------------------------------------------------------------- |
| G10  | Logo, share image and avatar set       | 1.8.0   | The share image belongs with the SEO settings (I3)            |
| B4   | Hide one item without deleting it      | 1.8.0   | Already planned there                                         |
| —    | Images in experiences, drum circle and Instagram | 1.8.0 | Those documents become editable then; the image field is reused |
| G11  | PDF brochure or rate card              | Decide  | Decision 3 in the design                                      |

## Acceptance criteria for this release

- [ ] Given a phone photo with GPS data, when it's uploaded, then the stored file and every delivered
      image have no location data (checked on the real account).
- [ ] Given a 15 MB photo from a phone, when it's uploaded, then it goes through and is stored at no
      more than 2400 px wide.
- [ ] Given an image with no description, when the owner publishes, then publishing is blocked.
- [ ] Given a team photo, when the owner crops it, then the site shows that crop, and the same image
      used elsewhere keeps its own crop.
- [ ] Given an image used on the site or in a draft, when the owner tries to delete it, then the
      deletion is refused and the editor says where it's used.
- [ ] Given a change to the gallery, team, shows or videos, when it's published or undone, then all of
      it applies together, like any other publish.
- [ ] Given any account other than the admin, when it asks to sign an upload or delete an image, then
      the function refuses (tested).
- [ ] Given the public pages, when measured, then no editor or upload code is downloaded.

---

**Approval:** ☑ Approved as part of the 0008 programme by Ravi Akhouri on 2026-10-30. The scope
changes above are decided with the [design](02-design.md).
