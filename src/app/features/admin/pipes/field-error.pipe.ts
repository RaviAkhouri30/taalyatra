import { Pipe, type PipeTransform } from '@angular/core';
import { type ValidationErrors } from '@angular/forms';
import { fieldErrorMessage } from '../forms/field-errors';

/** A control's validation errors as the sentence the owner sees (empty when valid). */
@Pipe({ name: 'fieldError' })
export class FieldErrorPipe implements PipeTransform {
  /**
   * @param errors The control's errors.
   * @returns What to fix, or an empty string.
   */
  public transform(errors: ValidationErrors | null): string {
    return fieldErrorMessage(errors) ?? '';
  }
}
