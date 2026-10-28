import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BaseComponent } from '@shared/base/base-component';
import { ToastTone } from '@shared/enums/toast-tone.enum';
import { type IToast } from '@shared/interfaces/i-toast';
import { ToastHostViewModel } from './toast-host.view-model';

/** Short messages near the bottom of the screen, announced politely to screen readers. */
@Component({
  selector: 'app-toast-host',
  templateUrl: './toast-host.component.html',
  styleUrl: './toast-host.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ToastHostViewModel],
})
export class ToastHostComponent extends BaseComponent<readonly IToast[]> {
  protected override readonly model = inject(ToastHostViewModel);
  protected readonly error = ToastTone.Error;
}
