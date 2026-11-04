import { Pipe, type PipeTransform } from '@angular/core';
import { placeholderMessage } from '../forms/placeholder';

/** A field's value as the warning the owner sees when it still holds a placeholder. */
@Pipe({ name: 'placeholderNote' })
export class PlaceholderNotePipe implements PipeTransform {
  /**
   * @param value The field's value.
   * @returns The warning, or an empty string.
   */
  public transform(value: unknown): string {
    return placeholderMessage(value) ?? '';
  }
}
