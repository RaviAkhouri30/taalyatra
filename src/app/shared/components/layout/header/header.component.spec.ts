import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { PAGE_CHROME, SITE } from '@shared/testing/fixtures';
import { HeaderComponent } from './header.component';
import { HeaderViewModel } from './header.view-model';

@Component({ template: '' })
class BlankComponent {}

describe('HeaderComponent', () => {
  async function render() {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: '**', component: BlankComponent }])],
    });
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.componentRef.setInput('brand', SITE.brand);
    fixture.componentRef.setInput('chrome', PAGE_CHROME);
    fixture.detectChanges();
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const model = fixture.debugElement.injector.get(HeaderViewModel);
    return { fixture, element, model };
  }

  it('should render the brand link, call to action and a closed menu', async () => {
    const { element } = await render();

    expect(element.querySelector('a.brand')?.getAttribute('href')).toBe('/');
    expect(element.querySelector('.hdr-cta')?.textContent.trim()).toBe('Plan your session');
    expect(element.querySelector('.hdr-cta')?.classList).toContain('btn--compact');
    expect(element.querySelector('.mnav')?.classList).not.toContain('open');
  });

  it('should open the menu from the toggle and close it when a link is chosen', async () => {
    const { fixture, element } = await render();

    element.querySelector<HTMLButtonElement>('.hamb')!.click();
    fixture.detectChanges();
    expect(element.querySelector('.mnav')?.classList).toContain('open');

    element.querySelector<HTMLAnchorElement>('.mnav a')!.click();
    fixture.detectChanges();
    expect(element.querySelector('.mnav')?.classList).not.toContain('open');
  });

  it('should close the menu after any navigation', async () => {
    const { fixture, model } = await render();

    model.toggleMenu();
    expect(model.menuOpen()).toBe(true);
    await TestBed.inject(Router).navigateByUrl('/shows');
    fixture.detectChanges();

    expect(model.menuOpen()).toBe(false);
  });
});
