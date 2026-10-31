import { type PageAnchor } from '@shared/enums/page-anchor.enum';
import { type ContentPath } from './content-path.enum';
import { type FieldSchema } from './i-field-schema';

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
  /** A writing tip shown beside the card. */
  readonly tip?: string;
}
