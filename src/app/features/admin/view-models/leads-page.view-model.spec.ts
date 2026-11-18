import { TestBed } from '@angular/core/testing';
import { throwError } from 'rxjs';
import { ToastTone } from '@shared/enums/toast-tone.enum';
import { ToastService } from '@shared/services/toast.service';
import { LeadStatus } from '../models/lead.model';
import { LeadsService } from '../services/leads.service';
import { provideEditorTesting } from '../testing/editor-testing';
import { LEAD_MESSAGES, LeadsPageViewModel } from './leads-page.view-model';

describe('LeadsPageViewModel', () => {
  function setUp() {
    const testing = provideEditorTesting({
      'proposals/a': { name: 'Asha', eventType: 'Corporate', createdAt: { seconds: 2 } },
      'proposals/b': { name: 'Ravi', eventType: 'Wedding', createdAt: { seconds: 1 } },
    });
    const show = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        ...testing.providers,
        { provide: ToastService, useValue: { show } },
        LeadsPageViewModel,
      ],
    });
    const model = TestBed.inject(LeadsPageViewModel);
    model.init().subscribe();
    const lead = (id: string) => model.data()!.find((entry) => entry.id === id)!;
    return { model, show, lead, ...testing };
  }

  it('should list every lead, newest first, and count them', () => {
    const { model } = setUp();

    expect(model.shown().map((lead) => lead.name)).toEqual(['Asha', 'Ravi']);
    expect(model.count()).toBe('2 leads');
    expect(model.options().eventTypes.map((option) => option.value)).toEqual([
      'Corporate',
      'Wedding',
    ]);
  });

  it('should follow the filters, and show everything again when cleared', () => {
    const { model } = setUp();

    model.filters.patchValue({ eventType: 'Wedding' });
    expect(model.shown().map((lead) => lead.name)).toEqual(['Ravi']);
    expect(model.count()).toBe('Showing 1 of 2 leads');

    model.clearFilters();
    expect(model.shown()).toHaveLength(2);
  });

  it('should save a status and show it', () => {
    const { model, lead, store } = setUp();

    model.setStatus(lead('a'), LeadStatus.Won);

    expect(lead('a').status).toBe(LeadStatus.Won);
    expect(store.documents.get('proposals/a')).toMatchObject({ status: 'won' });
  });

  it('should say when a status could not be saved, and keep listening', () => {
    const { model, lead, show } = setUp();
    vi.spyOn(LeadsService.prototype, 'setStatus').mockReturnValueOnce(
      throwError(() => new Error('denied')),
    );

    model.setStatus(lead('a'), LeadStatus.Won);
    model.setStatus(lead('a'), LeadStatus.Lost);

    expect(show).toHaveBeenCalledWith(LEAD_MESSAGES.statusFailed, ToastTone.Error);
    expect(lead('a').status).toBe(LeadStatus.Lost);
  });

  it('should ask before removing, then remove for good', () => {
    const { model, lead, show, store } = setUp();

    model.askToRemove(lead('b'));
    expect(model.confirming()).toBe('b');
    model.remove(lead('b'));

    expect(model.shown().map((entry) => entry.id)).toEqual(['a']);
    expect(store.documents.has('proposals/b')).toBe(false);
    expect(model.confirming()).toBeNull();
    expect(show).toHaveBeenCalledWith(LEAD_MESSAGES.removed);
  });

  it('should let the owner change their mind', () => {
    const { model, lead } = setUp();
    model.askToRemove(lead('b'));

    model.cancelRemove();

    expect(model.confirming()).toBeNull();
  });

  it('should say when a removal failed, keeping the lead', () => {
    const { model, lead, show } = setUp();
    vi.spyOn(LeadsService.prototype, 'remove').mockReturnValueOnce(
      throwError(() => new Error('denied')),
    );

    model.remove(lead('b'));

    expect(show).toHaveBeenCalledWith(LEAD_MESSAGES.removeFailed, ToastTone.Error);
    expect(model.shown()).toHaveLength(2);
    expect(model.removing()).toBe(false);
  });

  it('should export the leads shown as a CSV file', () => {
    const { model, files } = setUp();
    model.filters.patchValue({ eventType: 'Corporate' });

    model.exportCsv();

    expect(files.downloads[0]).toMatchObject({
      name: 'taal-yatra-leads-2026-10-31.csv',
      type: 'text/csv;charset=utf-8',
    });
    expect(files.downloads[0]?.text).toContain('"Asha"');
    expect(files.downloads[0]?.text).not.toContain('"Ravi"');
  });

  it('should not export an empty list', () => {
    const { model, files, show } = setUp();
    model.filters.patchValue({ search: 'nobody' });

    model.exportCsv();

    expect(files.downloads).toEqual([]);
    expect(show).toHaveBeenCalledWith(LEAD_MESSAGES.noneToExport, ToastTone.Error);
  });

  it('should say when the leads could not be read', () => {
    vi.spyOn(LeadsService.prototype, 'leads').mockReturnValueOnce(
      throwError(() => new Error('denied')),
    );

    const { model } = setUp();

    expect(model.failed()).toBe(true);
    expect(model.shown()).toEqual([]);
  });
});
