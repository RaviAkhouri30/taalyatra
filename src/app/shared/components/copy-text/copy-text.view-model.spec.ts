import { TestBed } from '@angular/core/testing';
import { throwError } from 'rxjs';
import { FakeClipboardService } from '@core/backends/fake/fake-clipboard.service';
import { IClipboardService } from '@core/interfaces/i-clipboard-service';
import { ToastTone } from '@shared/enums/toast-tone.enum';
import { type IToastMessage } from '@shared/interfaces/i-toast';
import { ToastService } from '@shared/services/toast.service';
import { CopyTextViewModel } from './copy-text.view-model';

describe('CopyTextViewModel', () => {
  const request = { text: 'Kharadi, Pune', copied: 'Copied', failed: 'Failed' };

  function create(clipboard: IClipboardService = new FakeClipboardService()) {
    TestBed.configureTestingModule({
      providers: [CopyTextViewModel, { provide: IClipboardService, useValue: clipboard }],
    });
    const model = TestBed.inject(CopyTextViewModel);
    const toasts: IToastMessage[] = [];
    TestBed.inject(ToastService).messages$.subscribe((toast) => toasts.push(toast));
    model.init().subscribe();
    return { model, toasts };
  }

  it('should copy the text and confirm with a toast', () => {
    const clipboard = new FakeClipboardService();
    const { model, toasts } = create(clipboard);

    model.copy(request);

    expect(clipboard.copied).toEqual(['Kharadi, Pune']);
    expect(toasts).toEqual([{ text: 'Copied', tone: ToastTone.Success }]);
  });

  it('should show an error toast when copying fails', () => {
    const { model, toasts } = create({ copy: () => throwError(() => new Error('denied')) });

    model.copy(request);

    expect(toasts).toEqual([{ text: 'Failed', tone: ToastTone.Error }]);
  });

  it('should show and hide the tooltip', () => {
    const { model } = create();

    model.showTooltip();
    expect(model.tooltipVisible()).toBe(true);
    model.hideTooltip();
    expect(model.tooltipVisible()).toBe(false);
  });

  it('should show no toast when the message is missing from storage', () => {
    const { model, toasts } = create();

    model.copy({ ...request, copied: '' });

    expect(toasts).toEqual([]);
  });
});
