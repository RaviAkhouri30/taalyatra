import { TestBed } from '@angular/core/testing';
import { SITE } from '@shared/testing/fixtures';
import { WhatsAppFabComponent } from './whatsapp-fab.component';

describe('WhatsAppFabComponent', () => {
  it('should link to WhatsApp chat with an accessible name', () => {
    const fixture = TestBed.createComponent(WhatsAppFabComponent);
    fixture.componentRef.setInput('phone', SITE.contact.phone);
    fixture.detectChanges();
    const link = (fixture.nativeElement as HTMLElement).querySelector('a')!;

    expect(link.getAttribute('href')).toBe('https://wa.me/919284276168');
    expect(link.getAttribute('aria-label')).toBe('Chat with us on WhatsApp');
  });
});
