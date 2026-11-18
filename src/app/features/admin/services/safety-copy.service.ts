import { Service, inject } from '@angular/core';
import { type DocumentFields } from '@core/interfaces/i-document-store';
import { DeviceStoreService } from './device-store.service';
import { CLOCK } from '@core/tokens/clock.token';
import { fieldOf } from '../forms/json-node';

/** Where this browser keeps a document's unsaved changes, followed by the document's path. */
export const SAFETY_COPY_KEY_PREFIX = 'taal-yatra.admin.unsaved.';

/** A document's changes, kept on this device until its draft is saved (0016 V2). */
export interface ISafetyCopy {
  readonly path: string;
  readonly content: DocumentFields;
  /** When the change was made (ISO 8601). */
  readonly savedAt: string;
}

function isFields(value: unknown): value is DocumentFields {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parse(text: string | null): unknown {
  try {
    return text === null ? null : JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * The safety copy (0016 V2): the moment a change is made, the editor keeps the document in this
 * browser, so going offline or a failed save loses nothing. It holds the owner's content only,
 * never passwords or tokens.
 */
@Service()
export class SafetyCopyService {
  private readonly deviceStore = inject(DeviceStoreService);
  private readonly clock = inject(CLOCK);

  /**
   * @param path The document's path.
   * @param content The whole document, with the change.
   */
  public keep(path: string, content: DocumentFields): void {
    const savedAt = this.clock.now().toISOString();
    this.deviceStore.set(SAFETY_COPY_KEY_PREFIX + path, JSON.stringify({ content, savedAt }));
  }

  /**
   * @param path A document's path.
   * @returns Its safety copy, or `null` when there's none (or it's unreadable).
   */
  public find(path: string): ISafetyCopy | null {
    const stored = parse(this.deviceStore.get(SAFETY_COPY_KEY_PREFIX + path));
    const content = fieldOf(stored, 'content');
    const savedAt = fieldOf(stored, 'savedAt');
    return isFields(content) && typeof savedAt === 'string' ? { path, content, savedAt } : null;
  }

  /**
   * Drops the copy once its change is safely saved; a newer change's copy stays.
   * @param path The document's path.
   * @param saved What was just saved.
   */
  public clearIfSaved(path: string, saved: DocumentFields): void {
    const copy = this.find(path);
    if (copy && JSON.stringify(copy.content) === JSON.stringify(saved)) {
      this.clear(path);
    }
  }

  /**
   * @param paths The documents a page edits.
   * @param loaded What the page loaded for each, by path.
   * @returns The copies holding changes that never reached the draft. Copies matching what was
   *   loaded were saved after all (the tab closed before they were dropped), so they go.
   */
  public unsaved(
    paths: readonly string[],
    loaded: ReadonlyMap<string, DocumentFields>,
  ): ISafetyCopy[] {
    return paths.flatMap((path) => {
      const copy = this.find(path);
      if (copy === null) {
        return [];
      }
      if (JSON.stringify(copy.content) === JSON.stringify(loaded.get(path))) {
        this.clear(path);
        return [];
      }
      return [copy];
    });
  }

  /** @param path The document whose copy to drop. */
  public clear(path: string): void {
    this.deviceStore.remove(SAFETY_COPY_KEY_PREFIX + path);
  }
}
