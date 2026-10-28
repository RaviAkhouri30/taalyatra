import { Service } from '@angular/core';
import { type Observable, Subject } from 'rxjs';
import { ToastTone } from '@shared/enums/toast-tone.enum';
import { type IToastMessage } from '@shared/interfaces/i-toast';

/**
 * Accepts toast messages from anywhere in the app. It only forwards them: `ToastHostViewModel`
 * shows them and owns their timers, so no service subscribes (CLAUDE.md §7).
 */
@Service()
export class ToastService {
  /** Messages in the order they were sent. */
  public readonly messages$: Observable<IToastMessage>;

  private readonly messages = new Subject<IToastMessage>();

  public constructor() {
    // Assigned here because it reads `messages`, a private field declared after the public one.
    this.messages$ = this.messages.asObservable();
  }

  /**
   * @param text What to tell the visitor.
   * @param tone A confirmation (default) or a problem.
   */
  public show(text: string, tone: ToastTone = ToastTone.Success): void {
    this.messages.next({ text, tone });
  }
}
