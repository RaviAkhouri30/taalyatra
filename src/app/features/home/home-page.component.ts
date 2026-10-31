import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BaseComponent } from '@shared/base/base-component';
import { type SiteVisibility } from '@shared/models/site-visibility.model';
import { HomePageViewModel } from './home-page.view-model';
import { HomeAssistantComponent } from './sections/assistant/home-assistant.component';
import { HomeAudiencesComponent } from './sections/audiences/home-audiences.component';
import { HomeCitiesComponent } from './sections/cities/home-cities.component';
import { HomeDrumCircleComponent } from './sections/drum-circle/home-drum-circle.component';
import { HomeFaqComponent } from './sections/faq/home-faq.component';
import { HomeContactComponent } from './sections/contact/home-contact.component';
import { HomeGalleryComponent } from './sections/gallery/home-gallery.component';
import { HomeExperiencesComponent } from './sections/experiences/home-experiences.component';
import { HomeHeroComponent } from './sections/hero/home-hero.component';
import { HomeIntroComponent } from './sections/intro/home-intro.component';
import { HomeMidCtaComponent } from './sections/mid-cta/home-mid-cta.component';
import { HomeOfferComponent } from './sections/offer/home-offer.component';
import { HomeHowComponent } from './sections/how/home-how.component';
import { HomeInstagramComponent } from './sections/instagram/home-instagram.component';
import { HomeMarqueeComponent } from './sections/marquee/home-marquee.component';
import { HomePhilosophyComponent } from './sections/philosophy/home-philosophy.component';
import { HomeProofComponent } from './sections/proof/home-proof.component';
import { HomeRhythmGameComponent } from './sections/rhythm-game/home-rhythm-game.component';
import { HomeShowsComponent } from './sections/shows/home-shows.component';
import { HomeVideosComponent } from './sections/videos/home-videos.component';
import { HomeTeamComponent } from './sections/team/home-team.component';
import { HomeTrustComponent } from './sections/trust/home-trust.component';

/**
 * Home page (design: Main.dc.html). A composition container only: each section owns its
 * service → view model → component and loads its own data, so sections below the fold can be
 * deferred until they scroll into view. Sections the owner switched off aren't rendered at all.
 */
@Component({
  selector: 'app-home-page',
  imports: [
    HomeAssistantComponent,
    HomeAudiencesComponent,
    HomeCitiesComponent,
    HomeDrumCircleComponent,
    HomeExperiencesComponent,
    HomeFaqComponent,
    HomeContactComponent,
    HomeGalleryComponent,
    HomeHeroComponent,
    HomeIntroComponent,
    HomeHowComponent,
    HomeInstagramComponent,
    HomeMarqueeComponent,
    HomeMidCtaComponent,
    HomeOfferComponent,
    HomePhilosophyComponent,
    HomeProofComponent,
    HomeRhythmGameComponent,
    HomeShowsComponent,
    HomeTeamComponent,
    HomeTrustComponent,
    HomeVideosComponent,
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HomePageViewModel],
})
export default class HomePageComponent extends BaseComponent<SiteVisibility> {
  protected override readonly model = inject(HomePageViewModel);
}
