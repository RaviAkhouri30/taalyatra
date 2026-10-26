import { TestBed } from '@angular/core/testing';
import { type Observable, Subject, of, throwError } from 'rxjs';
import { IEmailService } from '@core/interfaces/i-email-service';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { queryAll, texts } from '@shared/testing/fixtures';
import { HOME, stubBackend } from '../../testing/home-fixtures';
import { HomeContactComponent } from './home-contact.component';

describe('HomeContactComponent', () => {
  function render(body: unknown, send: () => Observable<void> = () => of(undefined)) {
    const backend = stubBackend(body);
    const email = { send: vi.fn(send) };
    TestBed.configureTestingModule({
      providers: [backend.provider, { provide: IEmailService, useValue: email }],
    });
    const fixture = TestBed.createComponent(HomeContactComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const field = (name: string) =>
      element.querySelector<HTMLInputElement>(`[formControlName="${name}"]`)!;
    const type = (name: string, value: string) => {
      const input = field(name);
      input.value = value;
      input.dispatchEvent(new Event('input'));
      input.dispatchEvent(new Event('blur'));
      fixture.detectChanges();
    };
    const submit = () => {
      element.querySelector('form')!.dispatchEvent(new Event('submit'));
      fixture.detectChanges();
    };
    const whatsApp = () => element.querySelector('.pbtns a')!.getAttribute('href')!;
    return { element, get: backend.get, send: email.send, field, type, submit, whatsApp };
  }

  it('should render the header, the form with its defaults, and the contact rows', () => {
    const { element, get, field } = render(HOME.contact);

    expect(get).toHaveBeenCalledWith(ApiEndpoint.HomeContact);
    expect(element.querySelector('section')?.id).toBe('contact');
    expect(texts(element, '.assure li')).toHaveLength(3);
    expect(field('experience').value).toBe('Drum Circle');
    expect(field('groupSize').value).toBe('20–50');
    expect(queryAll(element, 'optgroup').map((group) => group.getAttribute('label'))).toEqual([
      'Workshops & circles',
      'Shows & performances',
    ]);
    expect(queryAll(element, '.crow').map((row) => row.getAttribute('href'))).toEqual([
      'https://wa.me/919284276168',
      'tel:+919284276168',
      'mailto:contact@taalyatra.in',
    ]);
    expect(texts(element, '.ctxt small')).toEqual([
      'Fastest reply · +91 92842 76168',
      'Opens 9:00 am · +91 92842 76168',
      'contact@taalyatra.in',
    ]);
  });

  it('should keep the WhatsApp link in step with the answers', () => {
    const { type, whatsApp } = render(HOME.contact);

    expect(decodeURIComponent(whatsApp())).toContain('Experience: Drum Circle');
    type('name', 'Asha');

    expect(whatsApp()).toMatch(/^https:\/\/wa\.me\/919284276168\?text=/);
    expect(decodeURIComponent(whatsApp())).toContain('Name: Asha');
  });

  it('should show accessible errors and not send an incomplete request', () => {
    const { element, send, submit, field } = render(HOME.contact);

    submit();

    expect(send).not.toHaveBeenCalled();
    expect(texts(element, '.err')).toEqual([
      'Please tell us your name.',
      'Please enter a 10-digit phone number.',
    ]);
    expect(field('name').getAttribute('aria-invalid')).toBe('true');
    expect(field('name').getAttribute('aria-describedby')).toBe('proposal-name-error');
    expect(field('email').getAttribute('aria-invalid')).toBe('false');
  });

  it('should send a valid request, confirm it and clear the answers', () => {
    const { element, send, submit, type, field } = render(HOME.contact);
    type('name', 'Asha');
    type('phone', '98765 43210');

    submit();

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ subject: 'Proposal request: Drum Circle', fromName: 'Asha' }),
    );
    expect(element.querySelector('[role="status"]')?.textContent).toContain('on its way');
    expect(field('name').value).toBe('');
    expect(field('eventType').value).toBe('Corporate team');
  });

  it('should disable the submit button while sending and ignore repeat clicks', () => {
    const pending = new Subject<void>();
    const { element, send, submit, type } = render(HOME.contact, () => pending);
    type('name', 'Asha');
    type('phone', '9876543210');

    submit();
    submit();
    const button = element.querySelector<HTMLButtonElement>('button[type="submit"]')!;

    expect(send).toHaveBeenCalledTimes(1);
    expect(button.disabled).toBe(true);
    expect(button.textContent.trim()).toBe('Sending…');
  });

  it('should tell the visitor when the request could not be sent', () => {
    const { element, submit, type } = render(HOME.contact, () =>
      throwError(() => new Error('offline')),
    );
    type('name', 'Asha');
    type('phone', '9876543210');

    submit();

    expect(element.querySelector('[role="alert"]')?.textContent).toContain('didn’t send');
  });

  it('should render nothing until the section has loaded', () => {
    expect(render(null).element.querySelector('section')).toBeNull();
  });
});
