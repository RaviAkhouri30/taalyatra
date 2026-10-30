import { HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { IHttpBackend } from '@core/interfaces/i-http-backend';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { SiteVisibility } from '@shared/models/site-visibility.model';
import { SITE_DTO, provideVisibility, queryAll } from '@shared/testing/fixtures';
import { HOME, VIDEOS } from '../../testing/home-fixtures';
import { HomeVideosComponent } from './home-videos.component';

describe('HomeVideosComponent', () => {
  function render(heading: unknown, visibility?: SiteVisibility): HTMLElement {
    const bodies = new Map<string, unknown>([
      [ApiEndpoint.HomeVideos, heading],
      [ApiEndpoint.Videos, VIDEOS],
      [ApiEndpoint.SiteConfig, SITE_DTO],
    ]);
    const get = (path: string) =>
      of(new HttpResponse({ status: 200, body: bodies.get(path) ?? null }));
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: IHttpBackend, useValue: { get } },
        provideVisibility(visibility),
      ],
    });
    const fixture = TestBed.createComponent(HomeVideosComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('should show the newest videos with accessible names and a link to the library', () => {
    const element = render(HOME.videos);
    const cards = queryAll(element, '.vcard');

    expect(element.querySelector('section')?.id).toBe('watch');
    expect(element.querySelector('h2')?.textContent).toBe('See a circle in action.');
    expect(cards).toHaveLength(4);
    expect(cards[0]?.getAttribute('aria-label')).toBe('Watch [Video title 1] on YouTube');
    expect(element.querySelector('.head a')?.getAttribute('href')).toBe('/videos');
  });

  it('should render nothing until the heading has loaded', () => {
    expect(render(null).querySelector('section')).toBeNull();
  });

  it('should leave out the library link when the Videos page is switched off', () => {
    const element = render(HOME.videos, new SiteVisibility({ pages: { videos: false } }));

    expect(element.querySelector('.head a')).toBeNull();
    expect(queryAll(element, '.vcard')).toHaveLength(4);
  });
});
