import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BaseComponent } from '@shared/base/base-component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { SectionHeaderComponent } from '@shared/components/section-header/section-header.component';
import { ButtonDirective } from '@shared/directives/button.directive';
import { ButtonVariant } from '@shared/enums/button-variant.enum';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { type HomeShowsModel } from './home-shows.model';
import { HomeShowsViewModel } from './home-shows.view-model';

/** Shows teaser (design `#shows`): six performance formats, each opening the Shows page. */
@Component({
  selector: 'app-home-shows',
  imports: [ButtonDirective, IconComponent, RouterLink, SectionHeaderComponent],
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
