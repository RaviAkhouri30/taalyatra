import { firstValueFrom } from 'rxjs';
import { FakeVitalsReporter } from './fake-vitals-reporter';

describe('FakeVitalsReporter', () => {
  it('should report nothing', async () => {
    const reporter = new FakeVitalsReporter();

    expect(() => {
      reporter.markReady();
    }).not.toThrow();
    await expect(firstValueFrom(reporter.report(), { defaultValue: 'none' })).resolves.toBe('none');
  });
});
