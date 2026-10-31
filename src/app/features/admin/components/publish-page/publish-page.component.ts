import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BaseComponent } from '@shared/base/base-component';
import { ButtonDirective } from '@shared/directives/button.directive';
import { ButtonSize, ButtonVariant } from '@shared/enums/button-variant.enum';
import { type PublishPageModel } from '../../models/publish-page.model';
import { PublishPageViewModel } from '../../view-models/publish-page.view-model';

/** Review & publish: the drafts, what the checks found, publishing, and the history. */
@Component({
  selector: 'app-publish-page',
  imports: [ButtonDirective],
  templateUrl: './publish-page.component.html',
  styleUrl: './publish-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PublishPageViewModel],
})
export default class PublishPageComponent extends BaseComponent<PublishPageModel> {
  protected override readonly model = inject(PublishPageViewModel);
  protected readonly ghost = ButtonVariant.Ghost;
  protected readonly compact = ButtonSize.Compact;
}
