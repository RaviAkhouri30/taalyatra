import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BaseComponent } from '@shared/base/base-component';
import { ButtonDirective } from '@shared/directives/button.directive';
import { InstallPageViewModel } from '../../view-models/install-page.view-model';

/** Help → Install on your phone (0026 D6): the steps for Android and iPhone, and Android's Install. */
@Component({
  selector: 'app-install-page',
  imports: [ButtonDirective],
  templateUrl: './install-page.component.html',
  styleUrl: './install-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [InstallPageViewModel],
})
export default class InstallPageComponent extends BaseComponent<null> {
  protected override readonly model = inject(InstallPageViewModel);
}
