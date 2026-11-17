import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { BaseComponent } from '@shared/base/base-component';
import { FoldComponent } from '@shared/components/fold/fold.component';
import { FoldMode } from '@shared/enums/fold-mode.enum';
import { IconComponent } from '@shared/components/icon/icon.component';
import { SectionHeaderComponent } from '@shared/components/section-header/section-header.component';
import { ButtonDirective } from '@shared/directives/button.directive';
import { ButtonVariant } from '@shared/enums/button-variant.enum';
import { IconName } from '@shared/enums/icon-name.enum';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { HomeInstagramViewModel } from './home-instagram.view-model';
import { type IInstagramDto } from './i-instagram';

/** Instagram grid (design `#insta`): recent posts and a follow link. */
@Component({
  selector: 'app-home-instagram',
  imports: [
    FoldComponent,
    ButtonDirective,
    IconComponent,
    NgOptimizedImage,
    SectionHeaderComponent,
  ],
  templateUrl: './home-instagram.component.html',
  styleUrl: './home-instagram.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HomeInstagramViewModel],
})
export class HomeInstagramComponent extends BaseComponent<IInstagramDto> {
  /** When the section's content folds behind Show more (0015 V15). */
  public readonly fold = input(FoldMode.Never);
  protected override readonly model = inject(HomeInstagramViewModel);
  protected readonly anchor = PageAnchor.Insta;
  protected readonly buttonVariant = ButtonVariant;
  protected readonly instagramIcon = IconName.Instagram;
}
