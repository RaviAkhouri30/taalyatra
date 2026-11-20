import { FieldKind } from './field-kind.enum';
import { type FieldSchema } from './i-field-schema';
import { EditorTab } from './editor-tab.enum';
import { type IEditorTabSchema } from '../schemas/editor-tabs';

/** One thing the Find box can take the owner to. */
export interface IFindEntry {
  /** What it's called, e.g. "Phone". */
  readonly label: string;
  /** Where it is, e.g. "Contact details · Contact & social links". */
  readonly context: string;
  /** The tab's address. */
  readonly url: string;
  /** The field's or card's element id. */
  readonly fragment: string;
  /** The card's element id, used if the field isn't showing. */
  readonly fallback: string;
  /** Everything it matches on, lower-cased. */
  readonly haystack: string;
}

/** How well a result matches: its name starts with the query, contains it, or only its context does. */
enum Rank {
  Starts,
  Contains,
  Elsewhere,
}

/** The most results the Find box lists. */
export const FIND_MAX_RESULTS = 8;

/** Everyday words people type for a tab, which its labels don't say. */
const KEYWORDS: Partial<Record<EditorTab, string>> = {
  [EditorTab.Hero]: 'top banner headline first screen',
  [EditorTab.Offer]: 'diwali festival discount promotion deal',
  [EditorTab.DrumCircle]: 'about djembe signature',
  [EditorTab.Team]: 'people members staff facilitators',
  [EditorTab.Gallery]: 'photos pictures images',
  [EditorTab.Videos]: 'youtube clips',
  [EditorTab.Business]: 'name logo tagline description search google',
  [EditorTab.Contact]: 'phone number email address whatsapp instagram youtube map social',
  [EditorTab.Visibility]: 'hide show turn off switch fold collapse',
  [EditorTab.Theme]: 'colour color theme palette font background dark light contrast style',
  [EditorTab.ProposalForm]: 'enquiry booking form request',
};

function entry(
  label: string,
  context: string,
  where: { readonly url: string; readonly fragment: string; readonly fallback: string },
  keywords: string,
): IFindEntry {
  return { label, context, ...where, haystack: `${label} ${context} ${keywords}`.toLowerCase() };
}

/** @returns The fields a card shows, with their element ids; groups opened, lists as one entry. */
function fieldsOf(
  fields: readonly FieldSchema[],
  prefix: string,
): { readonly field: FieldSchema; readonly id: string }[] {
  return fields.flatMap((field) => {
    const id = `${prefix}-${field.key}`;
    return field.kind === FieldKind.Group ? fieldsOf(field.fields, id) : [{ field, id }];
  });
}

/** @returns A card's entries: the card itself, then its fields. */
function cardEntries(
  section: IEditorTabSchema['sections'][number],
  tab: IEditorTabSchema,
  url: string,
  keywords: string,
): IFindEntry[] {
  const card = `card-${section.id}`;
  return [
    entry(section.title, tab.label, { url, fragment: card, fallback: card }, keywords),
    ...fieldsOf(section.fields, `field-${section.id}`).map(({ field, id }) =>
      entry(
        field.label,
        `${section.title} · ${tab.label}`,
        // A list's items fold away, so a list goes to its card.
        { url, fragment: field.kind === FieldKind.List ? card : id, fallback: card },
        keywords,
      ),
    ),
  ];
}

/**
 * @param tabs The editor's tabs.
 * @param tabUrl The address of a tab.
 * @returns Every tab, card and field, ready to search.
 */
export function buildFindIndex(
  tabs: readonly IEditorTabSchema[],
  tabUrl: (tab: EditorTab) => string,
): readonly IFindEntry[] {
  return tabs.flatMap((tab) => {
    const url = tabUrl(tab.tab);
    const keywords = KEYWORDS[tab.tab] ?? '';
    const first = `card-${tab.sections[0]?.id ?? ''}`;
    return [
      entry(
        tab.label,
        'Section of the site',
        { url, fragment: first, fallback: first },
        `${tab.description} ${keywords}`,
      ),
      // Everyday words find the section, not every field in it: "about" shouldn't list "Facts".
      ...tab.sections.flatMap((section) => cardEntries(section, tab, url, '')),
    ];
  });
}

/**
 * @param index Everything searchable.
 * @param query What the owner typed.
 * @returns The best matches: every word must match; names that start with the query come first.
 */
export function findIn(index: readonly IFindEntry[], query: string): readonly IFindEntry[] {
  const words = query.toLowerCase().split(/\s+/u).filter(Boolean);
  if (words.length === 0) {
    return [];
  }
  const phrase = words.join(' ');
  const rank = (found: IFindEntry): Rank => {
    const label = found.label.toLowerCase();
    if (label.startsWith(phrase)) {
      return Rank.Starts;
    }
    return label.includes(phrase) ? Rank.Contains : Rank.Elsewhere;
  };
  return index
    .filter((found) => words.every((word) => found.haystack.includes(word)))
    .map((found, order) => ({ found, order, rank: rank(found) }))
    .sort((a, b) => a.rank - b.rank || a.order - b.order)
    .slice(0, FIND_MAX_RESULTS)
    .map(({ found }) => found);
}
