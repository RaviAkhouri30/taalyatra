import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SITE } from '@shared/testing/fixtures';
import { AuthCardComponent } from './auth-card.component';

describe('AuthCardComponent', () => {
  function render(inputs: Record<string, string>) {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(AuthCardComponent);
    fixture.componentRef.setInput('brand', SITE.brand);
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('should show the logo, heading, lead and the link back to the website', () => {
    const element = render({ heading: 'Admin sign in', lead: 'Manage content', back: '← Back' });

    expect(element.querySelector('img')?.getAttribute('alt')).toBe(SITE.brand.logoAlt);
    expect(element.querySelector('h1')?.textContent).toBe('Admin sign in');
    expect(element.querySelector('.lsub')?.textContent).toBe('Manage content');
    expect(element.querySelector('.lback')?.getAttribute('href')).toBe('/');
  });

  it('should leave out the lead and the back link when not given', () => {
    const element = render({ heading: 'Welcome' });

    expect(element.querySelector('.lsub')).toBeNull();
    expect(element.querySelector('.lback')).toBeNull();
  });
});
