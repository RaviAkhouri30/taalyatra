import { Pipe, type PipeTransform } from '@angular/core';

/** The number of characters in a text field's value, for its counter (0 for anything else). */
@Pipe({ name: 'textLength' })
export class TextLengthPipe implements PipeTransform {
  /**
   * @param value The control's value.
   * @returns Its length when it is text.
   */
  public transform(value: unknown): number {
    return typeof value === 'string' ? value.length : 0;
  }
}
