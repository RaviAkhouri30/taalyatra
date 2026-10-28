import { TestBed } from '@angular/core/testing';
import { FakeClipboardService } from '@core/backends/fake/fake-clipboard.service';
import { IClipboardService } from '@core/interfaces/i-clipboard-service';
import { SITE, texts } from '@shared/testing/fixtures';
import { FooterVisitComponent } from './footer-visit.component';

describe('FooterVisitComponent', () => {
  it('should render the map link, business details and directions', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: IClipboardService, useClass: FakeClipboardService }],
    });
    const fixture = TestBed.createComponent(FooterVisitComponent);
    fixture.componentRef.setInput('contact', SITE.contact);
    fixture.componentRef.setInput('labels', SITE.labels);
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
    expect(element.querySelector('a.inline')?.textContent).toBe('Call us');
    expect(element.querySelector('a.inline')?.getAttribute('aria-label')).toBe(
      'Call us, +91 92842 76168',
    );
    expect(element.querySelector('app-copy-text button')?.getAttribute('aria-label')).toBe(
      `Copy address: ${SITE.contact.address}`,
    );
    expect(element.querySelector('.directions')?.getAttribute('href')).toBe(
      SITE.contact.directionsUrl,
    );
  });

  it('should show the number and a plain address when the labels are missing', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: IClipboardService, useClass: FakeClipboardService }],
    });
    const fixture = TestBed.createComponent(FooterVisitComponent);
    fixture.componentRef.setInput('contact', SITE.contact);
    fixture.componentRef.setInput('labels', { ...SITE.labels, callUs: '', copyAddress: '' });
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const phone = element.querySelector('a.inline');

    expect(phone?.textContent).toBe('+91 92842 76168');
    expect(phone?.hasAttribute('aria-label')).toBe(false);
    expect(element.querySelector('app-copy-text')).toBeNull();
    expect(element.textContent).toContain(SITE.contact.address);
  });
});
