import { TestBed } from '@angular/core/testing';
import { CLOCK } from './clock.token';

describe('CLOCK', () => {
  it('should tell the current time when nothing overrides it', () => {
    const before = Date.now();

    const now = TestBed.inject(CLOCK).now().getTime();

    expect(now).toBeGreaterThanOrEqual(before);
    expect(now).toBeLessThanOrEqual(Date.now());
  });
});
