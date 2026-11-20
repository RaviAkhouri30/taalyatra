import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  Injector,
  afterNextRender,
  computed,
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
import { AppRoute } from '@shared/enums/app-route.enum';
import { IconName } from '@shared/enums/icon-name.enum';
import { type AdminPageModel } from '../../models/admin-page.model';
import { TourTargetDirective } from '../../directives/tour-target.directive';
import { LEADS_PATH, NavBadge, PUBLISH_PATH } from '../../models/editor-nav.constants';
import { TourTarget } from '../../models/tour.model';
import { EditorNavService } from '../../services/editor-nav.service';
import { TourService } from '../../services/tour.service';
import { EditorLayoutViewModel } from '../../view-models/editor-layout.view-model';
import { EditorTopBarComponent } from '../editor-top-bar/editor-top-bar.component';
import { EditorFindComponent, FIND_INPUT_ID } from '../editor-find/editor-find.component';
import { TourOfferComponent } from '../tour-offer/tour-offer.component';
import { TourComponent } from '../tour/tour.component';

const EXACT: IsActiveMatchOptions = {
  paths: 'exact',
  queryParams: 'ignored',
  fragment: 'ignored',
  matrixParams: 'ignored',
};
const PREFIX: IsActiveMatchOptions = { ...EXACT, paths: 'subset' };

/** The menu links the guided tour points at (0020 V9). */
const TOUR_LINKS: ReadonlyMap<string, TourTarget> = new Map([
  [`${AppRoute.Admin}/${PUBLISH_PATH}`, TourTarget.Review],
  [`${AppRoute.Admin}/${LEADS_PATH}`, TourTarget.OwnerPages],
]);

/**
 * The editor's frame (0008 D20): account bar, side panel and autosave status around the editor
 * pages. Provides the layout view model the pages report their saves to.
 */
@Component({
  selector: 'app-editor-layout',
  imports: [
    EditorFindComponent,
    EditorTopBarComponent,
    IconComponent,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    TourComponent,
    TourOfferComponent,
    TourTargetDirective,
  ],
  templateUrl: './editor-layout.component.html',
  styleUrl: './editor-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [EditorLayoutViewModel, EditorNavService, TourService],
  host: { '(document:keydown.escape)': 'closeDrawer()' },
})
export default class EditorLayoutComponent extends BaseComponent<AdminPageModel> {
  protected override readonly model = inject(EditorLayoutViewModel);
  protected readonly nav = inject(EditorNavService);
  protected readonly icons = IconName;
  protected readonly badges = NavBadge;
  protected readonly targets = TourTarget;
  /** The side panel this account sees (0019: a manager's has no hidden or owner's pages). */
  protected readonly groups = computed(() =>
    this.model.groups().map((group, index) => ({
      ...group,
      id: `ed-group-${String(index)}`,
      links: group.links.map((link) => ({
        ...link,
        match: link.exact ? EXACT : PREFIX,
        tourTarget: TOUR_LINKS.get(link.url) ?? null,
      })),
    })),
  );

  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);
  private readonly topBar = viewChild.required(EditorTopBarComponent);
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

  /** Unfolds the panel and puts the cursor in Find. */
  protected openFind(): void {
    this.nav.toggleCollapsed();
    afterNextRender(
      () => {
        this.document.getElementById(FIND_INPUT_ID)?.focus();
      },
      { injector: this.injector },
    );
  }

  /** Closes the slide-in menu, giving focus back so it isn't lost with the hidden panel. */
  protected closeDrawer(): void {
    if (this.nav.drawerOpen()) {
      this.nav.closeDrawer();
      this.topBar().focusMenu();
    }
  }
}
