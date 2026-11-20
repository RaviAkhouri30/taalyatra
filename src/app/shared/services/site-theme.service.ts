import { Service, inject } from '@angular/core';
import { type Observable, catchError, defaultIfEmpty, map, of, switchMap } from 'rxjs';
import { type IRootStyle } from '@core/interfaces/i-root-style';
import { APP_PREVIEW } from '@core/tokens/app-preview.token';
import { ApiBaseService } from '@shared/base/api-base.service';
import { DEFAULT_ROOT_STYLE } from '@shared/constants/theme-default.constants';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { type ISiteThemeDto } from '@shared/interfaces/i-site-theme';
import { SITE_THEME_LOADER } from '@shared/tokens/site-theme-loader.token';
import { cacheLatest } from '@shared/utils/cache-latest.util';

/** @returns Whether the stored document chooses nothing: today's look. */
function choosesNothing(dto: unknown): boolean {
  return typeof dto !== 'object' || dto === null || Object.keys(dto).length === 0;
}

/**
 * Supplies the page's style for the published theme (`site/theme`, ADR-0019), read with the rest of
 * the preloaded `site` collection; on a preview visit, the draft's. The shell applies it to every
 * page, the admin's too.
 */
@Service()
export class SiteThemeService extends ApiBaseService<ISiteThemeDto> {
  private readonly load = inject(SITE_THEME_LOADER);
  // The owner's preview shows a draft theme even when it fails the check, so they can see why.
  private readonly preview = inject(APP_PREVIEW);

  private readonly style$: Observable<IRootStyle> = this.attachViewDataHandler().pipe(
    // A missing or unreadable document is today's look (ADR-0015's safe default), and the stream
    // always emits, so the shell that waits on it never hangs.
    defaultIfEmpty<ISiteThemeDto, ISiteThemeDto>({}),
    // switchMap: one document, one answer. Today's look needs no theme code, so most visits never
    // load the chunk; a chunk that fails to load leaves today's look rather than a blank page.
    switchMap((dto) =>
      choosesNothing(dto)
        ? of(DEFAULT_ROOT_STYLE)
        : this.load().pipe(
            map((styleFor) => styleFor(dto, this.preview)),
            catchError(() => of(DEFAULT_ROOT_STYLE)),
          ),
    ),
    cacheLatest(),
  );

  public override attachViewDataHandler(): Observable<ISiteThemeDto> {
    return this.attachViewApiHandler(ApiEndpoint.SiteTheme);
  }

  /** @returns The page's style for the theme; read once, then replayed to every subscriber. */
  public getStyle(): Observable<IRootStyle> {
    return this.style$;
  }
}
