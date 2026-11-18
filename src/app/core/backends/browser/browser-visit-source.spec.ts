import { firstValueFrom, toArray } from 'rxjs';
import { ADMIN_DEVICE_KEY } from '@shared/constants/visit.constants';
import { BrowserVisitSource, VISIT_COUNTED_KEY } from './browser-visit-source';

describe('BrowserVisitSource', () => {
  interface IOptions {
    readonly path?: string;
    readonly local?: Record<string, string>;
    readonly session?: Record<string, string>;
    readonly blocked?: boolean;
  }

  function storage(seed: Record<string, string>, blocked: boolean) {
    const values = new Map(Object.entries(seed));
    const refuse = () => {
      throw new DOMException('The operation is insecure.', 'SecurityError');
    };
    return {
      values,
      getItem: blocked ? refuse : (key: string) => values.get(key) ?? null,
      setItem: blocked
        ? refuse
        : (key: string, value: string) => {
            values.set(key, value);
          },
    };
  }

  function setUp(options: IOptions = {}) {
    const session = storage(options.session ?? {}, options.blocked ?? false);
    const view = {
      location: { pathname: options.path ?? '/shows' },
      navigator: { userAgent: 'Mozilla/5.0' },
      innerWidth: 1280,
      localStorage: storage(options.local ?? {}, options.blocked ?? false),
      sessionStorage: session,
    };
    const source = new BrowserVisitSource(view as unknown as Window);
    return { count: () => firstValueFrom(source.count().pipe(toArray())), session };
  }

  it('should count one visit with only its page and device', async () => {
    const { count } = setUp();

    expect(await count()).toEqual([{ page: '/shows', device: 'desktop' }]);
  });

  it('should not count a reload in the same tab', async () => {
    const { count } = setUp();

    await count();

    expect(await count()).toEqual([]);
  });

  it('should remember the tab with a plain yes, never an id', async () => {
    const { count, session } = setUp();

    await count();

    expect([...session.values]).toEqual([[VISIT_COUNTED_KEY, '1']]);
  });

  it('should not count the owner’s own browser', async () => {
    const { count } = setUp({ local: { [ADMIN_DEVICE_KEY]: '1' } });

    expect(await count()).toEqual([]);
  });

  it('should not count a page that is not reported', async () => {
    const { count } = setUp({ path: '/admin' });

    expect(await count()).toEqual([]);
  });

  it('should still count when the browser refuses storage', async () => {
    const { count } = setUp({ blocked: true });

    expect(await count()).toHaveLength(1);
  });
});
