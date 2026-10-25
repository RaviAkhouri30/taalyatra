import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BaseComponent } from '@shared/base/base-component';
import { BrandComponent } from '@shared/components/brand/brand.component';
import { MainNavComponent } from '@shared/components/layout/main-nav/main-nav.component';
import { MenuToggleComponent } from '@shared/components/layout/menu-toggle/menu-toggle.component';
import { MobileNavComponent } from '@shared/components/layout/mobile-nav/mobile-nav.component';
import { MOBILE_NAV_ID } from '@shared/constants/layout.constants';
import { ButtonDirective } from '@shared/directives/button.directive';
import { ButtonSize } from '@shared/enums/button-variant.enum';
import { type IBrand } from '@shared/interfaces/i-brand';
import { type ILayoutChrome } from '@shared/interfaces/i-layout-chrome';
import { type IMenuState } from '@shared/interfaces/i-ui-state';
import { HeaderViewModel } from './header.view-model';

/** Sticky site header: brand, desktop nav, call to action, and the mobile menu. */
@Component({
  selector: 'app-header',
  imports: [
    BrandComponent,
    ButtonDirective,
    MainNavComponent,
    MenuToggleComponent,
    MobileNavComponent,
    RouterLink,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HeaderViewModel],
})
export class HeaderComponent extends BaseComponent<IMenuState> {
  public readonly brand = input.required<IBrand>();
  public readonly chrome = input.required<ILayoutChrome>();

  protected override readonly model = inject(HeaderViewModel);
  protected readonly buttonSize = ButtonSize;
  protected readonly mobileNavId = MOBILE_NAV_ID;
}
