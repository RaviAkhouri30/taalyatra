import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { DeviceStoreService } from './device-store.service';

describe('DeviceStoreService', () => {
  function create(storage: Partial<Storage> | null): DeviceStoreService {
    TestBed.configureTestingModule({
      providers: [
        { provide: DOCUMENT, useValue: { defaultView: storage && { localStorage: storage } } },
      ],
    });
    return TestBed.inject(DeviceStoreService);
  }

  function memory(): Partial<Storage> {
    const values = new Map<string, string>();
    return {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
      removeItem: (key) => values.delete(key),
    };
  }

  it('should store, read back and remove a value', () => {
    const store = create(memory());

    expect(store.set('key', 'value')).toBe(true);
    expect(store.get('key')).toBe('value');
    store.remove('key');

    expect(store.get('key')).toBeNull();
  });

  it('should say a value did not fit when storage refuses it', () => {
    const store = create({
      ...memory(),
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    });

    expect(store.set('key', 'value')).toBe(false);
  });

  it('should do nothing when storage is blocked or missing', () => {
    const blocked = create({
      removeItem: () => {
        throw new Error('blocked');
      },
    });

    expect(() => {
      blocked.remove('key');
    }).not.toThrow();
  });

  it('should do nothing without a window', () => {
    const store = create(null);

    expect(store.set('key', 'value')).toBe(false);
    expect(() => {
      store.remove('key');
    }).not.toThrow();
  });
});
