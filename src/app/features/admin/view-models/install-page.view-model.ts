import { Injectable, inject, signal } from '@angular/core';
import { EMPTY, type Observable, Subject, catchError, exhaustMap, finalize, tap } from 'rxjs';
import { ViewModel } from '@shared/base/view-model';
import { AdminAppService } from '../services/admin-app.service';

/** What the page says after the browser's install offer was answered. */
export const INSTALL_ANSWERS = {
  accepted: 'Installed. Open Taal Yatra admin from your home screen.',
  dismissed: 'Not installed. You can install it later from the browser’s menu.',
} as const;

/**
 * Install on your phone (0026 D6): whether this is already the app, the browser's offer (Android)
 * and what happened when it was used.
 */
@Injectable()
export class InstallPageViewModel extends ViewModel<null> {
  /** The browser offers to install: the page shows its Install button. */
  public readonly canInstall: AdminAppService['canInstall'];
  /** This page is the installed app already. */
  public readonly installedApp: boolean;
  public readonly busy = signal(false);
  /** What happened, once the offer was answered; empty before. */
  public readonly answer = signal('');

  private readonly app = inject(AdminAppService);
  private readonly installs = new Subject<void>();

  public constructor() {
    super();
    this.canInstall = this.app.canInstall;
    this.installedApp = this.app.isInstalledApp();
  }

  /** Shows the browser's install offer. */
  public install(): void {
    this.installs.next();
  }

  protected override attachCommandHandler(): Observable<unknown> {
    return this.installs.pipe(
      // exhaustMap: the offer can be shown once; a second click while it shows is ignored.
      exhaustMap(() => {
        this.busy.set(true);
        return this.app.install().pipe(
          tap((accepted) => {
            this.answer.set(accepted ? INSTALL_ANSWERS.accepted : INSTALL_ANSWERS.dismissed);
          }),
          // Inside the exhaustMap: a browser that refuses leaves the steps to follow.
          catchError(() => {
            this.answer.set(INSTALL_ANSWERS.dismissed);
            return EMPTY;
          }),
          finalize(() => {
            this.busy.set(false);
          }),
        );
      }),
    );
  }
}
