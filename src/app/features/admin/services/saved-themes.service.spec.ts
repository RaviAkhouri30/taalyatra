import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, throwError } from 'rxjs';
import { IDocumentStore } from '@core/interfaces/i-document-store';
import { CLOCK } from '@core/tokens/clock.token';
import { SavedTheme } from '../models/saved-theme.model';
import { MemoryDocumentStore } from '../testing/memory-document-store';
import {
  SAVED_THEME_DOCUMENT,
  SAVED_THEME_ID,
  SAVED_THEME_PATH,
  SAVED_THEME_VALUES,
} from '../testing/saved-theme.fixture';
import { NoThemeIdError, SavedThemesService } from './saved-themes.service';

const NOW = new Date('2026-11-22T09:30:00.000Z');
const NEW_ID = '1f8fad5b-d9cb-469f-a165-70867728950e';

describe('SavedThemesService', () => {
  function setUp(
    seed: ConstructorParameters<typeof MemoryDocumentStore>[0] = {},
    view: object | null = { crypto: { randomUUID: () => NEW_ID } },
  ) {
    const store = new MemoryDocumentStore(seed);
    TestBed.configureTestingModule({
      providers: [
        SavedThemesService,
        { provide: IDocumentStore, useValue: store },
        { provide: CLOCK, useValue: { now: () => NOW } },
        { provide: DOCUMENT, useValue: { defaultView: view } },
      ],
    });
    return { service: TestBed.inject(SavedThemesService), store };
  }

  const spring = () => SavedTheme.from(SAVED_THEME_ID, SAVED_THEME_DOCUMENT)!;

  it('should list the saved themes by name, leaving out a malformed one, when loaded', async () => {
    const { service } = setUp({
      [SAVED_THEME_PATH]: SAVED_THEME_DOCUMENT,
      [`savedThemes/${NEW_ID}`]: { ...SAVED_THEME_DOCUMENT, name: 'Autumn' },
      'savedThemes/bad': SAVED_THEME_DOCUMENT,
    });

    await firstValueFrom(service.load());

    expect(service.themes().map((theme) => theme.name)).toEqual(['Autumn', 'Spring show']);
    expect(service.loadFailed()).toBe(false);
  });

  it('should say so and list none when they can’t be read', async () => {
    const { service, store } = setUp();
    vi.spyOn(store, 'readAll').mockReturnValue(throwError(() => new Error('offline')));

    await firstValueFrom(service.load());

    expect(service.loadFailed()).toBe(true);
    expect(service.themes()).toEqual([]);
  });

  it('should store the form under a new id and the time, then list it, when saved', async () => {
    const { service, store } = setUp();

    const saved = await firstValueFrom(service.save(' Spring show ', SAVED_THEME_VALUES));

    expect(saved.id).toBe(NEW_ID);
    expect(store.documents.get(`savedThemes/${NEW_ID}`)).toEqual({
      name: 'Spring show',
      savedAt: NOW.toISOString(),
      theme: SAVED_THEME_VALUES,
    });
    expect(service.themes()).toEqual([saved]);
  });

  it('should save nothing when the browser can’t make an id', async () => {
    const { service, store } = setUp({}, null);

    await expect(firstValueFrom(service.save('Spring show', SAVED_THEME_VALUES))).rejects.toThrow(
      NoThemeIdError,
    );
    expect(store.commits).toEqual([]);
  });

  it('should leave the list as it was when a save fails', async () => {
    const { service, store } = setUp();
    vi.spyOn(store, 'commit').mockReturnValue(throwError(() => new Error('denied')));

    await expect(firstValueFrom(service.save('Spring show', SAVED_THEME_VALUES))).rejects.toThrow(
      'denied',
    );
    expect(service.themes()).toEqual([]);
  });

  it('should store and list the new name when renamed, keeping the rest', async () => {
    const { service, store } = setUp({ [SAVED_THEME_PATH]: SAVED_THEME_DOCUMENT });
    await firstValueFrom(service.load());

    await firstValueFrom(service.rename(spring(), 'Summer show'));

    expect(store.documents.get(SAVED_THEME_PATH)).toEqual({
      ...SAVED_THEME_DOCUMENT,
      name: 'Summer show',
    });
    expect(service.themes().map((theme) => theme.name)).toEqual(['Summer show']);
  });

  it('should delete it and take it off the list when removed', async () => {
    const { service, store } = setUp({ [SAVED_THEME_PATH]: SAVED_THEME_DOCUMENT });
    await firstValueFrom(service.load());

    await firstValueFrom(service.remove(spring()));

    expect(store.documents.has(SAVED_THEME_PATH)).toBe(false);
    expect(service.themes()).toEqual([]);
  });
});
