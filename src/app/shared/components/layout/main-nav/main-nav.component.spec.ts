import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HOME_CHROME, PAGE_CHROME, queryAll, texts } from '@shared/testing/fixtures';
import { MainNavComponent } from './main-nav.component';

describe('MainNavComponent', () => {
  function render(links = PAGE_CHROME.mainNav): HTMLElement {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(MainNavComponent);
    fixture.componentRef.setInput('links', links);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('should render the inner-page links with an iconed home link', () => {
    const element = render();

    expect(texts(element, 'a')).toEqual([
      'Home',
      'Experiences',
      'Shows',
      'Videos',
      'Team',
      'Achievements',
      'Contact',
    ]);
    expect(element.querySelector('a.navhome svg')).not.toBeNull();
    expect(queryAll(element, 'a')[1]?.getAttribute('href')).toBe('/#experiences');
  });

  it('should highlight the seasonal link on the home page', () => {
    const element = render(HOME_CHROME.mainNav);

    expect(element.querySelector('a.navhot')?.textContent.trim()).toBe('Diwali');
    expect(element.querySelector('a.navhome')).toBeNull();
  });
});
