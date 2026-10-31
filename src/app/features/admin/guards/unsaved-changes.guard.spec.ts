import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { type ActivatedRouteSnapshot, type RouterStateSnapshot } from '@angular/router';
import { LEAVE_WARNING, unsavedChangesGuard } from './unsaved-changes.guard';

describe('unsavedChangesGuard', () => {
  function leave(unsaved: boolean, confirmed: boolean | null) {
    const confirm = vi.fn(() => confirmed);
    TestBed.configureTestingModule({
      providers: [
        { provide: DOCUMENT, useValue: { defaultView: confirmed === null ? null : { confirm } } },
      ],
    });
    const result = TestBed.runInInjectionContext(() =>
      unsavedChangesGuard(
        { hasUnsavedChanges: () => unsaved },
        {} as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot,
        {} as RouterStateSnapshot,
      ),
    );
    return { result, confirm };
  }

  it('should let the owner leave without asking when nothing is pending', () => {
    const { result, confirm } = leave(false, false);

    expect(result).toBe(true);
    expect(confirm).not.toHaveBeenCalled();
  });

  it('should ask first while a change could be lost, and follow the answer', () => {
    const stay = leave(true, false);

    expect(stay.confirm).toHaveBeenCalledWith(LEAVE_WARNING);
    expect(stay.result).toBe(false);
  });

  it('should let the owner leave when there is no window to ask in', () => {
    expect(leave(true, null).result).toBe(true);
  });
});
