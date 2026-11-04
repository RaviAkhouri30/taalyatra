import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { BrowserVitalsSource } from './browser-vitals-source';
import { VITALS_SOURCE_LOADER } from './vitals-source-loader.token';

describe('VITALS_SOURCE_LOADER', () => {
  it('should load the measuring code and create it', async () => {
    const source = await firstValueFrom(TestBed.inject(VITALS_SOURCE_LOADER)(window));

    expect(source).toBeInstanceOf(BrowserVitalsSource);
  });
});
