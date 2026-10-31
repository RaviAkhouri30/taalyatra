import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  type IsActiveMatchOptions,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { BaseComponent } from '@shared/base/base-component';
import { ButtonDirective } from '@shared/directives/button.directive';
import { AppRoute } from '@shared/enums/app-route.enum';
import { ButtonSize, ButtonVariant } from '@shared/enums/button-variant.enum';
import { type AdminPageModel } from '../../models/admin-page.model';
import { EDITOR_NAV, PUBLISH_PATH } from '../../models/editor-nav.constants';
import { EditorLayoutViewModel } from '../../view-models/editor-layout.view-model';

const EXACT: IsActiveMatchOptions = {
  paths: 'exact',
  queryParams: 'ignored',
  fragment: 'ignored',
  matrixParams: 'ignored',
};
const PREFIX: IsActiveMatchOptions = { ...EXACT, paths: 'subset' };

/**
 * The editor's frame (0008 D20): account bar, tab bar and autosave status around the editor
 * pages. Provides the layout view model the pages report their saves to.
 */
@Component({
  selector: 'app-editor-layout',
  imports: [ButtonDirective, NgOptimizedImage, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './editor-layout.component.html',
  styleUrl: './editor-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [EditorLayoutViewModel],
})
export default class EditorLayoutComponent extends BaseComponent<AdminPageModel> {
  protected override readonly model = inject(EditorLayoutViewModel);
  protected readonly dashboardUrl = AppRoute.Admin;
  // A full page load, not router navigation: the site then reads the newest published content.
  protected readonly siteUrl = AppRoute.Home;
  protected readonly ghost = ButtonVariant.Ghost;
  protected readonly compact = ButtonSize.Compact;
  protected readonly nav = EDITOR_NAV.map((link) => ({
    ...link,
    match: link.exact ? EXACT : PREFIX,
    showsCount: link.url.endsWith(`/${PUBLISH_PATH}`),
  }));
}
