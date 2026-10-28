import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppRoute } from '@shared/enums/app-route.enum';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { PageCtaSize } from '@shared/enums/variant.enums';
import { externalLink, navLink } from '@shared/utils/link.util';
import { PageCtaComponent } from './page-cta.component';

describe('PageCtaComponent', () => {
  function render(inputs: Record<string, unknown>) {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(PageCtaComponent);
    fixture.componentRef.setInput(
      'primary',
      navLink('Plan', AppRoute.Home, { fragment: PageAnchor.Contact }),
    );
    fixture.componentRef.setInput('secondary', externalLink('YouTube', 'https://youtube.com/'));
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('should render a centred heading, line and a solid then a ghost button', () => {
    const element = render({ heading: 'Want to play?', text: 'Tell us.' });
    const links = element.querySelectorAll('a');

    expect(element.classList).toContain('centered');
    expect(element.querySelector('h2')?.textContent).toBe('Want to play?');
    expect(element.querySelector('.lead')?.textContent).toBe('Tell us.');
    expect(links[0]?.getAttribute('href')).toBe('/#contact');
    expect(links[1]?.getAttribute('href')).toBe('https://youtube.com/');
    expect(links[1]?.classList).toContain('btn--ghost');
  });

  it('should render only the buttons, not centred, without a heading', () => {
    const element = render({});

    expect(element.classList).not.toContain('centered');
    expect(element.querySelector('h2')).toBeNull();
    expect(element.querySelector('.lead')).toBeNull();
  });

  it('should render a single button when there is no secondary link', () => {
    expect(render({ secondary: null }).querySelectorAll('a')).toHaveLength(1);
  });

  it('should use the medium heading size when asked', () => {
    expect(render({ heading: 'Hi', size: PageCtaSize.Medium }).classList).toContain('medium');
  });
});
