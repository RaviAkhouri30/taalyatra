import { type AbstractControl, type ValidationErrors } from '@angular/forms';
import { type IImage } from '@shared/interfaces/i-image';
import { fieldOf } from './json-node';

/** @returns The number stored there, or 0 for anything else. */
function numberOf(source: unknown, key: string): number {
  const value = fieldOf(source, key);
  return typeof value === 'number' ? value : 0;
}

/** @returns The text stored there, or empty for anything else. */
function textOf(source: unknown, key: string): string {
  const value = fieldOf(source, key);
  return typeof value === 'string' ? value : '';
}

/**
 * @param value A stored value.
 * @returns It as an image; missing parts are empty, so a damaged document still opens.
 */
export function toImage(value: unknown): IImage {
  return {
    src: textOf(value, 'src'),
    alt: textOf(value, 'alt'),
    width: numberOf(value, 'width'),
    height: numberOf(value, 'height'),
  };
}

/**
 * @param control An image field's control.
 * @returns An error when no photo has been chosen.
 */
export function imageChosenValidator(control: AbstractControl): ValidationErrors | null {
  return toImage(control.value).src === '' ? { imageMissing: true } : null;
}

/**
 * @param control An image field's control.
 * @returns An error when the photo has no description (G3).
 */
export function imageDescribedValidator(control: AbstractControl): ValidationErrors | null {
  return toImage(control.value).alt.trim() === '' ? { imageDescription: true } : null;
}
