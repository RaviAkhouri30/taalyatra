import { type DocumentFields } from '@core/interfaces/i-document-store';
import { schemaLeaves } from '../forms/schema-leaves';
import { toImage } from '../forms/image-value';
import { FieldKind } from './field-kind.enum';
import { type IEditorSection } from './i-editor-section';
import { parseImageSrc } from './image-src';
import { type MediaAsset } from './media-asset.model';

/** One place an uploaded image appears. */
export interface IMediaUse {
  /** The library entry's id. */
  readonly id: string;
  /** Where it is, the way the owner sees it, e.g. "Team members · Team member 2 · Photo". */
  readonly label: string;
}

/**
 * @param section An editor section.
 * @param content Its document.
 * @returns Every uploaded image the section's image fields show. Local images aren't included.
 */
export function imageUsesIn(section: IEditorSection, content: unknown): IMediaUse[] {
  return schemaLeaves(section.fields, content).flatMap((leaf) => {
    const parsed =
      leaf.field.kind === FieldKind.Image ? parseImageSrc(toImage(leaf.value).src) : null;
    return parsed === null ? [] : [{ id: parsed.id, label: `${section.title} · ${leaf.label}` }];
  });
}

function isImageOf(value: object, id: string): value is DocumentFields {
  const src: unknown = new Map(Object.entries(value)).get('src');
  return typeof src === 'string' && parseImageSrc(src)?.id === id;
}

/**
 * Points every use of one file at another (D19). Descriptions stay. Crops go, because their numbers
 * belong to the old file: a stale crop could cut off the wrong part or fall outside the new one.
 *
 * @param value A document, or any part of one.
 * @param id The old file's library id.
 * @param next The new file.
 * @returns A copy with each use rewritten.
 */
export function replaceImage(value: unknown, id: string, next: MediaAsset): unknown {
  if (Array.isArray(value)) {
    return value.map((item: unknown) => replaceImage(item, id, next));
  }
  if (typeof value !== 'object' || value === null) {
    return value;
  }
  if (isImageOf(value, id)) {
    return { ...value, src: next.src, width: next.dto.width, height: next.dto.height };
  }
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, replaceImage(item, id, next)]),
  );
}
