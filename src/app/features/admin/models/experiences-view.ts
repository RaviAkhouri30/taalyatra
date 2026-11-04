import { type DocumentFields } from '@core/interfaces/i-document-store';
import { entriesOf, fieldOf } from '../forms/json-node';
import { type ISectionView } from './i-editor-section';

/** The one list field the editor shows for this document. */
export const EXPERIENCE_CARDS_FIELD = 'cards';

/** Used if a card becomes featured with no button text of its own. */
export const FEATURED_CTA_DEFAULT = 'See full details';

function asFields(value: unknown): readonly DocumentFields[] {
  return (Array.isArray(value) ? value : []).filter(
    (item: unknown): item is DocumentFields => typeof item === 'object' && item !== null,
  );
}

/** @returns A copy of the fields without the named ones. */
function without(fields: DocumentFields, ...keys: readonly string[]): DocumentFields {
  const copy = entriesOf(fields);
  keys.forEach((key) => copy.delete(key));
  return Object.fromEntries(copy);
}

/** @returns The filter chips: existing ones still in use, in order, then any new categories. */
function usedCategories(stored: DocumentFields, cards: readonly DocumentFields[]): string[] {
  const used = cards.flatMap((card) => {
    const category = fieldOf(card, 'category');
    return typeof category === 'string' && category.trim() ? [category.trim()] : [];
  });
  const existing = fieldOf(stored, 'categories');
  const kept = (Array.isArray(existing) ? existing : []).filter(
    (category): category is string => typeof category === 'string' && used.includes(category),
  );
  return [...new Set([...kept, ...used])];
}

/**
 * Shows `home/experiences`, stored as one `featured` card plus a list of `items`, as one list with a
 * Featured switch, like the show formats. The stored shape stays, so the site and `firestore.rules`
 * are unchanged.
 */
export const EXPERIENCES_VIEW: ISectionView = {
  read(stored) {
    const featured = fieldOf(stored, 'featured');
    const lead =
      typeof featured === 'object' && featured !== null
        ? [
            {
              ...without(featured as DocumentFields, 'cta'),
              featured: true,
              spotlight: { cta: fieldOf(featured, 'cta') },
            },
          ]
        : [];
    const others = asFields(fieldOf(stored, 'items')).map((item) => ({
      ...item,
      featured: false,
      spotlight: null,
    }));
    return { [EXPERIENCE_CARDS_FIELD]: [...lead, ...others] };
  },

  write(stored, edited) {
    const cards = asFields(fieldOf(edited, EXPERIENCE_CARDS_FIELD));
    // The switch keeps one on, but this is the stored shape's rule, so it holds whatever arrives.
    const lead = cards.find((card) => fieldOf(card, 'featured') === true) ?? cards[0];
    if (lead === undefined) {
      return stored;
    }
    const cta = fieldOf(fieldOf(lead, 'spotlight'), 'cta');
    return {
      ...stored,
      categories: usedCategories(stored, cards),
      featured: {
        ...without(lead, 'featured', 'spotlight'),
        cta: typeof cta === 'string' && cta.trim() ? cta : FEATURED_CTA_DEFAULT,
      },
      items: cards
        .filter((card) => card !== lead)
        .map((card) => without(card, 'featured', 'spotlight')),
    };
  },
};
