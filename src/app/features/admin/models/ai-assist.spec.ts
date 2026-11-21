import { AiStyle } from '@core/enums/ai-style.enum';
import { AiTask } from '@core/enums/ai-task.enum';
import { AI_CONTEXT_MAX } from '@core/interfaces/i-ai-service';
import {
  type IAiFieldInfo,
  aiPictureRequest,
  aiTextRequest,
  cardContext,
  editorPageLabel,
} from './ai-assist';
import { EditorTab } from './editor-tab.enum';
import { FieldKind } from './field-kind.enum';
import { type FieldSchema } from './i-field-schema';

const INFO: IAiFieldInfo = {
  label: 'Headline',
  hint: '',
  page: 'Hero',
  maxLength: null,
  context: '',
};

describe('AI assist model (0025)', () => {
  it('should ask for a rewrite with the text and style, leaving out what’s empty', () => {
    expect(aiTextRequest(INFO, 'Drum', AiStyle.Warmer)).toEqual({
      task: AiTask.Rewrite,
      style: AiStyle.Warmer,
      text: 'Drum',
      label: 'Headline',
      page: 'Hero',
    });
  });

  it('should ask for a first version without a style, with the field’s limit and help', () => {
    const info = { ...INFO, hint: 'The big line', maxLength: 60, context: 'Intro: Come' };

    expect(aiTextRequest(info, '')).toEqual({
      task: AiTask.Suggest,
      label: 'Headline',
      page: 'Hero',
      hint: 'The big line',
      maxLength: 60,
      context: 'Intro: Come',
    });
  });

  it('should ask for a picture’s description with its address', () => {
    expect(aiPictureRequest(INFO, 'https://x/y.jpg')).toMatchObject({
      task: AiTask.Describe,
      imageUrl: 'https://x/y.jpg',
    });
  });

  it('should cut a long context to what the function accepts', () => {
    const request = aiTextRequest({ ...INFO, context: 'x'.repeat(AI_CONTEXT_MAX + 5) }, '');

    expect(request.context).toHaveLength(AI_CONTEXT_MAX);
  });

  it('should name the editor page, or "Admin" elsewhere', () => {
    expect(editorPageLabel(EditorTab.Hero)).toBe('Hero');
    expect(editorPageLabel(undefined)).toBe('Admin');
  });

  it('should give the card’s other prose as context, never links or contact details', () => {
    const fields: FieldSchema[] = [
      { key: 'title', label: 'Title', kind: FieldKind.Text },
      { key: 'intro', label: 'Intro', kind: FieldKind.Multiline },
      { key: 'empty', label: 'Empty', kind: FieldKind.Text },
      { key: 'phone', label: 'Phone', kind: FieldKind.Tel },
      { key: 'link', label: 'Link', kind: FieldKind.Url },
    ];
    const values = new Map<string, unknown>([
      ['title', 'Drum with us'],
      ['intro', ' Come and play '],
      ['empty', ' '],
      ['phone', '+91 98765'],
      ['link', 'https://x'],
    ]);

    expect(cardContext(fields, values, 'title')).toBe('Intro: Come and play');
  });
});
