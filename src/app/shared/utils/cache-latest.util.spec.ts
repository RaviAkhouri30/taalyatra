import { EMPTY, defer, firstValueFrom, of, toArray } from 'rxjs';
import { cacheLatest } from './cache-latest.util';

describe('cacheLatest', () => {
  it('should read once and replay the value to every later subscriber', async () => {
    const reads = vi.fn();
    const cached = defer(() => {
      reads();
      return of('value');
    }).pipe(cacheLatest());

    await firstValueFrom(cached);
    await expect(firstValueFrom(cached)).resolves.toBe('value');
    expect(reads).toHaveBeenCalledTimes(1);
  });

  it('should complete empty and retry for the next subscriber when the read fails', async () => {
    const answers = [EMPTY, of('value')];
    const cached = defer(() => answers.shift() ?? EMPTY).pipe(cacheLatest());

    await expect(firstValueFrom(cached.pipe(toArray()))).resolves.toEqual([]);
    await expect(firstValueFrom(cached)).resolves.toBe('value');
  });
});
