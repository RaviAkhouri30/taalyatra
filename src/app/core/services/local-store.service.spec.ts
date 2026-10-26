import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { LocalStoreService } from './local-store.service';

describe('LocalStoreService', () => {
  function create(storage: Pick<Storage, 'getItem' | 'setItem'> | undefined): LocalStoreService {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: DOCUMENT,
          useValue: { defaultView: storage ? { localStorage: storage } : null },
        },
      ],
    });
    return TestBed.inject(LocalStoreService);
  }

  it('should store and read values', () => {
    const values = new Map<string, string>();
    const store = create({
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
    });

    store.set('ty_best', '120');

    expect(store.get('ty_best')).toBe('120');
    expect(store.get('missing')).toBeNull();
  });

  it('should fall back quietly when storage throws', () => {
    const blocked = (): never => {
      throw new Error('blocked');
    };
    const store = create({ getItem: blocked, setItem: blocked });

    expect(() => {
      store.set('ty_best', '1');
    }).not.toThrow();
    expect(store.get('ty_best')).toBeNull();
  });

  it('should return nothing when there is no window', () => {
    const store = create(undefined);

    store.set('ty_best', '1');

    expect(store.get('ty_best')).toBeNull();
  });
});
