import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { DEFAULT_ROOT_STYLE } from '@shared/constants/theme-default.constants';
import { SITE_THEME_LOADER } from './site-theme-loader.token';

describe('SITE_THEME_LOADER', () => {
  it('should load the theme’s chunk and give back its style function when subscribed', async () => {
    const load = TestBed.inject(SITE_THEME_LOADER);

    const styleFor = await firstValueFrom(load());

    expect(styleFor({})).toEqual(DEFAULT_ROOT_STYLE);
  });
});
