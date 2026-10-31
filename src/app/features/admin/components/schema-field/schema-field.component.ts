import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { type AbstractControl, FormControl, ReactiveFormsModule } from '@angular/forms';
import { FieldKind } from '../../models/field-kind.enum';
import { type FieldSchema } from '../../models/i-field-schema';
import { FieldErrorPipe } from '../../pipes/field-error.pipe';
import { TextLengthPipe } from '../../pipes/text-length.pipe';

/** The HTML input type of each single-line field kind. */
const INPUT_TYPES: ReadonlyMap<FieldKind, string> = new Map([
  [FieldKind.Url, 'url'],
  [FieldKind.Tel, 'tel'],
  [FieldKind.Email, 'email'],
  [FieldKind.Date, 'date'],
  [FieldKind.Number, 'number'],
]);

/**
 * One labelled editor field (text, link, phone, email, date, number, switch or choice), with its
 * hint, error and character counter tied to it for screen readers (WCAG 2.2 AA).
 */
@Component({
  selector: 'app-schema-field',
  imports: [FieldErrorPipe, ReactiveFormsModule, TextLengthPipe],
  templateUrl: './schema-field.component.html',
  styleUrl: './schema-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchemaFieldComponent {
  /** The field to render (never a group or a list). */
  public readonly field = input.required<FieldSchema>();
  /** Its control. */
  public readonly control = input.required<AbstractControl | null>();
  /** A page-unique id for the input. */
  public readonly fieldId = input.required<string>();

  protected readonly kind = FieldKind;
  protected readonly formControl = computed(() => {
    const control = this.control();
    return control instanceof FormControl ? control : null;
  });
  protected readonly inputType = computed(() => INPUT_TYPES.get(this.field().kind) ?? 'text');
  protected readonly hintId = computed(() => `${this.fieldId()}-hint`);
  protected readonly errorId = computed(() => `${this.fieldId()}-error`);
  protected readonly countId = computed(() => `${this.fieldId()}-count`);
  /** The character limit the counter shows: the writing tip's, else the stored maximum. */
  protected readonly limit = computed(() => {
    const field = this.field();
    return 'recommended' in field || 'maxLength' in field
      ? (field.recommended ?? field.maxLength ?? 0)
      : 0;
  });
  protected readonly options = computed(() => {
    const field = this.field();
    return field.kind === FieldKind.Choice ? field.options : [];
  });
  protected readonly describedBy = computed(() =>
    [this.field().hint ? this.hintId() : '', this.limit() ? this.countId() : '', this.errorId()]
      .filter(Boolean)
      .join(' '),
  );
}
