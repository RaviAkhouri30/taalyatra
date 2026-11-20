import { Pipe, type PipeTransform } from '@angular/core';
import { type IEditorSection } from '../models/i-editor-section';
import { type FieldSchema } from '../models/i-field-schema';
import { type SectionPanel } from '../models/section-panel.enum';

/** A run of a card's fields, with the panel shown above it, if any. */
export interface ISectionPart {
  readonly panel: SectionPanel | null;
  readonly fields: readonly FieldSchema[];
}

/**
 * A card's fields split where its panels go (0021), so the page can show each panel in its place.
 * A card without panels is one part.
 */
@Pipe({ name: 'sectionParts' })
export class SectionPartsPipe implements PipeTransform {
  /**
   * @param section The card's section.
   * @returns Its parts, in order.
   */
  public transform(section: IEditorSection): readonly ISectionPart[] {
    const panels = section.panels ?? [];
    const first = panels.filter((entry) => entry.after === null).map((entry) => entry.panel);
    const parts: { panel: SectionPanel | null; fields: FieldSchema[] }[] = [
      { panel: first[0] ?? null, fields: [] },
    ];
    for (const field of section.fields) {
      parts.at(-1)?.fields.push(field);
      for (const entry of panels.filter((candidate) => candidate.after === field.key)) {
        parts.push({ panel: entry.panel, fields: [] });
      }
    }
    return parts;
  }
}
