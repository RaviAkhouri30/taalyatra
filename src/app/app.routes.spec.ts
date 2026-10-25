import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { ROUTE_DATA_KEYS } from '@shared/constants/route-data.constants';
import { PageLayout } from '@shared/enums/page-layout.enum';
import HomePageComponent from '@features/home/home-page.component';
import { routes } from './app.routes';

describe('app routes', () => {
  it('should lazy-load the home page with the home layout', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/');
    const leaf = router.routerState.snapshot.root.firstChild!;

    expect(leaf.component).toBe(HomePageComponent);
    expect(leaf.data[ROUTE_DATA_KEYS.Layout]).toBe(PageLayout.Home);
  });

  it('should send unknown URLs to the home page', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/not-a-page');

    expect(router.url).toBe('/');
  });
});
