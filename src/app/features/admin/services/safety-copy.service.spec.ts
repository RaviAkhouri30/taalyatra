import { TestBed } from '@angular/core/testing';
import { DeviceStoreService } from './device-store.service';
import { CLOCK } from '@core/tokens/clock.token';
import { EDITOR_NOW, memoryLocalStore } from '../testing/editor-testing';
import { SAFETY_COPY_KEY_PREFIX, SafetyCopyService } from './safety-copy.service';

describe('SafetyCopyService', () => {
  function setUp() {
    const localStore = memoryLocalStore();
    TestBed.configureTestingModule({
      providers: [
        { provide: DeviceStoreService, useValue: localStore },
        { provide: CLOCK, useValue: { now: () => EDITOR_NOW } },
      ],
    });
    return { safety: TestBed.inject(SafetyCopyService), localStore };
  }

  it('should keep a document’s changes with the time they were made', () => {
    const { safety } = setUp();

    safety.keep('home/hero', { title: 'Typed' });

    expect(safety.find('home/hero')).toEqual({
      path: 'home/hero',
      content: { title: 'Typed' },
      savedAt: EDITOR_NOW.toISOString(),
    });
  });

  it('should find nothing when there is no copy, or it is unreadable', () => {
    const { safety, localStore } = setUp();
    localStore.values.set(`${SAFETY_COPY_KEY_PREFIX}home/offer`, '{not json');
    localStore.values.set(`${SAFETY_COPY_KEY_PREFIX}team`, '{"content":[],"savedAt":"x"}');

    expect(safety.find('home/hero')).toBeNull();
    expect(safety.find('home/offer')).toBeNull();
    expect(safety.find('team')).toBeNull();
  });

  it('should drop a copy once that exact change is saved, but keep a newer one', () => {
    const { safety } = setUp();
    safety.keep('home/hero', { title: 'Newer' });

    safety.clearIfSaved('home/hero', { title: 'Older' });
    expect(safety.find('home/hero')).not.toBeNull();
    safety.clearIfSaved('home/hero', { title: 'Newer' });

    expect(safety.find('home/hero')).toBeNull();
  });

  it('should offer only copies that differ from what was loaded, dropping the rest', () => {
    const { safety } = setUp();
    safety.keep('home/hero', { title: 'Unsaved' });
    safety.keep('home/offer', { title: 'Saved after all' });

    const unsaved = safety.unsaved(
      ['home/hero', 'home/offer', 'team'],
      new Map([
        ['home/hero', { title: 'Stored' }],
        ['home/offer', { title: 'Saved after all' }],
      ]),
    );

    expect(unsaved.map((copy) => copy.path)).toEqual(['home/hero']);
    expect(safety.find('home/offer')).toBeNull();
  });
});
