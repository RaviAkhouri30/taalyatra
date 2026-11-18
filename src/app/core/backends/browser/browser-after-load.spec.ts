import { Subject } from 'rxjs';
import {
  type IAfterLoadReport,
  type IVisit,
  type IVitalsMeasurement,
} from '@core/interfaces/i-vitals-reporter';
import { BrowserAfterLoad } from './browser-after-load';
import { BrowserVisitSource } from './browser-visit-source';
import { BrowserVitalsSource } from './browser-vitals-source';

describe('BrowserAfterLoad', () => {
  const visit: IVisit = { page: '/', device: 'phone' };
  const measured = { page: '/', device: 'phone', lcp: 900 } as unknown as IVitalsMeasurement;

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should send the visit at once, and the speed report once it is measured', () => {
    const visits = new Subject<IVisit>();
    const measurement = new Subject<IVitalsMeasurement>();
    vi.spyOn(BrowserVisitSource.prototype, 'count').mockReturnValue(visits);
    vi.spyOn(BrowserVitalsSource.prototype, 'measure').mockReturnValue(measurement);
    const sent: IAfterLoadReport[] = [];
    new BrowserAfterLoad(window).reports().subscribe((report) => sent.push(report));

    visits.next(visit);
    expect(sent).toEqual([{ endpoint: 'visits', body: visit }]);

    measurement.next(measured);
    expect(sent.at(-1)).toEqual({ endpoint: 'vitals', body: measured });
  });
});
