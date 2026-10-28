import { Injectable, type Signal, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  type Observable,
  Subject,
  catchError,
  combineLatest,
  defaultIfEmpty,
  exhaustMap,
  filter,
  forkJoin,
  map,
  of,
  startWith,
  tap,
} from 'rxjs';
import { IEmailService } from '@core/interfaces/i-email-service';
import { LoggerService } from '@core/services/logger.service';
import { ViewModel } from '@shared/base/view-model';
import { SiteConfigService } from '@shared/services/site-config.service';
import { ContactModel } from './contact.model';
import { HomeContactService } from './home-contact.service';
import { applyDefaults, createProposalForm } from './proposal-form';
import { ProposalStatus } from './proposal-status.enum';
import { ProposalsService } from './proposals.service';

/**
 * Owns the proposal form: loads its copy, keeps the WhatsApp link in step with the answers, and
 * both emails and stores the request. Repeated clicks while sending are ignored (`exhaustMap`).
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
  private readonly proposalsService = inject(ProposalsService);
  private readonly logger = inject(LoggerService);
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

  /**
   * Emails the request and stores it at the same time. The visitor sees "sent" when either
   * channel works: the lead is captured as long as one copy of it exists.
   * @returns The request's status: sending, then sent or failed.
   */
  private send(model: ContactModel): Observable<ProposalStatus> {
    const value = this.form.getRawValue();
    // A failed store is reported by HttpsErrorHandler; the email channel reports its own.
    const email$ = this.emailService.send(model.message.email(value)).pipe(
      tap({
        error: (error: unknown) => {
          this.logger.error('Proposal email failed', error);
        },
      }),
    );
    // forkJoin: both channels run in parallel, and since succeeded() never errors, one failure
    // can't cancel the other; it waits for both outcomes.
    return forkJoin([succeeded(email$), succeeded(this.proposalsService.create(value))]).pipe(
      map((outcomes) => (outcomes.includes(true) ? ProposalStatus.Sent : ProposalStatus.Failed)),
      tap((status) => {
        if (status === ProposalStatus.Sent) {
          this.form.reset();
          applyDefaults(this.form, model.form);
        }
      }),
      startWith(ProposalStatus.Sending),
    );
  }
}

/** @returns `true` once `channel$` succeeds; `false` when it fails or ends without confirming. */
function succeeded(channel$: Observable<void>): Observable<boolean> {
  return channel$.pipe(
    map(() => true),
    catchError(() => of(false)),
    defaultIfEmpty(false),
  );
}
