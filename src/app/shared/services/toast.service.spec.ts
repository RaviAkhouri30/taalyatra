import { TestBed } from '@angular/core/testing';
import { ToastTone } from '@shared/enums/toast-tone.enum';
import { type IToastMessage } from '@shared/interfaces/i-toast';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  it('should forward each message, a confirmation unless told otherwise', () => {
    const service = TestBed.inject(ToastService);
    const received: IToastMessage[] = [];
    service.messages$.subscribe((message) => received.push(message));

    service.show('Copied');
    service.show('Failed', ToastTone.Error);

    expect(received).toEqual([
      { text: 'Copied', tone: ToastTone.Success },
      { text: 'Failed', tone: ToastTone.Error },
    ]);
  });
});
