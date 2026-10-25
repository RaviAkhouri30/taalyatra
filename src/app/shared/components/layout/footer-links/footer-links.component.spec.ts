import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppRoute } from '@shared/enums/app-route.enum';
import { queryAll } from '@shared/testing/fixtures';
import { externalLink, navLink } from '@shared/utils/link.util';
import { FooterLinksComponent } from './footer-links.component';

describe('FooterLinksComponent', () => {
  it('should render internal and external links under the heading', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(FooterLinksComponent);
    fixture.componentRef.setInput('column', {
      heading: 'Mixed',
      links: [
        navLink('Shows', AppRoute.Shows),
        externalLink('Maps', 'https://maps.example', { ariaLabel: 'Open maps' }),
      ],
    });
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const links = queryAll(element, 'a');

    expect(element.querySelector('.heading')?.textContent).toBe('Mixed');
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/shows',
      'https://maps.example',
    ]);
    expect(links[1]?.getAttribute('aria-label')).toBe('Open maps');
  });
});
