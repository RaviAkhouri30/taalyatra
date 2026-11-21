import { AiStyle } from '@core/enums/ai-style.enum';
import { AiTask } from '@core/enums/ai-task.enum';
import { AI_CONTEXT_MAX, type IAiWriteRequest } from '@core/interfaces/i-ai-service';
import { EDITOR_TABS } from '../schemas/editor-tabs';
import { FieldKind } from './field-kind.enum';
import { type FieldSchema } from './i-field-schema';

/** Where the AI help sits: under a text field, or beside a picture's description (0025 V8). */
export enum AiAssistMode {
  Text = 'text',
  Picture = 'picture',
}

/** The rewrite styles, in the order the menu offers them (D6). */
export const AI_STYLE_CHOICES: readonly { readonly style: AiStyle; readonly label: string }[] = [
  { style: AiStyle.Clearer, label: 'Clearer' },
  { style: AiStyle.Shorter, label: 'Shorter' },
  { style: AiStyle.Warmer, label: 'Warmer' },
  { style: AiStyle.Formal, label: 'More formal' },
  { style: AiStyle.Spelling, label: 'Fix spelling and grammar' },
];

/** The field kinds the AI may write: prose only, never links, numbers or contact details (D7). */
export const AI_TEXT_KINDS: ReadonlySet<FieldKind> = new Set([FieldKind.Text, FieldKind.Multiline]);

/** The width the picture is sent at for a description: plenty to see what's in it. */
export const AI_PICTURE_WIDTH = 800;

/** What the AI is told about the field, besides its text. */
export interface IAiFieldInfo {
  readonly label: string;
  readonly hint: string;
  readonly page: string;
  readonly maxLength: number | null;
  readonly context: string;
}

/** The field's details, leaving out what's empty (exact optional properties). */
function fieldPart(info: IAiFieldInfo): Omit<IAiWriteRequest, 'task'> {
  return {
    label: info.label,
    page: info.page,
    ...(info.hint ? { hint: info.hint } : {}),
    ...(info.maxLength === null ? {} : { maxLength: info.maxLength }),
    ...(info.context ? { context: info.context.slice(0, AI_CONTEXT_MAX) } : {}),
  };
}

/**
 * @param info The field.
 * @param text Its text now.
 * @param style The chosen style, for a rewrite; none asks for a first version.
 * @returns The request for a text field.
 */
export function aiTextRequest(info: IAiFieldInfo, text: string, style?: AiStyle): IAiWriteRequest {
  return style === undefined
    ? { task: AiTask.Suggest, ...fieldPart(info) }
    : { task: AiTask.Rewrite, style, text, ...fieldPart(info) };
}

/**
 * @param info The picture's description field.
 * @param imageUrl The picture's address, in the site's own media folder.
 * @returns The request for a description.
 */
export function aiPictureRequest(info: IAiFieldInfo, imageUrl: string): IAiWriteRequest {
  return { task: AiTask.Describe, imageUrl, ...fieldPart(info) };
}

/**
 * @param tab The editor page's id, from the route.
 * @returns Its name, as the menu shows it; "Admin" when it isn't an editor page.
 */
export function editorPageLabel(tab: unknown): string {
  return EDITOR_TABS.find((entry) => entry.tab === tab)?.label ?? 'Admin';
}

/**
 * The same card's other prose, for the AI's context (D3): never another page's draft, and never
 * a link, a number or contact details.
 * @param fields The card's fields.
 * @param values The card's values now.
 * @param except The field being helped.
 * @returns e.g. "Title: Drum with us\nIntro: …", cut to what the function accepts.
 */
export function cardContext(
  fields: readonly FieldSchema[],
  values: ReadonlyMap<string, unknown>,
  except: string,
): string {
  return fields
    .filter((field) => field.key !== except && AI_TEXT_KINDS.has(field.kind))
    .flatMap((field) => {
      const value = values.get(field.key);
      return typeof value === 'string' && value.trim() ? [`${field.label}: ${value.trim()}`] : [];
    })
    .join('\n')
    .slice(0, AI_CONTEXT_MAX);
}
