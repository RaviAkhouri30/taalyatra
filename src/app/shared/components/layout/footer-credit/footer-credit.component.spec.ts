import { TestBed } from '@angular/core/testing';
import { SITE } from '@shared/testing/fixtures';
import { FooterCreditComponent } from './footer-credit.component';

describe('FooterCreditComponent', () => {
  it('should credit the developer with a link to their profile in a new tab', () => {
    const fixture = TestBed.createComponent(FooterCreditComponent);
    fixture.componentRef.setInput('credit', SITE.credit);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const link = element.querySelector('a');

    expect(element.textContent.replace(/\s+/g, ' ').trim()).toBe(
      'Developed with love by Ravi Akhouri',
    );
    expect(link?.getAttribute('href')).toBe('https://www.linkedin.com/in/ravi-akhouri-6696071a7/');
    expect(link?.getAttribute('target')).toBe('_blank');
    expect(link?.getAttribute('rel')).toBe('noopener noreferrer');
    expect(link?.getAttribute('aria-label')).toBe('Ravi Akhouri on LinkedIn (opens in a new tab)');
  });
});
