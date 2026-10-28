import { Injectable, computed, inject } from '@angular/core';
import { type Observable, concat, map, mergeMap, of, tap, timer } from 'rxjs';
import { ViewModel } from '@shared/base/view-model';
import { TOAST_DURATION_MS } from '@shared/constants/toast.constants';
import { type IToast } from '@shared/interfaces/i-toast';
import { ToastService } from '@shared/services/toast.service';

/** A change to the list of toasts on screen. */
type ToastChange = (toasts: readonly IToast[]) => readonly IToast[];

/** Shows each toast message, then removes it after `TOAST_DURATION_MS`. */
@Injectable()
export class ToastHostViewModel extends ViewModel<readonly IToast[]> {
  /** Toasts on screen, oldest first. */
  public readonly toasts = computed(() => this.data() ?? []);

  private readonly toastService = inject(ToastService);
  private nextId = 0;

  protected override attachCommandHandler(): Observable<unknown> {
    return this.toastService.messages$.pipe(
      // mergeMap: every toast runs its own timer; a new one never cancels or delays another.
      mergeMap((message) => {
        this.nextId += 1;
        const toast: IToast = { ...message, id: this.nextId };
        const add: ToastChange = (toasts) => [...toasts, toast];
        const remove: ToastChange = (toasts) => toasts.filter(({ id }) => id !== toast.id);
        return concat(of(add), timer(TOAST_DURATION_MS).pipe(map(() => remove)));
      }),
      tap((change) => {
        this.setData(change(this.toasts()));
      }),
    );
  }
}
