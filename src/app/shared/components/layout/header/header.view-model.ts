import { Injectable, computed, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { type Observable, filter, tap } from 'rxjs';
import { ViewModel } from '@shared/base/view-model';
import { type IMenuState } from '@shared/interfaces/i-ui-state';

/** Owns the mobile menu's open state for `HeaderComponent`. */
@Injectable()
export class HeaderViewModel extends ViewModel<IMenuState> {
  public readonly menuOpen = computed(() => this.data()?.open ?? false);

  private readonly router = inject(Router);

  public constructor() {
    super();
    this.setData({ open: false });
  }

  public toggleMenu(): void {
    this.setData({ open: !this.menuOpen() });
  }

  public closeMenu(): void {
    this.setData({ open: false });
  }

  /** Any completed navigation (including a jump to a section) closes the menu. */
  protected override attachViewHandler(): Observable<unknown> {
    return this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      tap(() => {
        this.closeMenu();
      }),
    );
  }
}
