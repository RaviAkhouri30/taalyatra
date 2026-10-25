import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent } from '@shared/components/icon/icon.component';
import { NAV_ACTIVE_OPTIONS } from '@shared/constants/router.constants';
import { NavEmphasis } from '@shared/enums/nav-emphasis.enum';
import { type INavLink } from '@shared/interfaces/i-site-link';

/** Desktop navigation links in the header; hidden at tablet width and below. */
@Component({
  selector: 'app-main-nav',
  imports: [IconComponent, RouterLink, RouterLinkActive],
  templateUrl: './main-nav.component.html',
  styleUrl: './main-nav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainNavComponent {
  public readonly links = input.required<readonly INavLink[]>();

  protected readonly emphasis = NavEmphasis;
  protected readonly activeOptions = NAV_ACTIVE_OPTIONS;
}
