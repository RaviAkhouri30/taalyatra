import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PAGE_CHROME, texts } from '@shared/testing/fixtures';
import { MobileNavComponent } from './mobile-nav.component';

describe('MobileNavComponent', () => {
  function render(open: boolean) {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(MobileNavComponent);
    fixture.componentRef.setInput('links', PAGE_CHROME.mobileNav);
    fixture.componentRef.setInput('navId', 'menu');
    fixture.componentRef.setInput('open', open);
    fixture.detectChanges();
    return { fixture, element: fixture.nativeElement as HTMLElement };
  }

  it('should render the links and reflect the open state', () => {
    const { element } = render(true);
    const nav = element.querySelector('nav')!;

    expect(nav.id).toBe('menu');
    expect(nav.classList).toContain('open');
    expect(texts(element, 'a').at(0)).toBe('← Back to home');
    expect(texts(element, 'a').at(-1)).toBe('Request proposal');
  });

  it('should emit navigate when a link is chosen', () => {
    const { fixture, element } = render(false);
    const navigate = vi.fn();
    fixture.componentInstance.navigate.subscribe(navigate);

    element.querySelector('a')!.click();

    expect(navigate).toHaveBeenCalledTimes(1);
    expect(element.querySelector('nav')?.classList).not.toContain('open');
  });
});
