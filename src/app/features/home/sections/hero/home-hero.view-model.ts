import { Injectable, inject } from '@angular/core';
import { type Observable, combineLatest, tap } from 'rxjs';
import { ViewModel } from '@shared/base/view-model';
import { SiteConfigService } from '@shared/services/site-config.service';
import { HeroModel } from './hero.model';
import { HomeHeroService } from './home-hero.service';

/** Loads the hero copy and joins it with the contact details for the call/WhatsApp buttons. */
@Injectable()
export class HomeHeroViewModel extends ViewModel<HeroModel> {
  private readonly heroService = inject(HomeHeroService);
  private readonly siteConfigService = inject(SiteConfigService);

  protected override attachViewHandler(): Observable<unknown> {
    return combineLatest([
      this.heroService.attachViewDataHandler(),
      this.siteConfigService.getSiteConfig(),
    ]).pipe(
      tap(([hero, site]) => {
        this.setData(new HeroModel(hero, site.contact));
      }),
    );
  }
}
