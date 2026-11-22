import { type DocumentFields } from '@core/interfaces/i-document-store';
import { ContentPath } from './content-path.enum';
import { fieldOf } from '../forms/json-node';
import { type IEditorSection } from './i-editor-section';
import { type IPublishIssue } from './i-publish-issue';
import { type IPublishRule } from './publish-rules';
import { IssueSeverity } from './issue-severity.enum';

/** Each list a starting choice belongs to, with the name the owner knows it by. */
const STARTING_CHOICES: readonly (readonly [key: string, name: string])[] = [
  ['need', 'What do you need?'],
  ['eventType', 'Event type'],
  ['experience', 'Experience'],
  ['groupSize', 'Group size'],
];

/** @returns The value when it's text, else nothing. */
function textOf(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

/** @returns The text items of a stored list; anything else is no choice. */
function texts(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item: unknown): item is string => typeof item === 'string')
    : [];
}

/** @returns Each list's choices, by the key of its starting choice. */
function choicesOf(form: unknown): ReadonlyMap<string, readonly string[]> {
  const groups: unknown = fieldOf(form, 'experienceGroups');
  const experiences = (Array.isArray(groups) ? groups : []).flatMap((entry: unknown) =>
    texts(fieldOf(entry, 'options')),
  );
  return new Map([
    ['need', texts(fieldOf(form, 'needs'))],
    ['eventType', texts(fieldOf(form, 'eventTypes'))],
    ['experience', [...experiences, textOf(fieldOf(form, 'experienceFallback'))]],
    ['groupSize', texts(fieldOf(form, 'groupSizes'))],
  ]);
}

/**
 * A proposal form list that starts on a choice it doesn't have (0028): the list would show blank.
 * Blocks publishing. Checked once, on the Choices card.
 */
export class FormChoicesRule implements IPublishRule {
  public check(section: IEditorSection, content: DocumentFields): IPublishIssue[] {
    if (section.path !== ContentPath.HomeContact || !section.fields.some(isChoices)) {
      return [];
    }
    const form: unknown = fieldOf(content, 'form');
    const choices = choicesOf(form);
    const defaults: unknown = fieldOf(form, 'defaults');
    return STARTING_CHOICES.flatMap(([key, name]) => {
      const start = textOf(fieldOf(defaults, key));
      return (choices.get(key) ?? []).includes(start)
        ? []
        : [
            {
              severity: IssueSeverity.Error,
              sectionId: section.id,
              section: section.title,
              field: `Each list starts on · ${name}`,
              message: `“${start}” isn’t one of the choices. Write it as one of them.`,
            },
          ];
    });
  }
}

/** @returns Whether the field holds the form's lists of choices. */
function isChoices(field: IEditorSection['fields'][number]): boolean {
  return (
    field.key === 'form' &&
    'fields' in field &&
    field.fields.some((inner) => inner.key === 'defaults')
  );
}
