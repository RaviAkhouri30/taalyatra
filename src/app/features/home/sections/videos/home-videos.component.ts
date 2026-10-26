import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BaseComponent } from '@shared/base/base-component';
import { VideoCardComponent } from '@shared/components/video-card/video-card.component';
import { ButtonDirective } from '@shared/directives/button.directive';
import { ButtonVariant } from '@shared/enums/button-variant.enum';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { type HomeVideosModel } from './home-videos.model';
import { HomeVideosViewModel } from './home-videos.view-model';

/** "Latest videos" (design `#watch`): the newest videos and a link to the full library. */
@Component({
  selector: 'app-home-videos',
  imports: [ButtonDirective, RouterLink, VideoCardComponent],
  templateUrl: './home-videos.component.html',
  styleUrl: './home-videos.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HomeVideosViewModel],
})
export class HomeVideosComponent extends BaseComponent<HomeVideosModel> {
  protected override readonly model = inject(HomeVideosViewModel);
  protected readonly anchor = PageAnchor.Watch;
  protected readonly buttonVariant = ButtonVariant;
}
