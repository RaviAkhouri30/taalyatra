import { TestBed } from '@angular/core/testing';
import { TOAST_DURATION_MS } from '@shared/constants/toast.constants';
import { ToastTone } from '@shared/enums/toast-tone.enum';
import { ToastService } from '@shared/services/toast.service';
import { ToastHostViewModel } from './toast-host.view-model';

describe('ToastHostViewModel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function create() {
    TestBed.configureTestingModule({ providers: [ToastHostViewModel] });
    const model = TestBed.inject(ToastHostViewModel);
    model.init().subscribe();
    return { model, toast: TestBed.inject(ToastService) };
  }

  it('should show each message, then remove it after its own duration', () => {
    const { model, toast } = create();

    toast.show('First');
    vi.advanceTimersByTime(1000);
    toast.show('Second', ToastTone.Error);

    expect(model.toasts().map(({ text }) => text)).toEqual(['First', 'Second']);
    vi.advanceTimersByTime(TOAST_DURATION_MS - 1000);
    expect(model.toasts().map(({ text }) => text)).toEqual(['Second']);
    vi.advanceTimersByTime(1000);
    expect(model.toasts()).toEqual([]);
  });
});
