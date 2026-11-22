import { TestBed } from '@angular/core/testing';
import { type AbstractControl, type FormRecord } from '@angular/forms';
import { THEME_PRESETS } from '@shared/constants/theme-presets.constants';
import { ThemePreset } from '@shared/enums/theme-preset.enum';
import { IDocumentStore } from '@core/interfaces/i-document-store';
import { buildFormGroup } from '../forms/schema-control.factory';
import { THEME_SECTION } from '../schemas/theme.sections';
import { SavedThemesService } from '../services/saved-themes.service';
import { MemoryDocumentStore } from '../testing/memory-document-store';
import { SAVED_THEME_DOCUMENT, SAVED_THEME_PATH } from '../testing/saved-theme.fixture';
import { OWN_COLOURS_LABEL, ThemePanelViewModel } from './theme-panel.view-model';

const DAYLIGHT = THEME_PRESETS.find((preset) => preset.preset === ThemePreset.Daylight)!;

describe('ThemePanelViewModel', () => {
  function provide(seed: ConstructorParameters<typeof MemoryDocumentStore>[0] = {}): void {
    TestBed.configureTestingModule({
      providers: [
        ThemePanelViewModel,
        SavedThemesService,
        { provide: IDocumentStore, useValue: new MemoryDocumentStore(seed) },
      ],
    });
  }

  function setUp(stored: object = {}, seed: Parameters<typeof provide>[0] = {}) {
    provide(seed);
    const model = TestBed.inject(ThemePanelViewModel);
    const form: FormRecord<AbstractControl> = buildFormGroup(THEME_SECTION.fields, stored);
    const subscription = model.init().subscribe();
    model.watch(form);
    return { model, form, subscription };
  }

  it('should follow today’s look when the form is empty', () => {
    const { model, subscription } = setUp();

    expect(model.preset()).toBe(ThemePreset.WarmNight);
    expect(model.failing()).toEqual([]);
    expect(model.results().length).toBeGreaterThan(0);
    subscription.unsubscribe();
  });

  it('should fill the colours and background when a ready-made theme is chosen', () => {
    const { model, form, subscription } = setUp();

    model.choose(DAYLIGHT);

    expect(form.get('background')?.value).toBe('#faf6f0');
    expect(form.dirty).toBe(true);
    expect(model.preset()).toBe(ThemePreset.Daylight);
    subscription.unsubscribe();
  });

  it('should list the pairs that fail as a colour changes', () => {
    const { model, form, subscription } = setUp();

    form.get('quietText')?.setValue('#3a3a3a');

    expect(model.failing().length).toBeGreaterThan(0);
    expect(model.preset()).toBe(ThemePreset.Custom);
    subscription.unsubscribe();
  });

  it('should put today’s look back when reset', () => {
    const { model, form, subscription } = setUp({ ...DAYLIGHT.colours, fonts: 'space-work' });

    model.reset();

    expect(form.get('background')?.value).toBe('#171210');
    expect(form.get('fonts')?.value).toBe('bricolage-dm');
    expect(model.preset()).toBe(ThemePreset.WarmNight);
    subscription.unsubscribe();
  });

  it('should split the ready-made themes into dark and light when listing them', () => {
    provide();
    const model = TestBed.inject(ThemePanelViewModel);

    expect(model.darkPresets.map((preset) => preset.label)).toContain('Monsoon');
    expect(model.lightPresets.map((preset) => preset.label)).toEqual([
      'Daylight',
      'Marigold',
      'Sandstone',
      'Holi',
      'Mint',
      'Rose',
      'Slate',
    ]);
    expect(model.darkPresets.length + model.lightPresets.length).toBe(THEME_PRESETS.length);
  });

  it('should name the ready-made theme when the form is one', () => {
    const { model, subscription } = setUp(DAYLIGHT.colours);

    expect(model.themeLabel()).toBe('Daylight');
    subscription.unsubscribe();
  });

  it('should say the colours are the owner’s own when they match no theme', () => {
    const { model, subscription } = setUp({ accent: '#ff0000' });

    expect(model.themeLabel()).toBe(OWN_COLOURS_LABEL);
    expect(model.savedMatch()).toBeUndefined();
    subscription.unsubscribe();
  });

  it('should fill everything and name the saved theme when one is chosen', () => {
    const { model, form, subscription } = setUp({}, { [SAVED_THEME_PATH]: SAVED_THEME_DOCUMENT });
    const [saved] = model.saved();

    model.chooseSaved(saved!);

    expect(form.get('fonts')?.value).toBe('space-work');
    expect(form.get('accent')?.value).toBe('#ff0000');
    expect(form.dirty).toBe(true);
    expect(model.themeLabel()).toBe('Your theme: Spring show');
    subscription.unsubscribe();
  });

  it('should do nothing when asked to fill before it has a form', () => {
    provide();
    const model = TestBed.inject(ThemePanelViewModel);

    expect(() => {
      model.reset();
    }).not.toThrow();
  });
});
