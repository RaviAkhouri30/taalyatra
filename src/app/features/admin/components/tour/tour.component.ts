import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  type ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { ButtonDirective } from '@shared/directives/button.directive';
import { ButtonSize, ButtonVariant } from '@shared/enums/button-variant.enum';
import { PlacedDirective } from '../../directives/placed.directive';
import { type IBox, cardPlacement, framePlacement } from '../../models/tour-placement';
import { EditorNavService } from '../../services/editor-nav.service';
import { TourService } from '../../services/tour.service';

/** Where the menu is a drawer (the stylesheet's tablet breakpoint). */
const DRAWER_QUERY = '(max-width: 1000px)';

/**
 * The guided tour on screen (0020 V9): the highlight around the step's area and the step card.
 * The only part of the tour that measures the page; the steps and their order are the service's.
 */
@Component({
  selector: 'app-tour',
  imports: [ButtonDirective, PlacedDirective],
  templateUrl: './tour.component.html',
  styleUrl: './tour.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'tour.close()',
    '(window:resize)': 'measure()',
  },
})
export class TourComponent {
  protected readonly tour = inject(TourService);
  protected readonly ghost = ButtonVariant.Ghost;
  protected readonly compact = ButtonSize.Compact;
  /** The highlighted area's box, or `null` when the step has none on screen. */
  protected readonly box = signal<IBox | null>(null);
  protected readonly frame = computed(() => {
    const box = this.box();
    return box ? framePlacement(box) : null;
  });
  protected readonly cardPlace = computed(() => cardPlacement(this.box(), this.screen()));

  private readonly nav = inject(EditorNavService);
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly screen = signal({ width: 0, height: 0 });
  private readonly cardElement = viewChild<ElementRef<HTMLElement>>('card');
  /** Where focus was when the tour started, given back when it ends. */
  private returnFocus: HTMLElement | null = null;
  private openedMenu = false;

  public constructor() {
    effect(() => {
      const step = this.tour.step();
      const element = this.tour.element();
      untracked(() => {
        this.follow(step !== null, step?.inMenu ?? false, element);
      });
    });
    // The editor scrolls inside its columns, so any scroll can move the area.
    const onScroll = (): void => {
      this.measure();
    };
    this.document.addEventListener('scroll', onScroll, true);
    inject(DestroyRef).onDestroy(() => {
      this.document.removeEventListener('scroll', onScroll, true);
    });
  }

  /** Measures the area again, after a scroll or a resize. */
  protected measure(): void {
    const view = this.document.defaultView;
    this.screen.set({ width: view?.innerWidth ?? 0, height: view?.innerHeight ?? 0 });
    const element = this.tour.element();
    const rect = element?.getBoundingClientRect();
    // An area with no size isn't on screen (a hidden preview on a phone): the card stands alone.
    this.box.set(
      rect && rect.width > 0 && rect.height > 0
        ? { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
        : null,
    );
  }

  /** Keeps Tab inside the card while the tour runs. */
  protected keepFocus(event: KeyboardEvent): void {
    const buttons = [...(this.cardElement()?.nativeElement.querySelectorAll('button') ?? [])];
    if (event.key !== 'Tab' || buttons.length === 0) {
      return;
    }
    const wrapTo = this.wrapTarget(buttons, event.shiftKey);
    if (wrapTo) {
      event.preventDefault();
      wrapTo.focus();
    }
  }

  /** @returns The button focus wraps round to, or `null` when Tab can move on its own. */
  private wrapTarget(
    buttons: readonly HTMLButtonElement[],
    backwards: boolean,
  ): HTMLButtonElement | null {
    const active = this.document.activeElement;
    const index = buttons.findIndex((button) => button === active);
    if (backwards) {
      // From the card itself or the first button, Shift+Tab goes to the last.
      return index <= 0 ? (buttons.at(-1) ?? null) : null;
    }
    return index === buttons.length - 1 ? (buttons.at(0) ?? null) : null;
  }

  private follow(running: boolean, inMenu: boolean, element: HTMLElement | null): void {
    if (!running) {
      this.end();
      return;
    }
    this.returnFocus ??= this.document.activeElement as HTMLElement | null;
    this.showMenu(inMenu);
    afterNextRender(
      () => {
        element?.scrollIntoView({ block: 'nearest' });
        this.measure();
        this.cardElement()?.nativeElement.focus();
      },
      { injector: this.injector },
    );
  }

  /** On phones and tablets, opens the menu drawer for a step in it, and closes it after. */
  private showMenu(inMenu: boolean): void {
    const drawer = this.document.defaultView?.matchMedia(DRAWER_QUERY).matches ?? false;
    if (drawer && inMenu && !this.nav.drawerOpen()) {
      this.nav.toggleDrawer();
      this.openedMenu = true;
    } else if (!inMenu && this.openedMenu) {
      this.nav.closeDrawer();
      this.openedMenu = false;
    }
  }

  private end(): void {
    this.box.set(null);
    if (this.openedMenu) {
      this.nav.closeDrawer();
      this.openedMenu = false;
    }
    this.returnFocus?.focus();
    this.returnFocus = null;
  }
}
