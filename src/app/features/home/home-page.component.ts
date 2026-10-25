import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HomeHeroComponent } from './sections/hero/home-hero.component';
import { HomeMarqueeComponent } from './sections/marquee/home-marquee.component';
import { HomeTrustComponent } from './sections/trust/home-trust.component';

/**
 * Home page (design: Main.dc.html). A composition container only: each section owns its
 * service → view model → component and loads its own data, so sections below the fold can be
 * deferred until they scroll into view.
 */
@Component({
  selector: 'app-home-page',
  imports: [HomeHeroComponent, HomeMarqueeComponent, HomeTrustComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HomePageComponent {}
