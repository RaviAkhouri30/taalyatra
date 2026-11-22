import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppRoute } from '@shared/enums/app-route.enum';
import { TourTargetDirective } from '../../directives/tour-target.directive';
import { FEATURES_PATH, INSTALL_PATH, RELEASES_PATH } from '../../models/editor-nav.constants';
import { TourTarget } from '../../models/tour.model';
import { TourService } from '../../services/tour.service';

/** The top bar's Help (0020): take the tour, see every feature, read what's new, install the app (0026). */
@Component({
  selector: 'app-help-menu',
  imports: [RouterLink, TourTargetDirective],
  templateUrl: './help-menu.component.html',
  styleUrl: './help-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'closeOutside($event)',
    '(document:keydown.escape)': 'close()',
  },
})
export class HelpMenuComponent {
  protected readonly open = signal(false);
  protected readonly helpTarget = TourTarget.Help;
  protected readonly featuresUrl = `${AppRoute.Admin}/${FEATURES_PATH}`;
  protected readonly releasesUrl = `${AppRoute.Admin}/${RELEASES_PATH}`;
  protected readonly installUrl = `${AppRoute.Admin}/${INSTALL_PATH}`;

  private readonly tour = inject(TourService);
  private readonly button = viewChild.required<ElementRef<HTMLButtonElement>>('button');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected toggle(): void {
    this.open.update((open) => !open);
  }

  protected startTour(): void {
    // Focus goes back to Help first: the menu item is about to disappear, and the tour gives
    // focus back to wherever it was when it started.
    this.button().nativeElement.focus();
    this.open.set(false);
    this.tour.start();
  }

  /** Closes the menu, giving focus back to Help when it was inside. */
  protected close(): void {
    if (!this.open()) {
      return;
    }
    const focusInside = this.host.contains(this.host.ownerDocument.activeElement);
    this.open.set(false);
    if (focusInside) {
      this.button().nativeElement.focus();
    }
  }

  /** @param event A click anywhere: outside the menu, it closes. */
  protected closeOutside(event: MouseEvent): void {
    if (this.open() && !this.host.contains(event.target as Node | null)) {
      this.open.set(false);
    }
  }
}
