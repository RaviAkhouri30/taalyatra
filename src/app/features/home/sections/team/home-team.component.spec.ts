import { HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { IHttpBackend } from '@core/interfaces/i-http-backend';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { SiteVisibility } from '@shared/models/site-visibility.model';
import { provideVisibility, queryAll, texts } from '@shared/testing/fixtures';
import { HOME, TEAM } from '../../testing/home-fixtures';
import { HomeTeamComponent } from './home-team.component';

describe('HomeTeamComponent', () => {
  function render(heading: unknown, visibility?: SiteVisibility): HTMLElement {
    const bodies = new Map<string, unknown>([
      [ApiEndpoint.HomeTeam, heading],
      [ApiEndpoint.Team, TEAM],
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
    const fixture = TestBed.createComponent(HomeTeamComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('should show the first four members and link to the Team page', () => {
    const element = render(HOME.team);

    expect(element.querySelector('section')?.id).toBe('team');
    expect(queryAll(element, 'figure')).toHaveLength(4);
    expect(texts(element, 'figcaption span')).toEqual([
      'Founder & lead facilitator',
      'Facilitator',
      'Percussion mentor',
      'Event producer',
    ]);
    expect(element.querySelector('.btn')?.getAttribute('href')).toBe('/team');
  });

  it('should render nothing until the heading has loaded', () => {
    expect(render(null).querySelector('section')).toBeNull();
  });

  it('should leave out the Team page link when that page is switched off', () => {
    const element = render(HOME.team, new SiteVisibility({ pages: { team: false } }));

    expect(element.querySelector('a[href="/team"]')).toBeNull();
    expect(element.querySelector('section')).not.toBeNull();
  });
});
