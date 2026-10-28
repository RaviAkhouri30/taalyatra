import { TestBed } from '@angular/core/testing';
import { ToastTone } from '@shared/enums/toast-tone.enum';
import { ToastService } from '@shared/services/toast.service';
import { ToastHostComponent } from './toast-host.component';

describe('ToastHostComponent', () => {
  it('should render toasts inside a polite live region, errors styled apart', () => {
    const fixture = TestBed.createComponent(ToastHostComponent);
    fixture.detectChanges();
    const toast = TestBed.inject(ToastService);

    toast.show('Address copied to clipboard');
    toast.show('Couldn’t copy', ToastTone.Error);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const region = element.querySelector('[role="status"]');

    expect(region?.getAttribute('aria-live')).toBe('polite');
    expect(region?.querySelectorAll('.toast')).toHaveLength(2);
    expect(element.querySelector('.toast--error')?.textContent).toBe('Couldn’t copy');
  });
});
