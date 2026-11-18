# 02 · Design — Nothing lost, and what's new (1.12.0)

Everything here is in the admin area, which is lazy-loaded: the public site's download doesn't change.

## V1 · Releases page

- **Source of truth: `CHANGELOG.md` itself.** The build bundles it as text into the admin chunk (an `angular.json` loader
  for `.md`), and a small parser turns its Keep a Changelog sections into releases: version, date, and the Added / Changed /
  Fixed lists. Nothing is copied by hand, so the page can't disagree with the real releases. The version comes from
  `package.json`.
- **Where:** a **What's new** link at the bottom of the side panel, and a card on the dashboard with the current version, its
  date and its first three lines, linking to the page. The page lists every release, newest first; each opens to its notes.
- **"New" dot:** on the side-panel link until the owner opens the page after an update. The last version seen is kept in this
  browser (`LocalStoreService`); a new device simply shows the dot once.
- **Wording:** release notes are written for the owner already (plain language, CLAUDE.md §12). `[Unreleased]` isn't shown.

## V13 · Backups

### What a backup holds

One JSON file, `taal-yatra-backup-2026-11-18.json`:

```json
{ "format": 1, "site": "taal-yatra", "version": "1.11.0", "createdAt": "…", "documents": { "home/hero": { … }, "team/001": { … } } }
```

- **Included:** every document the editor can change (`ContentPath`: site settings, home sections, the four collections'
  items), and the media library's index (`media/*`), so photos' descriptions and crops come back with it.
- **Not included:** drafts, publish history and speed reports (they rebuild themselves), and **leads**: the rules don't let
  the editor read proposals yet. The Leads page (1.13.0) adds that, and with it a "Include leads" tick box (programme D6).
- **Photos themselves** stay in Cloudinary; the backup holds their addresses. Deleting a photo from the library still
  removes it for good, as the library already warns.

### Making one

- **After every publish**, the confirmation offers **Download a backup**.
- **Dashboard and Review & publish** show when the last backup was made, and a reminder when it's over **14 days** or there's
  none. "Last backup" is stored in Firestore (`adminState/backups`, admin only), so it's right on every device. **Rules
  change:** a new admin-only `adminState/{doc}` match, tested on the emulator; deployed before merging.
- **Two copies**, as the owner asked: the downloaded file, and the same backup in this browser (`localStorage`, the latest one
  only). A backup that doesn't fit (over about 4 MB; today's content is about 0.2 MB) is downloaded only, and says so.

### Restoring one

- **From a file** (the restore button opens the file picker) or **from this browser's copy**.
- **Checked first:** it must be valid JSON, `format` 1, `site` "taal-yatra", and only known paths. Anything else is refused,
  with the reason, and nothing changes.
- **Restore = drafts, never straight to the site.** Every document in the backup becomes the draft of its path. Review &
  publish then lists what's different from the live site, and the owner publishes as usual, or discards. A collection's
  items are restored as its whole list.

### Ports

Downloading and reading a file are browser work, so they sit behind a small port, `IFileService`
(`download(name, text)`, `read(file): Observable<string>`), with a browser adapter in `core/backends/browser` and a fake for
tests, provided on the admin routes like `IMediaService`.

## V3 · Going back to an earlier publish

- **Keeps 20 publishes** (unchanged, the owner's choice).
- Each history entry's **Undo this publish** becomes **Go back to before this publish**, and asks first:

  > Going back replaces what's on the site with the version from before this publish. **Anything published after it will be
  > replaced too, and is hard to get back unless you have a backup on this device.**
  > [Download a backup first] [Go back] [Cancel]

  For the newest publish, the second sentence is left out: there's nothing after it.

- As today, going back puts the old versions into the draft; the owner reviews and publishes.

## V2 · Safety copy of unsaved changes

- **When:** the moment a change is made, the editor already marks it as unsaved; it now also writes the section's document to
  this browser (`localStorage`, key per document path) with the time. When the draft save succeeds, the copy is removed.
- **When it's offered:** opening a tab whose document has a safety copy newer than its draft shows a bar above the cards:
  _"Changes made on this device on 18 Nov, 10:42, weren't saved."_ **[Restore them]** **[Throw them away]**. Restoring puts
  them in the form, which saves them as usual.
- **Only for the admin area**, and only the owner's own unsaved changes: the copy holds content, never passwords or tokens.

## Testing

- **Unit:** the changelog parser (sections, empty sections, `[Unreleased]` skipped); the "New" dot; backup building and
  every refusal on restore; restore into drafts; the reminder's 14-day rule; the go-back warning with and without later
  publishes; the safety copy written, cleared on save, offered and discarded.
- **Rules:** `adminState` readable and writable by the admin only.
- **E2E (three screen sizes):** download a backup after publishing; restore it and see the review list; go back with the
  warning; reload with an unsaved change kept and restore it; open What's new.
- **Speed:** the public initial download unchanged.

## Decisions (recommendations)

| #   | Decision                    | Recommendation                                                                   |
| --- | --------------------------- | -------------------------------------------------------------------------------- |
| 1   | Release notes source        | `CHANGELOG.md`, bundled at build time                                            |
| 2   | Where "last backup" is kept | Firestore (`adminState/backups`), so every device agrees; needs one rules change |
| 3   | Reminder after              | 14 days                                                                          |
| 4   | Browser copy                | The latest backup only                                                           |
| 5   | Restore goes to             | The drafts, then Review & publish, never straight to the site                    |
| 6   | Leads in backups            | Not yet: they come with the Leads page (1.13.0) and its tick box                 |

---

**Approval:** ☑ Approved by Ravi Akhouri on 2026-11-18, with decisions 1–6 as recommended.
