import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { AFTER_LOAD_LOADER } from './after-load-loader.token';
import { BrowserAfterLoad } from './browser-after-load';

describe('AFTER_LOAD_LOADER', () => {
  it('should load the after-load code and create it', async () => {
    const source = await firstValueFrom(TestBed.inject(AFTER_LOAD_LOADER)(window));

    expect(source).toBeInstanceOf(BrowserAfterLoad);
  });
});
