import { Injectable, inject } from '@angular/core';
import { type Observable } from 'rxjs';
import { ViewModel } from '@shared/base/view-model';
import { AdminAppService } from '../services/admin-app.service';

/** The admin shell's one stream (0026): the app's tags and install offer while the admin is open. */
@Injectable()
export class AdminShellViewModel extends ViewModel<null> {
  private readonly app = inject(AdminAppService);

  protected override attachViewHandler(): Observable<unknown> {
    return this.app.attach();
  }
}
