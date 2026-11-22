import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { AdminAppService } from '../services/admin-app.service';
import { AdminShellViewModel } from './admin-shell.view-model';

describe('AdminShellViewModel', () => {
  it('should keep the app’s tags for as long as it runs (0026)', () => {
    const open = new Subject<void>();
    const attach = vi.fn(() => open);
    TestBed.configureTestingModule({
      providers: [AdminShellViewModel, { provide: AdminAppService, useValue: { attach } }],
    });

    const subscription = TestBed.inject(AdminShellViewModel).init().subscribe();

    expect(attach).toHaveBeenCalled();
    expect(open.observed).toBe(true);
    subscription.unsubscribe();
    expect(open.observed).toBe(false);
  });
});
