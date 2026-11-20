import { TestBed } from '@angular/core/testing';
import { type AbstractControl, type FormRecord } from '@angular/forms';
import { THEME_PRESETS } from '@shared/constants/theme.constants';
import { ThemePreset } from '@shared/enums/theme-preset.enum';
import { buildFormGroup } from '../forms/schema-control.factory';
import { THEME_SECTION } from '../schemas/theme.sections';
import { ThemePanelViewModel } from './theme-panel.view-model';

const DAYLIGHT = THEME_PRESETS.find((preset) => preset.preset === ThemePreset.Daylight)!;

describe('ThemePanelViewModel', () => {
  function setUp(stored: object = {}) {
    TestBed.configureTestingModule({ providers: [ThemePanelViewModel] });
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

  it('should do nothing when asked to fill before it has a form', () => {
    TestBed.configureTestingModule({ providers: [ThemePanelViewModel] });
    const model = TestBed.inject(ThemePanelViewModel);

    expect(() => {
      model.reset();
    }).not.toThrow();
  });
});
