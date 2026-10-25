import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SiteShellComponent } from '@shared/components/layout/site-shell/site-shell.component';

/**
 * Root component. Holds no state or logic: the site shell renders the chrome and router outlet.
 */
@Component({
  selector: 'app-root',
  imports: [SiteShellComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
