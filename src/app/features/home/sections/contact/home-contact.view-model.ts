import { Injectable, type Signal, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  type Observable,
  Subject,
  catchError,
  combineLatest,
  exhaustMap,
  filter,
  map,
  of,
  startWith,
  tap,
} from 'rxjs';
import { IEmailService } from '@core/interfaces/i-email-service';
import { ViewModel } from '@shared/base/view-model';
import { SiteConfigService } from '@shared/services/site-config.service';
import { ContactModel } from './contact.model';
import { HomeContactService } from './home-contact.service';
import { applyDefaults, createProposalForm } from './proposal-form';
import { ProposalStatus } from './proposal-status.enum';

/**
 * Owns the proposal form: loads its copy, keeps the WhatsApp link in step with the answers, and
 * sends the request by email. Repeated clicks while sending are ignored (`exhaustMap`).
 */
@Injectable()
export class HomeContactViewModel extends ViewModel<ContactModel> {
  public readonly form = createProposalForm();
  public readonly status = signal(ProposalStatus.Idle);
  /** WhatsApp link carrying the current answers. */
  public readonly whatsAppHref: Signal<string>;

  private readonly contactService = inject(HomeContactService);
  private readonly siteConfigService = inject(SiteConfigService);
  private readonly emailService = inject(IEmailService);
  private readonly submits = new Subject<void>();
  private readonly value = toSignal(
    this.form.valueChanges.pipe(map(() => this.form.getRawValue())),
    { initialValue: this.form.getRawValue() },
  );

  public constructor() {
    super();
    // Assigned here because it reads `value`, a private field declared after the public ones.
    this.whatsAppHref = computed(() => this.data()?.whatsAppHref(this.value()) ?? '');
  }

  /** Sends the request, or reveals the errors when the form is invalid. */
  public submit(): void {
    this.submits.next();
  }

  protected override attachViewHandler(): Observable<unknown> {
    return combineLatest([
      this.contactService.attachViewDataHandler(),
      this.siteConfigService.getSiteConfig(),
    ]).pipe(
      tap(([dto, site]) => {
        applyDefaults(this.form, dto.form);
        this.setData(new ContactModel(dto, site.contact));
      }),
    );
  }

  protected override attachCommandHandler(): Observable<unknown> {
    return this.submits.pipe(
      tap(() => {
        this.form.markAllAsTouched();
      }),
      map(() => this.data()),
      // The form only renders once its copy has loaded, so a model is always present here.
      filter((model): model is ContactModel => model !== undefined && this.form.valid),
      // exhaustMap: clicks while a request is in flight are ignored, never queued or doubled.
      exhaustMap((model) => this.send(model)),
      tap((status) => {
        this.status.set(status);
      }),
    );
  }

  /** @returns The request's status: sending, then sent or failed. */
  private send(model: ContactModel): Observable<ProposalStatus> {
    return this.emailService.send(model.message.email(this.form.getRawValue())).pipe(
      tap(() => {
        this.form.reset();
        applyDefaults(this.form, model.form);
      }),
      map(() => ProposalStatus.Sent),
      catchError(() => of(ProposalStatus.Failed)),
      startWith(ProposalStatus.Sending),
    );
  }
}
