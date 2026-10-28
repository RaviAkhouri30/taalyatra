import { type ToastTone } from '@shared/enums/toast-tone.enum';

/** A short message to show the visitor. */
export interface IToastMessage {
  readonly text: string;
  readonly tone: ToastTone;
}

/** A toast on screen. */
export interface IToast extends IToastMessage {
  readonly id: number;
}
