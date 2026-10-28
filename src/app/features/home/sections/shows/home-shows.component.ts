import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BaseComponent } from '@shared/base/base-component';
import { ShowSpotlightComponent } from '@shared/components/show-spotlight/show-spotlight.component';
import { SectionHeaderComponent } from '@shared/components/section-header/section-header.component';
import { ButtonDirective } from '@shared/directives/button.directive';
import { ButtonVariant } from '@shared/enums/button-variant.enum';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { type HomeShowsModel } from './home-shows.model';
import { HomeShowsViewModel } from './home-shows.view-model';

/**
 * Shows teaser (design `#shows`, given more weight in 0005-A): the classical concert spotlight,
 * then the other formats as image cards, each opening the Shows page.
 */
@Component({
  selector: 'app-home-shows',
  imports: [
    ButtonDirective,
    NgOptimizedImage,
    RouterLink,
    SectionHeaderComponent,
    ShowSpotlightComponent,
  ],
  templateUrl: './home-shows.component.html',
  styleUrl: './home-shows.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HomeShowsViewModel],
})
export class HomeShowsComponent extends BaseComponent<HomeShowsModel> {
  protected override readonly model = inject(HomeShowsViewModel);
  protected readonly anchor = PageAnchor.Shows;
  protected readonly buttonVariant = ButtonVariant;
}
