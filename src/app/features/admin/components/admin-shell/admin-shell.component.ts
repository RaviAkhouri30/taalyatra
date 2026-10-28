import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';

/** Robots directive for every admin page: not listed by search engines. */
const NO_INDEX = { name: 'robots', content: 'noindex, nofollow' };

/** Wraps every admin route; keeps the admin area out of search results while it is open. */
@Component({
  selector: 'app-admin-shell',
  imports: [RouterOutlet],
  template: '<router-outlet />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminShellComponent {
  public constructor() {
    const meta = inject(Meta);
    meta.updateTag(NO_INDEX);
    inject(DestroyRef).onDestroy(() => {
      meta.removeTag(`name="${NO_INDEX.name}"`);
    });
  }
}
