import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BaseComponent } from '@shared/base/base-component';
import { ButtonDirective } from '@shared/directives/button.directive';
import { AppRoute } from '@shared/enums/app-route.enum';
import { ButtonSize, ButtonVariant } from '@shared/enums/button-variant.enum';
import { PUBLISH_PATH } from '../../models/editor-nav.constants';
import {
  type IPublishBarState,
  PublishBarViewModel,
} from '../../view-models/publish-bar.view-model';

/** The status and Publish button under every editor page. */
@Component({
  selector: 'app-publish-bar',
  imports: [ButtonDirective, RouterLink],
  templateUrl: './publish-bar.component.html',
  styleUrl: './publish-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PublishBarViewModel],
})
export class PublishBarComponent extends BaseComponent<IPublishBarState> {
  protected override readonly model = inject(PublishBarViewModel);
  protected readonly reviewUrl = `${AppRoute.Admin}/${PUBLISH_PATH}`;
  protected readonly ghost = ButtonVariant.Ghost;
  protected readonly compact = ButtonSize.Compact;
}
