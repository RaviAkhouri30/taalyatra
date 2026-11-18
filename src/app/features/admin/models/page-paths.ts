import { type DocumentFields } from '@core/interfaces/i-document-store';
import { EDITOR_TABS } from '../schemas/editor-tabs';
import { type EditorTab } from './editor-tab.enum';

function addTo<K, V>(map: Map<K, V[]>, key: K, value: V): void {
  const list = map.get(key) ?? [];
  if (!list.includes(value)) {
    list.push(value);
  }
  map.set(key, list);
}

function tabsByPath(): ReadonlyMap<string, readonly EditorTab[]> {
  const result = new Map<string, EditorTab[]>();
  for (const entry of EDITOR_TABS) {
    for (const section of entry.sections) {
      addTo(result, section.path, entry.tab);
    }
  }
  return result;
}

/** The editor pages that edit each stored document or collection (from the editor's schemas). */
export const TABS_BY_PATH = tabsByPath();

function partTabs(): ReadonlyMap<string, ReadonlyMap<string, EditorTab>> {
  const shared = [...TABS_BY_PATH].filter(([, tabs]) => tabs.length > 1).map(([path]) => path);
  return new Map(
    shared.map((path) => [
      path,
      new Map(
        EDITOR_TABS.flatMap((entry) =>
          entry.sections
            .filter((section) => section.path.toString() === path)
            .flatMap((section) => section.fields.map((field) => [field.key, entry.tab] as const)),
        ),
      ),
    ]),
  );
}

/**
 * For a document several pages share (`site/config`: Offer, Business details, Contact & social
 * links), the page each top-level part belongs to. `firestore.rules` lists the same parts; a part no
 * page edits is the owner's only.
 */
export const PART_TABS = partTabs();

/** What a change touches. */
export interface IChangedPages {
  /** The pages whose parts it changes. */
  readonly tabs: readonly EditorTab[];
  /** It changes something no editor page edits, which only the owner may publish. */
  readonly ownerOnly: boolean;
}

function changedKeys(content: DocumentFields, live: DocumentFields | null): string[] {
  const before = new Map(Object.entries(live ?? {}));
  const after = new Map(Object.entries(content));
  const keys = new Set([...before.keys(), ...after.keys()]);
  return [...keys].filter(
    (key) => JSON.stringify(before.get(key)) !== JSON.stringify(after.get(key)),
  );
}

/**
 * @param path The document a draft changes.
 * @param content The draft's content.
 * @param live What's published there now; only read for a shared document.
 * @returns The pages the change touches.
 */
export function changedPages(
  path: string,
  content: DocumentFields,
  live: DocumentFields | null,
): IChangedPages {
  const parts = PART_TABS.get(path);
  if (!parts) {
    const tabs = TABS_BY_PATH.get(path) ?? [];
    return { tabs, ownerOnly: tabs.length === 0 };
  }
  const keys = changedKeys(content, live);
  const tabs = [...new Set(keys.flatMap((key) => parts.get(key) ?? []))];
  return { tabs, ownerOnly: keys.some((key) => !parts.has(key)) };
}
