import { TestBed } from '@angular/core/testing';
import { throwError } from 'rxjs';
import { LoggerService } from '@core/services/logger.service';
import { ChartPeriod } from '../models/chart';
import { VisitsService } from '../services/visits.service';
import { provideEditorTesting } from '../testing/editor-testing';
import { VisitsPageViewModel } from './visits-page.view-model';

describe('VisitsPageViewModel', () => {
  function setUp() {
    // EDITOR_NOW is 31 Oct 2026 in Pune.
    const testing = provideEditorTesting({
      'visitDays/2026-10-30': { total: 4, pages: { '/': 4 }, devices: { phone: 4 } },
      'proposals/a': {
        name: 'Asha',
        createdAt: { seconds: Date.parse('2026-10-30T06:00:00Z') / 1000 },
      },
    });
    TestBed.configureTestingModule({ providers: [...testing.providers, VisitsPageViewModel] });
    const model = TestBed.inject(VisitsPageViewModel);
    return { model, start: () => model.init().subscribe() };
  }

  it('should draw visits and proposals by day to start with', () => {
    const { model, start } = setUp();

    start();

    expect(model.period()).toBe(ChartPeriod.Day);
    expect(model.visits()?.total).toBe(4);
    expect(model.proposals()?.total).toBe(1);
    expect(model.pages()[0]).toEqual({ name: 'Home page', count: 4, share: 100 });
    expect(model.devices()[0]?.name).toBe('Phone');
  });

  it('should redraw by the period the owner picks', () => {
    const { model, start } = setUp();
    start();

    model.show(ChartPeriod.Month);

    expect(model.visits()?.bars).toHaveLength(12);
  });

  it('should say when the numbers could not be read', () => {
    const { model, start } = setUp();
    vi.spyOn(VisitsService.prototype, 'load').mockReturnValueOnce(
      throwError(() => new Error('denied')),
    );
    const error = vi.spyOn(TestBed.inject(LoggerService), 'error');

    start();

    expect(model.failed()).toBe(true);
    expect(model.visits()).toBeNull();
    expect(model.pages()).toEqual([]);
    expect(error).toHaveBeenCalled();
  });
});
