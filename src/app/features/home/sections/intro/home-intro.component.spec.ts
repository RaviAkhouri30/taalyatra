import { TestBed } from '@angular/core/testing';
import { SITE, provideSiteConfig } from '@shared/testing/fixtures';
import { HomeIntroComponent } from './home-intro.component';

describe('HomeIntroComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideSiteConfig()] });
  });

  function render(): { element: HTMLElement; detect: () => void } {
    const fixture = TestBed.createComponent(HomeIntroComponent);
    fixture.detectChanges();
    return {
      element: fixture.nativeElement as HTMLElement,
      detect: () => {
        fixture.detectChanges();
      },
    };
  }

  it('should show the decorative loader with the logo, bars and caption', () => {
    const { element } = render();
    const loader = element.querySelector('.loader');

    expect(loader?.getAttribute('aria-hidden')).toBe('true');
    expect(element.querySelector('img')?.getAttribute('src')).toBe(SITE.brand.logoUrl);
    expect(element.querySelectorAll('.bars b')).toHaveLength(5);
    expect(element.querySelector('.ltxt')?.textContent).toBe('Finding the rhythm');
  });

  it('should remove itself when its own fade-out ends, not a child animation', () => {
    const { element, detect } = render();

    element.querySelector('img')!.dispatchEvent(new Event('animationend', { bubbles: true }));
    detect();
    expect(element.querySelector('.loader')).not.toBeNull();

    element.querySelector('.loader')!.dispatchEvent(new Event('animationend'));
    detect();
    expect(element.querySelector('.loader')).toBeNull();
  });

  it('should not replay when the home page is shown again in the same visit', () => {
    render();

    expect(render().element.querySelector('.loader')).toBeNull();
  });
});
