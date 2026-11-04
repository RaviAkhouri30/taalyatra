import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  Injector,
  afterNextRender,
  inject,
  viewChild,
} from '@angular/core';
import {
  type IsActiveMatchOptions,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { BaseComponent } from '@shared/base/base-component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { ButtonDirective } from '@shared/directives/button.directive';
import { AppRoute } from '@shared/enums/app-route.enum';
import { ButtonSize, ButtonVariant } from '@shared/enums/button-variant.enum';
import { IconName } from '@shared/enums/icon-name.enum';
import { type AdminPageModel } from '../../models/admin-page.model';
import { EDITOR_NAV_GROUPS } from '../../models/editor-nav.constants';
import { EditorNavService } from '../../services/editor-nav.service';
import { EditorLayoutViewModel } from '../../view-models/editor-layout.view-model';

const EXACT: IsActiveMatchOptions = {
  paths: 'exact',
  queryParams: 'ignored',
  fragment: 'ignored',
  matrixParams: 'ignored',
};
const PREFIX: IsActiveMatchOptions = { ...EXACT, paths: 'subset' };

/**
 * The editor's frame (0008 D20): account bar, side panel and autosave status around the editor
 * pages. Provides the layout view model the pages report their saves to.
 */
@Component({
  selector: 'app-editor-layout',
  imports: [
    ButtonDirective,
    IconComponent,
    NgOptimizedImage,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
  ],
  templateUrl: './editor-layout.component.html',
  styleUrl: './editor-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [EditorLayoutViewModel, EditorNavService],
  host: { '(document:keydown.escape)': 'closeDrawer()' },
})
export default class EditorLayoutComponent extends BaseComponent<AdminPageModel> {
  protected override readonly model = inject(EditorLayoutViewModel);
  protected readonly nav = inject(EditorNavService);
  protected readonly dashboardUrl = AppRoute.Admin;
  // A full page load, not router navigation: the site then reads the newest published content.
  protected readonly siteUrl = AppRoute.Home;
  protected readonly ghost = ButtonVariant.Ghost;
  protected readonly compact = ButtonSize.Compact;
  protected readonly icons = IconName;
  protected readonly groups = EDITOR_NAV_GROUPS.map((group, index) => ({
    ...group,
    id: `ed-group-${String(index)}`,
    links: group.links.map((link) => ({ ...link, match: link.exact ? EXACT : PREFIX })),
  }));

  private readonly injector = inject(Injector);
  private readonly menuButton = viewChild.required<ElementRef<HTMLButtonElement>>('menuButton');
  private readonly sideNav = viewChild.required<ElementRef<HTMLElement>>('sideNav');

  /** Opens or closes the slide-in menu; opening moves focus into it, for keyboard users. */
  protected toggleDrawer(): void {
    this.nav.toggleDrawer();
    if (this.nav.drawerOpen()) {
      afterNextRender(
        () => {
          this.sideNav().nativeElement.querySelector('a')?.focus();
        },
        { injector: this.injector },
      );
    }
  }

  /** Closes the slide-in menu, giving focus back so it isn't lost with the hidden panel. */
  protected closeDrawer(): void {
    if (this.nav.drawerOpen()) {
      this.nav.closeDrawer();
      this.menuButton().nativeElement.focus();
    }
  }
}
