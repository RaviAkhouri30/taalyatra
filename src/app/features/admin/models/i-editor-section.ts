import { type DocumentFields } from '@core/interfaces/i-document-store';
import { type PageAnchor } from '@shared/enums/page-anchor.enum';
import { type ContentPath } from './content-path.enum';
import { type FieldSchema } from './i-field-schema';

/**
 * How a section's fields map onto a document stored in another shape, for when the editor should
 * show it differently from how the site reads it.
 */
export interface ISectionView {
  /**
   * @param stored The stored document.
   * @returns What the section's fields edit.
   */
  read(stored: unknown): DocumentFields;
  /**
   * @param stored The stored document.
   * @param edited The values read from the form.
   * @returns The document to store.
   */
  write(stored: DocumentFields, edited: DocumentFields): DocumentFields;
}

/** One card in an editor tab: some fields of one stored document. */
export interface IEditorSection {
  /** Unique within the editor, used for ids. */
  readonly id: string;
  /** The card's heading, e.g. "Hero". */
  readonly title: string;
  /** The document these fields belong to. */
  readonly path: ContentPath;
  /** Where the live preview scrolls while this section is edited. */
  readonly anchor: PageAnchor;
  readonly fields: readonly FieldSchema[];
  /** Set when the fields don't match the stored shape directly. */
  readonly view?: ISectionView;
  /** A writing tip shown beside the card. */
  readonly tip?: string;
}
