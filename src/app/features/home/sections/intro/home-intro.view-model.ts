import { Injectable, inject, signal } from '@angular/core';
import { type Observable, filter, take, tap } from 'rxjs';
import { ViewModel } from '@shared/base/view-model';
import { SiteConfigService } from '@shared/services/site-config.service';
import { type IIntro } from './i-intro';
import { INTRO_LABEL } from './intro.constants';
import { IntroPlaybackService } from './intro-playback.service';

/** Shows the intro once per visit and removes it when its fade-out ends. */
@Injectable()
export class HomeIntroViewModel extends ViewModel<IIntro> {
  public readonly finished = signal(false);

  private readonly siteConfigService = inject(SiteConfigService);
  private readonly playback = inject(IntroPlaybackService);

  /** Removes the loader once it has faded out. */
  public finish(): void {
    this.finished.set(true);
  }

  protected override attachViewHandler(): Observable<unknown> {
    return this.siteConfigService.getSiteConfig().pipe(
      take(1),
      filter(() => this.playback.claim()),
      tap((site) => {
        this.setData({ logoUrl: site.brand.logoUrl, label: INTRO_LABEL });
      }),
    );
  }
}
