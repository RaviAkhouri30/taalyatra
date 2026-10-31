import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BaseComponent } from '@shared/base/base-component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { ButtonDirective } from '@shared/directives/button.directive';
import { ButtonVariant } from '@shared/enums/button-variant.enum';
import { IconName } from '@shared/enums/icon-name.enum';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { HomeProofViewModel } from './home-proof.view-model';
import { type IProofView } from './i-proof';

/** Proof (design `#proof`): headline numbers, testimonials and the clients served. */
@Component({
  selector: 'app-home-proof',
  imports: [ButtonDirective, IconComponent, RouterLink],
  templateUrl: './home-proof.component.html',
  styleUrl: './home-proof.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HomeProofViewModel],
})
export class HomeProofComponent extends BaseComponent<IProofView> {
  protected override readonly model = inject(HomeProofViewModel);
  protected readonly anchor = PageAnchor.Proof;
  protected readonly buttonVariant = ButtonVariant;
  protected readonly clientIcon = IconName.Building;
}
