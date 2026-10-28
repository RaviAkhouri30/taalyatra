import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BaseComponent } from '@shared/base/base-component';
import { ButtonDirective } from '@shared/directives/button.directive';
import { AppRoute } from '@shared/enums/app-route.enum';
import { ButtonVariant } from '@shared/enums/button-variant.enum';
import { type AdminPageModel } from '../../models/admin-page.model';
import { AdminHomeViewModel } from '../../view-models/admin-home.view-model';
import { AuthCardComponent } from '../auth-card/auth-card.component';

/** Placeholder admin home: who is signed in, a link to the site, and sign out. */
@Component({
  selector: 'app-admin-home',
  imports: [AuthCardComponent, ButtonDirective, RouterLink],
  templateUrl: './admin-home.component.html',
  styleUrl: './admin-home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AdminHomeViewModel],
})
export default class AdminHomeComponent extends BaseComponent<AdminPageModel> {
  protected override readonly model = inject(AdminHomeViewModel);
  protected readonly home = AppRoute.Home;
  protected readonly ghost = ButtonVariant.Ghost;
}
