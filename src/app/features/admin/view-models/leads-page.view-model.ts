import { Injectable, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  EMPTY,
  type Observable,
  Subject,
  catchError,
  concatMap,
  exhaustMap,
  finalize,
  map,
  merge,
  tap,
} from 'rxjs';
import { IFileService } from '@core/interfaces/i-file-service';
import { LoggerService } from '@core/services/logger.service';
import { CLOCK } from '@core/tokens/clock.token';
import { ViewModel } from '@shared/base/view-model';
import { ToastTone } from '@shared/enums/toast-tone.enum';
import { ToastService } from '@shared/services/toast.service';
import { createLeadFilterForm } from '../forms/lead-filter-form';
import { type Lead, type LeadStatus } from '../models/lead.model';
import {
  LEADS_CSV_TYPE,
  NO_LEAD_FILTER,
  filterLeads,
  filterOptions,
  leadsCsv,
  leadsCsvName,
} from '../models/leads-page.model';
import { AccessService } from '../services/access.service';
import { LeadsService } from '../services/leads.service';

/** What the owner is told about the Leads page's actions. */
export const LEAD_MESSAGES = {
  statusFailed: 'Couldn’t change the status. Please try again.',
  removed: 'The lead is removed for good.',
  removeFailed: 'Couldn’t remove the lead. Nothing changed; please try again.',
  noneToExport: 'No leads to export. Change the filters to include some.',
} as const;

/** A status change the owner asked for. */
interface IStatusChange {
  readonly lead: Lead;
  readonly status: LeadStatus;
}

/**
 * The Leads page (0018 V12): every proposal, filtered, with its status changed, exported as a
 * CSV file or removed for good.
 */
@Injectable()
export class LeadsPageViewModel extends ViewModel<readonly Lead[]> {
  /** The filters' form; the list follows it as the owner types or chooses. */
  public readonly filters = createLeadFilterForm();
  public readonly failed = signal(false);
  /** The lead whose removal waits for the owner to confirm. */
  public readonly confirming = signal<string | null>(null);
  public readonly removing = signal(false);
  public readonly options = computed(() => filterOptions(this.data() ?? []));
  public readonly shown = computed(() => filterLeads(this.data() ?? [], this.filter()));
  public readonly count = computed(() => {
    const all = this.data()?.length ?? 0;
    const shown = this.shown().length;
    return shown === all
      ? `${String(all)} leads`
      : `Showing ${String(shown)} of ${String(all)} leads`;
  });

  /** The signed-in account's email, for "by you" on a lead. */
  public readonly me = computed(() => this.permissions()?.email ?? '');
  /** Removing a lead is the owner's only, Leads given or not (0022 D2). */
  public readonly canRemove = computed(() => this.permissions()?.isOwner === true);

  private readonly permissions = toSignal(inject(AccessService).permissions$);
  private readonly filter = toSignal(
    this.filters.valueChanges.pipe(map(() => this.filters.getRawValue())),
    { initialValue: NO_LEAD_FILTER },
  );
  private readonly leads = inject(LeadsService);
  private readonly files = inject(IFileService);
  private readonly toasts = inject(ToastService);
  private readonly logger = inject(LoggerService);
  private readonly clock = inject(CLOCK);
  private readonly statusChanges = new Subject<IStatusChange>();
  private readonly removals = new Subject<Lead>();

  /**
   * @param lead The lead.
   * @param status Its new status.
   */
  public setStatus(lead: Lead, status: LeadStatus): void {
    this.statusChanges.next({ lead, status });
  }

  /** @param lead The lead to remove, once the owner confirms. */
  public askToRemove(lead: Lead): void {
    this.confirming.set(lead.id);
  }

  public cancelRemove(): void {
    this.confirming.set(null);
  }

  /** @param lead The lead to remove for good. */
  public remove(lead: Lead): void {
    this.removals.next(lead);
  }

  public clearFilters(): void {
    this.filters.reset();
  }

  /** Downloads the leads shown (with the filters applied) as a spreadsheet file. */
  public exportCsv(): void {
    const shown = this.shown();
    if (shown.length === 0) {
      this.toasts.show(LEAD_MESSAGES.noneToExport, ToastTone.Error);
      return;
    }
    this.files.download(leadsCsvName(this.clock.now()), leadsCsv(shown), LEADS_CSV_TYPE);
  }

  protected override attachViewHandler(): Observable<unknown> {
    return this.leads.leads().pipe(
      tap((leads) => {
        this.setData(leads);
      }),
      catchError((error: unknown) => {
        this.logger.error('Leads failed to load', error);
        this.failed.set(true);
        return EMPTY;
      }),
    );
  }

  protected override attachCommandHandler(): Observable<unknown> {
    return merge(
      // concatMap: changes are saved in the order made, so the last one chosen wins.
      this.statusChanges.pipe(concatMap((change) => this.saveStatus(change))),
      // exhaustMap: a second click while removing is ignored.
      this.removals.pipe(exhaustMap((lead) => this.removeLead(lead))),
    );
  }

  private saveStatus({ lead, status }: IStatusChange): Observable<unknown> {
    return this.leads.setStatus(lead, status, this.me()).pipe(
      tap((saved) => {
        this.replace(lead.id, saved);
      }),
      // Inside the concatMap, so one failure can't end the stream.
      catchError(() => {
        this.toasts.show(LEAD_MESSAGES.statusFailed, ToastTone.Error);
        return EMPTY;
      }),
    );
  }

  private removeLead(lead: Lead): Observable<unknown> {
    this.removing.set(true);
    return this.leads.remove(lead).pipe(
      tap(() => {
        this.replace(lead.id, null);
        this.confirming.set(null);
        this.toasts.show(LEAD_MESSAGES.removed);
      }),
      catchError(() => {
        this.toasts.show(LEAD_MESSAGES.removeFailed, ToastTone.Error);
        return EMPTY;
      }),
      finalize(() => {
        this.removing.set(false);
      }),
    );
  }

  /** Puts the saved lead in its place, or takes it out when it's gone. */
  private replace(id: string, saved: Lead | null): void {
    const leads = this.data() ?? [];
    this.setData(
      saved === null
        ? leads.filter((lead) => lead.id !== id)
        : leads.map((lead) => (lead.id === id ? saved : lead)),
    );
  }
}
