import { CONTENT_MAX_LENGTH, DRUM_CIRCLE_ITEMS } from '@shared/constants/content-limits.constants';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { ContentPath } from '../models/content-path.enum';
import { FieldKind } from '../models/field-kind.enum';
import { type IEditorSection } from '../models/i-editor-section';
import { type IListFieldSchema } from '../models/i-field-schema';
import { IMAGE_ASPECT } from '../models/image-aspect.constants';
import { HEADING_FIELDS, buttonLabel, image, multiline, text } from './schema-fields';

const { eyebrow, title } = HEADING_FIELDS;
const { drumCircleChip, drumCircleFlowStep, drumCircleFlowUnit } = CONTENT_MAX_LENGTH;
const ITEMS = DRUM_CIRCLE_ITEMS;

/** A heading above one of the section's lists, e.g. "Objectives". */
function heading(key: string, label: string): ReturnType<typeof text> {
  return text(key, label, { maxLength: CONTENT_MAX_LENGTH.eyebrow });
}

/** A list of short labels, shown as chips or links. */
function chips(
  key: string,
  label: string,
  item: string,
  limits: { readonly min: number; readonly max: number },
): IListFieldSchema {
  return {
    key,
    label,
    kind: FieldKind.List,
    addLabel: `Add ${item.toLowerCase()}`,
    minItems: limits.min,
    maxItems: limits.max,
    item: text(key, item, { required: true, maxLength: drumCircleChip }),
  };
}

const facts: IListFieldSchema = {
  key: 'specs',
  label: 'Facts',
  kind: FieldKind.List,
  addLabel: 'Add fact',
  minItems: ITEMS.facts,
  maxItems: ITEMS.facts,
  item: {
    key: 'item',
    label: 'Fact',
    kind: FieldKind.Group,
    fields: [
      text('label', 'Label', { required: true, maxLength: CONTENT_MAX_LENGTH.drumCircleFactLabel }),
      text('value', 'Value', { required: true, maxLength: CONTENT_MAX_LENGTH.drumCircleFactValue }),
    ],
  },
};

const flow: IListFieldSchema = {
  key: 'flow',
  label: 'Steps',
  kind: FieldKind.List,
  addLabel: 'Add step',
  minItems: ITEMS.flowMin,
  maxItems: ITEMS.flowMax,
  item: {
    key: 'item',
    label: 'Step',
    kind: FieldKind.Group,
    fields: [
      text('title', 'Step', { required: true, maxLength: drumCircleFlowStep }),
      {
        key: 'minutes',
        label: 'Minutes',
        kind: FieldKind.Number,
        min: ITEMS.minutesMin,
        max: ITEMS.minutesMax,
      },
    ],
  },
};

/**
 * The drum circle details section (`home/drumCircle`, 0013), as four cards on the Music &
 * creativity tab. They share one document; each edits its own keys.
 */
export const DRUM_CIRCLE_SECTIONS: readonly IEditorSection[] = [
  {
    id: 'drum-circle',
    title: 'Drum circle details',
    path: ContentPath.HomeDrumCircle,
    anchor: PageAnchor.DrumCircleDetails,
    tip: 'The section about the drum circle, below the experiences.',
    fields: [
      eyebrow,
      title,
      facts,
      heading('aboutTitle', 'About heading'),
      {
        key: 'about',
        label: 'About',
        kind: FieldKind.List,
        addLabel: 'Add paragraph',
        minItems: ITEMS.aboutMin,
        maxItems: ITEMS.aboutMax,
        item: multiline('about', 'Paragraph', {
          required: true,
          maxLength: CONTENT_MAX_LENGTH.lead,
        }),
      },
      buttonLabel('cta', 'Button to the proposal form', 'Request proposal'),
    ],
  },
  {
    id: 'drum-circle-lists',
    title: 'Drum circle objectives and occasions',
    path: ContentPath.HomeDrumCircle,
    anchor: PageAnchor.DrumCircleDetails,
    fields: [
      heading('objectivesTitle', 'Objectives heading'),
      chips('objectives', 'Objectives', 'Objective', { min: ITEMS.chipsMin, max: ITEMS.chipsMax }),
      heading('occasionsTitle', 'Occasions heading'),
      chips('occasions', 'Occasions', 'Occasion', { min: ITEMS.chipsMin, max: ITEMS.chipsMax }),
    ],
  },
  {
    id: 'drum-circle-pictures',
    title: 'Drum circle pictures',
    path: ContentPath.HomeDrumCircle,
    anchor: PageAnchor.DrumCircleDetails,
    tip: 'Three pictures, side by side. Replace or reorder them; the layout keeps three.',
    fields: [
      {
        key: 'gallery',
        label: 'Pictures',
        kind: FieldKind.List,
        addLabel: 'Add picture',
        minItems: ITEMS.pictures,
        maxItems: ITEMS.pictures,
        item: image('gallery', 'Picture', IMAGE_ASPECT.drumCircle),
      },
    ],
  },
  {
    id: 'drum-circle-flow',
    title: 'Drum circle session flow',
    path: ContentPath.HomeDrumCircle,
    anchor: PageAnchor.DrumCircleDetails,
    fields: [
      heading('relatedTitle', 'Similar experiences heading'),
      chips('related', 'Similar experiences', 'Experience', { min: 0, max: ITEMS.relatedMax }),
      heading('flowTitle', 'Session flow heading'),
      text('flowUnit', 'Unit after the minutes', { maxLength: drumCircleFlowUnit }),
      flow,
    ],
  },
];
