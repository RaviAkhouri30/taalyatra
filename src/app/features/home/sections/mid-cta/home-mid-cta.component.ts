import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BaseComponent } from '@shared/base/base-component';
import { ButtonDirective } from '@shared/directives/button.directive';
import { ButtonVariant } from '@shared/enums/button-variant.enum';
import { HomeMidCtaViewModel } from './home-mid-cta.view-model';
import { type MidCtaModel } from './mid-cta.model';

/** Clay call-to-action band between the story and the practical sections. */
@Component({
  selector: 'app-home-mid-cta',
  imports: [ButtonDirective, RouterLink],
  templateUrl: './home-mid-cta.component.html',
  styleUrl: './home-mid-cta.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HomeMidCtaViewModel],
})
export class HomeMidCtaComponent extends BaseComponent<MidCtaModel> {
  protected override readonly model = inject(HomeMidCtaViewModel);
  protected readonly buttonVariant = ButtonVariant;
}
