import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { BaseComponent } from '@shared/base/base-component';
import { provideInstallPrompt } from '@core/config/provide-install-prompt';
import { AdminAppService } from '../../services/admin-app.service';
import { AdminShellViewModel } from '../../view-models/admin-shell.view-model';

/** Robots directive for every admin page: not listed by search engines. */
const NO_INDEX = { name: 'robots', content: 'noindex, nofollow' };

/**
 * Wraps every admin route; keeps the admin area out of search results while it is open, and makes
 * it installable as an app (0026), through its view model.
 */
@Component({
  selector: 'app-admin-shell',
  imports: [RouterOutlet],
  template: '<router-outlet />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Here, not on the route: every admin page sits inside the shell, and the routes file stays free of
  // the tags' code, which would otherwise reshape the public site's first download.
  providers: [AdminShellViewModel, AdminAppService, provideInstallPrompt()],
})
export default class AdminShellComponent extends BaseComponent<null> {
  protected override readonly model = inject(AdminShellViewModel);

  public constructor() {
    super();
    const meta = inject(Meta);
    meta.updateTag(NO_INDEX);
    inject(DestroyRef).onDestroy(() => {
      meta.removeTag(`name="${NO_INDEX.name}"`);
    });
  }
}
