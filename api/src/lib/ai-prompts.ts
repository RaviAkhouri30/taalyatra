import { type AiContentPart, type IAiMessage } from './ai-client.js';

/** The rewrite styles the editor offers (0025 D6). */
export enum AiStyle {
  Clearer = 'clearer',
  Shorter = 'shorter',
  Warmer = 'warmer',
  Formal = 'formal',
  Spelling = 'spelling',
}

/** What the editor asks for (0025 V8). */
export enum AiTask {
  Rewrite = 'rewrite',
  Suggest = 'suggest',
  Describe = 'describe',
}

/** A checked write request: everything the prompt is built from. */
export interface IAiWriteInput {
  readonly task: AiTask;
  readonly style: AiStyle | null;
  readonly text: string;
  readonly label: string;
  readonly hint: string;
  readonly page: string;
  readonly context: string;
  readonly maxLength: number | null;
  readonly imageUrl: string | null;
}

const BUSINESS =
  'You help the owner of Taal Yatra, a drum circle and rhythm experience business in Pune, India, ' +
  'with their website. Visitors are companies, schools, families and event planners.';

const TEXT_ONLY =
  'Answer with the text only: no quotes, no explanation, no Markdown. Keep the language of the ' +
  'text you are given; use English when there is none.';

const STYLES: Readonly<Record<AiStyle, string>> = {
  [AiStyle.Clearer]: 'Rewrite it to be clearer and easier to read, keeping its meaning.',
  [AiStyle.Shorter]: 'Rewrite it shorter, keeping what matters.',
  [AiStyle.Warmer]: 'Rewrite it warmer and more welcoming, without exaggerating.',
  [AiStyle.Formal]: 'Rewrite it more formal and professional.',
  [AiStyle.Spelling]: 'Fix spelling, grammar and punctuation only. Change nothing else.',
};

const DESCRIBE =
  'Describe this photo in one sentence for people who can’t see it: who and what is in it, and ' +
  'what is happening. Not the camera, the colours or the quality.';

function instructionFor(input: IAiWriteInput): string {
  if (input.task === AiTask.Describe) {
    return DESCRIBE;
  }
  if (input.task === AiTask.Suggest || input.style === null) {
    return 'Write a first version for this empty field, from what the rest of the card says.';
  }
  return STYLES[input.style];
}

/** The field's details, as data: whatever they contain, they are not instructions. */
function detailsOf(input: IAiWriteInput): string {
  const limit = input.maxLength === null ? '' : `\nAt most ${String(input.maxLength)} characters.`;
  return (
    `Page: ${input.page}\nField: ${input.label}\nWhat the field is for: ${input.hint || '-'}${limit}` +
    `\n\nThe rest of the card:\n"""\n${input.context || '-'}\n"""` +
    `\n\nThe field's text:\n"""\n${input.text || '-'}\n"""`
  );
}

/**
 * @param input A checked write request.
 * @returns The messages for the provider: the business and the rules first, then the task and the
 *   field, with the picture for a description.
 */
export function writeMessages(input: IAiWriteInput): IAiMessage[] {
  const task = `${instructionFor(input)}\n\n${detailsOf(input)}`;
  const content: readonly AiContentPart[] | string =
    input.imageUrl === null
      ? task
      : [
          { type: 'text', text: task },
          { type: 'image_url', image_url: { url: input.imageUrl } },
        ];
  return [
    { role: 'system', content: `${BUSINESS} ${TEXT_ONLY}` },
    { role: 'user', content },
  ];
}

/**
 * @param summary The anonymous lead counts, already checked.
 * @returns The messages for the leads analysis (0025 V12).
 */
export function leadsMessages(summary: unknown): IAiMessage[] {
  return [
    {
      role: 'system',
      content:
        `${BUSINESS} You get counts of their enquiries, never who sent them. Write 4 to 6 short ` +
        'points in plain text, each on its own line starting with "• ": what brings the most ' +
        'enquiries, what tends to be won, which months are busy, and one practical suggestion. ' +
        'Use only the numbers given. No Markdown, no headings.',
    },
    { role: 'user', content: JSON.stringify(summary) },
  ];
}

const QUOTES = new Set(['"', '“', '”', "'", '`']);

/** @returns The text without quotes around it. A loop, not a pattern, so it stays linear. */
function withoutQuotes(text: string): string {
  let start = 0;
  let end = text.length;
  while (start < end && QUOTES.has(text.charAt(start))) {
    start += 1;
  }
  while (end > start && QUOTES.has(text.charAt(end - 1))) {
    end -= 1;
  }
  return text.slice(start, end).trim();
}

/**
 * @param text An answer.
 * @param maxLength The field's limit, or `null`.
 * @returns It without wrapping quotes, cut at a word boundary to fit the limit.
 */
export function fitAnswer(text: string, maxLength: number | null): string {
  const unquoted = withoutQuotes(text.trim());
  if (maxLength === null || unquoted.length <= maxLength) {
    return unquoted;
  }
  const cut = unquoted.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trim();
}
