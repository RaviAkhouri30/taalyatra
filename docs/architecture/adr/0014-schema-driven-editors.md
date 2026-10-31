# ADR-0014: Schema-driven editors

- **Status:** Accepted · **Date:** 2026-10-31 · **Version:** 1.6.0

## Context

1.6.0 edits about ten documents, and 1.8.0 adds every other section and page. A hand-written
form per document would mean dozens of near-identical components, and each one could drift from
the stored shape, which `firestore.rules` checks.

## Decision

- Each editor card is an `IEditorSection`: a document path, a preview anchor, a tip, and a list of
  `FieldSchema`s. Field kinds: text, multi-line, link, phone, email, date, number, switch, choice,
  group (a nested object) and list (add, move, remove).
- `buildFormGroup` builds typed reactive controls from a schema, with validators from it
  (required, length, format). `readSchemaValue` and `mergeSchemaValue` write values back into
  the stored document and leave fields the editor doesn't cover untouched.
- `SchemaFieldsComponent` (groups, lists) and `SchemaFieldComponent` (one labelled field with its
  hint, counter and error) render any schema accessibly. One `EditorPageComponent` serves every
  tab, told its tab through route data.
- Tabs are listed in `EDITOR_TABS`; a new tab is a new entry with its sections.
- **Drift guard:** a spec checks that every field a schema edits exists in the matching document
  in `fake-db.json`.
- Editor labels and hints live in code with the schemas: they describe the data model, change
  with it, and aren't site content.

## Consequences

- Adding an editable section is data, not a component: later releases mostly add schemas.
- Click-to-edit on the page (prototype) isn't possible this way; labelled fields beside a live
  preview are used instead (0008 D8, ADR-0008).
- Validation shows in the form and is re-run before publishing (`PublishReport`), with the same
  messages.
