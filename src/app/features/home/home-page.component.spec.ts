import { DeferBlockState, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { EMPTY } from 'rxjs';
import { IEmailService } from '@core/interfaces/i-email-service';
import { IHttpBackend } from '@core/interfaces/i-http-backend';
import HomePageComponent from './home-page.component';

describe('HomePageComponent', () => {
  it('should compose the home sections in design order, deferring those below the fold', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: IHttpBackend, useValue: { get: () => EMPTY } },
        { provide: IEmailService, useValue: { send: () => EMPTY } },
      ],
    });
    const fixture = TestBed.createComponent(HomePageComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const tags = () => Array.from(element.children).map((child) => child.tagName.toLowerCase());

    expect(tags()).toEqual([
      'app-home-intro',
      'app-home-hero',
      'app-home-marquee',
      'app-home-trust',
    ]);
    const [belowTheFold] = await fixture.getDeferBlocks();
    await belowTheFold!.render(DeferBlockState.Complete);

    expect(tags()).toEqual([
      'app-home-intro',
      'app-home-hero',
      'app-home-marquee',
      'app-home-trust',
      'app-home-offer',
      'app-home-audiences',
      'app-home-experiences',
      'app-home-shows',
      'app-home-drum-circle',
      'app-home-rhythm-game',
      'app-home-videos',
      'app-home-gallery',
      'app-home-philosophy',
      'app-home-mid-cta',
      'app-home-cities',
      'app-home-how',
      'app-home-team',
      'app-home-instagram',
      'app-home-proof',
      'app-home-faq',
      'app-home-contact',
      'app-home-assistant',
    ]);
  });
});
