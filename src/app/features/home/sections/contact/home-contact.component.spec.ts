import { TestBed } from '@angular/core/testing';
import { type Observable, Subject, of, throwError } from 'rxjs';
import { IEmailService } from '@core/interfaces/i-email-service';
import { LoggerService } from '@core/services/logger.service';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { queryAll, texts } from '@shared/testing/fixtures';
import { HOME, stubBackend } from '../../testing/home-fixtures';
import { HomeContactComponent } from './home-contact.component';
import { PROPOSAL_MAX_LENGTH } from './proposal-limits.constants';
import { ProposalsService } from './proposals.service';

describe('HomeContactComponent', () => {
  const ok = (): Observable<void> => of(undefined);
  const offline = (): Observable<void> => throwError(() => new Error('offline'));

  function render(body: unknown, send = ok, store = ok) {
    const backend = stubBackend(body);
    const email = { send: vi.fn(send) };
    const proposals = { create: vi.fn(store) };
    const logger = { error: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        backend.provider,
        { provide: IEmailService, useValue: email },
        { provide: ProposalsService, useValue: proposals },
        { provide: LoggerService, useValue: logger },
      ],
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
    const status = () => element.querySelector('[role="status"]')?.textContent ?? '';
    const alert = () => element.querySelector('[role="alert"]')?.textContent ?? '';
    return {
      element,
      get: backend.get,
      send: email.send,
      create: proposals.create,
      log: logger.error,
      field,
      type,
      submit,
      whatsApp,
      status,
      alert,
    };
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

  it('should email and store a valid request, confirm it and clear the answers', () => {
    const { send, create, submit, type, field, status } = render(HOME.contact);
    type('name', 'Asha');
    type('phone', '98765 43210');

    submit();

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ subject: 'Proposal request: Drum Circle', fromName: 'Asha' }),
    );
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Asha', phone: '98765 43210', experience: 'Drum Circle' }),
    );
    expect(status()).toContain('on its way');
    expect(field('name').value).toBe('');
    expect(field('eventType').value).toBe('Corporate team');
  });

  it('should confirm and log the email failure when only the stored copy succeeds', () => {
    const { submit, type, status, log } = render(HOME.contact, offline, ok);
    type('name', 'Asha');
    type('phone', '9876543210');

    submit();

    expect(status()).toContain('on its way');
    expect(log).toHaveBeenCalledWith('Proposal email failed', new Error('offline'));
  });

  it('should confirm when only the email succeeds', () => {
    const { submit, type, status } = render(HOME.contact, ok, offline);
    type('name', 'Asha');
    type('phone', '9876543210');

    submit();

    expect(status()).toContain('on its way');
  });

  it('should limit text fields to the lengths the database accepts', () => {
    const { field, type, submit, send } = render(HOME.contact);

    expect(field('name').getAttribute('maxlength')).toBe(String(PROPOSAL_MAX_LENGTH.name));
    expect(field('message').getAttribute('maxlength')).toBe(String(PROPOSAL_MAX_LENGTH.message));
    type('name', 'A'.repeat(PROPOSAL_MAX_LENGTH.name + 1));
    type('phone', '9876543210');
    submit();

    expect(send).not.toHaveBeenCalled();
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

  it('should tell the visitor when neither the email nor the stored copy succeeds', () => {
    const { submit, type, alert, field } = render(HOME.contact, offline, offline);
    type('name', 'Asha');
    type('phone', '9876543210');

    submit();

    expect(alert()).toContain('didn’t send');
    expect(field('name').value).toBe('Asha');
  });

  it('should render nothing until the section has loaded', () => {
    expect(render(null).element.querySelector('section')).toBeNull();
  });
});
