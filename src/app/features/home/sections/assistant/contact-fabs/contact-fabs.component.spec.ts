import { TestBed } from '@angular/core/testing';
import { ContactFabsComponent } from './contact-fabs.component';

describe('ContactFabsComponent', () => {
  function render(hidden = false) {
    const fixture = TestBed.createComponent(ContactFabsComponent);
    fixture.componentRef.setInput('callHref', 'tel:+919284276168');
    fixture.componentRef.setInput('whatsAppHref', 'https://wa.me/919284276168');
    fixture.componentRef.setInput('callLabel', 'Call us');
    fixture.componentRef.setInput('whatsAppLabel', 'WhatsApp us');
    fixture.componentRef.setInput('hidden', hidden);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    return { call: element.querySelector('a.call')!, whatsApp: element.querySelector('a.wa')! };
  }

  it('should link to a call and to WhatsApp, each with its name', () => {
    const { call, whatsApp } = render();

    expect(call.getAttribute('href')).toBe('tel:+919284276168');
    expect(call.getAttribute('aria-label')).toBe('Call us');
    expect(whatsApp.getAttribute('href')).toBe('https://wa.me/919284276168');
    expect(whatsApp.getAttribute('aria-label')).toBe('WhatsApp us');
    expect(call.hasAttribute('tabindex')).toBe(false);
  });

  it('should step out of sight, the tab order and the accessibility tree while hidden', () => {
    const { call, whatsApp } = render(true);

    for (const link of [call, whatsApp]) {
      expect(link.classList).toContain('cf--hidden');
      expect(link.getAttribute('tabindex')).toBe('-1');
      expect(link.getAttribute('aria-hidden')).toBe('true');
    }
  });
});
