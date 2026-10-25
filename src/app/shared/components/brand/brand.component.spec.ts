import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HOME_CHROME, SITE } from '@shared/testing/fixtures';
import { BrandComponent } from './brand.component';

describe('BrandComponent', () => {
  function render(withLink: boolean): HTMLElement {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(BrandComponent);
    fixture.componentRef.setInput('brand', SITE.brand);
    if (withLink) fixture.componentRef.setInput('link', HOME_CHROME.brandLink);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('should render a home link with a meaningful logo when linked', () => {
    const element = render(true);
    const link = element.querySelector('a.brand')!;

    expect(link.getAttribute('aria-label')).toBe('Taal Yatra Drum Circle, home');
    expect(link.getAttribute('href')).toBe('/#top');
    expect(element.querySelector('img')?.getAttribute('alt')).toBe(SITE.brand.logoAlt);
  });

  it('should render plain content with a decorative logo when not linked', () => {
    const element = render(false);

    expect(element.querySelector('a')).toBeNull();
    expect(element.querySelector('div.brand b')?.textContent).toBe('Taal Yatra');
    expect(element.querySelector('img')?.getAttribute('alt')).toBe('');
  });
});
