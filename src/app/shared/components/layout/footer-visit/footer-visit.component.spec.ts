import { TestBed } from '@angular/core/testing';
import { SITE, texts } from '@shared/testing/fixtures';
import { FooterVisitComponent } from './footer-visit.component';

describe('FooterVisitComponent', () => {
  it('should render the map link, business details and directions', () => {
    const fixture = TestBed.createComponent(FooterVisitComponent);
    fixture.componentRef.setInput('contact', SITE.contact);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.fmap')?.getAttribute('aria-label')).toBe(
      'Open Taalyatra drum circle in Google Maps',
    );
    expect(texts(element, 'dt')).toEqual([
      'Name',
      'Address',
      'Phone',
      'Email',
      'Hours',
      'Plus code',
    ]);
    expect(element.querySelector('dd span')?.getAttribute('lang')).toBe('mr');
    expect(element.querySelector('a.inline')?.getAttribute('href')).toBe('tel:+919284276168');
    expect(element.querySelector('.directions')?.getAttribute('href')).toBe(
      SITE.contact.directionsUrl,
    );
  });
});
