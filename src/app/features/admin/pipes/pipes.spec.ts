import { IssueSeverity } from '../models/issue-severity.enum';
import { FieldErrorPipe } from './field-error.pipe';
import { IssueLinkPipe } from './issue-link.pipe';
import { PlaceholderNotePipe } from './placeholder-note.pipe';
import { TextLengthPipe } from './text-length.pipe';

describe('editor pipes', () => {
  it('should turn errors into a sentence, and nothing into an empty string', () => {
    const pipe = new FieldErrorPipe();

    expect(pipe.transform({ required: true })).toBe('Fill this in.');
    expect(pipe.transform(null)).toBe('');
  });

  it('should count the characters of text only', () => {
    const pipe = new TextLengthPipe();

    expect(pipe.transform('Diwali')).toBe(6);
    expect(pipe.transform(2026)).toBe(0);
  });

  it('should turn a placeholder into a note, and anything else into an empty string', () => {
    const pipe = new PlaceholderNotePipe();

    expect(pipe.transform('[NAME]')).toContain('[NAME]');
    expect(pipe.transform('Asha')).toBe('');
  });

  it('should link a finding to its tab and card', () => {
    const issue = {
      severity: IssueSeverity.Error,
      sectionId: 'gallery-photos',
      section: 'Photos',
      field: 'Photo 1',
      message: 'Choose a photo.',
    };

    expect(new IssueLinkPipe().transform(issue)).toEqual({
      tabLabel: 'Gallery',
      url: '/admin/gallery',
      fragment: 'card-gallery-photos',
    });
  });
});
