import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, provideRouter } from '@angular/router';
import { type Observable, firstValueFrom } from 'rxjs';
import { SitePage } from '@shared/enums/site-page.enum';
import { SiteVisibility } from '@shared/models/site-visibility.model';
import { provideVisibility } from '@shared/testing/fixtures';
import { pageEnabledGuard } from './page-enabled.guard';

/** The guard ignores the partial snapshot, so specs pass an empty one. */
type PartialMatch = Parameters<ReturnType<typeof pageEnabledGuard>>[2];

describe('pageEnabledGuard', () => {
  function run(visibility: SiteVisibility) {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideVisibility(visibility)],
    });
    const result: Observable<boolean | UrlTree> = TestBed.runInInjectionContext(
      () =>
        pageEnabledGuard(SitePage.Team)({}, [], {} as PartialMatch) as Observable<
          boolean | UrlTree
        >,
    );
    return firstValueFrom(result);
  }

  it('should let the visitor in when the page is on', async () => {
    await expect(run(SiteVisibility.allVisible)).resolves.toBe(true);
  });

  it('should send the visitor home when the page is switched off', async () => {
    const result = await run(new SiteVisibility({ pages: { team: false } }));

    expect(result).toBeInstanceOf(UrlTree);
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/');
  });
});
