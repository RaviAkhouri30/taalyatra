import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { type AbstractControl, type FormRecord } from '@angular/forms';
import { throwError } from 'rxjs';
import { type DocumentFields, IDocumentStore } from '@core/interfaces/i-document-store';
import { CLOCK } from '@core/tokens/clock.token';
import { buildFormGroup } from '../forms/schema-control.factory';
import { SAVED_THEMES_MAX } from '../models/saved-theme.constants';
import { THEME_SECTION } from '../schemas/theme.sections';
import { SavedThemesService } from '../services/saved-themes.service';
import { MemoryDocumentStore } from '../testing/memory-document-store';
import {
  SAVED_THEME_DOCUMENT,
  SAVED_THEME_PATH,
  SAVED_THEME_VALUES,
} from '../testing/saved-theme.fixture';
import { SAVED_THEME_TEXT, SavedThemesViewModel, hardToReadText } from './saved-themes.view-model';

const NEW_ID = '1f8fad5b-d9cb-469f-a165-70867728950e';

describe('SavedThemesViewModel', () => {
  function setUp(seed: Record<string, DocumentFields> = {}, failing = 0) {
    const store = new MemoryDocumentStore(seed);
    TestBed.configureTestingModule({
      providers: [
        SavedThemesViewModel,
        SavedThemesService,
        { provide: IDocumentStore, useValue: store },
        { provide: CLOCK, useValue: { now: () => new Date('2026-11-22T09:30:00.000Z') } },
        { provide: DOCUMENT, useValue: { defaultView: { crypto: { randomUUID: () => NEW_ID } } } },
      ],
    });
    const model = TestBed.inject(SavedThemesViewModel);
    const service = TestBed.inject(SavedThemesService);
    const form: FormRecord<AbstractControl> = buildFormGroup(
      THEME_SECTION.fields,
      SAVED_THEME_VALUES,
    );
    const subscription = model.init().subscribe();
    service.load().subscribe();
    model.watch(form, failing);
    return { model, store, subscription };
  }

  const spring = (model: SavedThemesViewModel) => model.themes()[0]!;

  it('should save the form under the name and say so when the name is new', () => {
    const { model, store, subscription } = setUp();
    model.name.setValue('Spring show');

    model.save();

    expect(store.documents.get(`savedThemes/${NEW_ID}`)).toMatchObject({ name: 'Spring show' });
    expect(model.done()).toBe('Saved as Spring show.');
    expect(model.name.value).toBe('');
    expect(model.busy()).toBe(false);
    subscription.unsubscribe();
  });

  it.each([
    ['empty', '  ', SAVED_THEME_TEXT.noName],
    ['too long', 'x'.repeat(41), SAVED_THEME_TEXT.longName],
    ['in use', 'spring show', SAVED_THEME_TEXT.takenName],
  ])('should say what’s wrong and save nothing when the name is %s', (_case, name, error) => {
    const { model, store, subscription } = setUp({ [SAVED_THEME_PATH]: SAVED_THEME_DOCUMENT });
    model.name.setValue(name);

    model.save();

    expect(model.nameError()).toBe(error);
    expect(store.commits).toEqual([]);
    subscription.unsubscribe();
  });

  it('should save nothing and name the fix when pairs are hard to read', () => {
    const { model, store, subscription } = setUp({}, 2);
    model.name.setValue('Spring show');

    model.save();

    expect(model.problem()).toBe('Fix the 2 hard-to-read pairs first.');
    expect(store.commits).toEqual([]);
    subscription.unsubscribe();
  });

  it('should say one pair when one is hard to read', () => {
    expect(hardToReadText(1)).toBe('Fix the 1 hard-to-read pair first.');
  });

  it('should save nothing when the limit is reached', () => {
    const seed = Object.fromEntries(
      Array.from({ length: SAVED_THEMES_MAX }, (_, index) => [
        `savedThemes/${String(index).padStart(2, '0')}8fad5b-d9cb-469f-a165-70867728950e`,
        { ...SAVED_THEME_DOCUMENT, name: `Theme ${String(index)}` },
      ]),
    );
    const { model, store, subscription } = setUp(seed);
    model.name.setValue('One more');

    model.save();

    expect(model.problem()).toBe(SAVED_THEME_TEXT.full);
    expect(store.commits).toEqual([]);
    subscription.unsubscribe();
  });

  it('should say a change failed and stay ready when the write is refused', () => {
    const { model, store, subscription } = setUp();
    vi.spyOn(store, 'commit').mockReturnValue(throwError(() => new Error('denied')));
    model.name.setValue('Spring show');

    model.save();

    expect(model.problem()).toBe(SAVED_THEME_TEXT.failed);
    expect(model.busy()).toBe(false);
    subscription.unsubscribe();
  });

  it('should rename a theme, its own name not counting as taken', () => {
    const { model, store, subscription } = setUp({ [SAVED_THEME_PATH]: SAVED_THEME_DOCUMENT });
    model.startRename(spring(model));
    expect(model.newName.value).toBe('Spring show');
    model.newName.setValue('Spring Show');

    model.rename(spring(model));

    expect(store.documents.get(SAVED_THEME_PATH)).toMatchObject({ name: 'Spring Show' });
    expect(model.renaming()).toBeNull();
    expect(model.done()).toBe('Renamed to Spring Show.');
    subscription.unsubscribe();
  });

  it('should keep the name when the new one is empty or the rename is cancelled', () => {
    const { model, store, subscription } = setUp({ [SAVED_THEME_PATH]: SAVED_THEME_DOCUMENT });
    model.startRename(spring(model));
    model.newName.setValue('');

    model.rename(spring(model));
    expect(model.newNameError()).toBe(SAVED_THEME_TEXT.noName);
    model.cancelRename();

    expect(model.renaming()).toBeNull();
    expect(store.commits).toEqual([]);
    subscription.unsubscribe();
  });

  it('should ask first, then delete the theme, when Delete is confirmed', () => {
    const { model, store, subscription } = setUp({ [SAVED_THEME_PATH]: SAVED_THEME_DOCUMENT });
    const theme = spring(model);

    model.askRemove(theme);
    expect(model.confirmingTheme()).toBe(theme);
    model.remove(theme);

    expect(store.documents.has(SAVED_THEME_PATH)).toBe(false);
    expect(model.confirming()).toBeNull();
    expect(model.done()).toBe('Deleted Spring show. The site keeps its theme.');
    subscription.unsubscribe();
  });

  it('should keep the theme when the delete is cancelled', () => {
    const { model, subscription } = setUp({ [SAVED_THEME_PATH]: SAVED_THEME_DOCUMENT });
    model.askRemove(spring(model));

    model.cancelRemove();

    expect(model.confirming()).toBeNull();
    expect(model.themes()).toHaveLength(1);
    subscription.unsubscribe();
  });

  it('should save an empty theme when it has no form yet', () => {
    TestBed.configureTestingModule({
      providers: [
        SavedThemesViewModel,
        SavedThemesService,
        { provide: IDocumentStore, useValue: new MemoryDocumentStore() },
      ],
    });
    const model = TestBed.inject(SavedThemesViewModel);
    const subscription = model.init().subscribe();
    model.name.setValue('Spring show');

    model.save();

    expect(model.themes()[0]?.values).toEqual({});
    subscription.unsubscribe();
  });
});
