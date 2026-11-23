import { TestBed } from '@angular/core/testing';
import { OM_SIGN } from '@shared/constants/festival-looks.constants';
import { PILL_DIYA } from '@shared/constants/promo.constants';
import { Festival } from '@shared/enums/festival.enum';
import { FestivalIconComponent } from './festival-icon.component';

describe('FestivalIconComponent', () => {
  function render(festival: Festival): HTMLElement {
    const fixture = TestBed.createComponent(FestivalIconComponent);
    fixture.componentRef.setInput('festival', festival);
    fixture.componentRef.setInput('diya', PILL_DIYA);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('should keep today’s diya for Diwali', () => {
    expect(render(Festival.Diwali).querySelector('app-diya-icon')).not.toBeNull();
  });

  it('should show the Om sign for Ganesh Chaturthi, hidden from screen readers', () => {
    const om = render(Festival.GaneshChaturthi).querySelector('.om');

    expect(om?.textContent).toBe(OM_SIGN);
    expect(om?.getAttribute('aria-hidden')).toBe('true');
  });

  it('should draw a stroke icon, at the diya’s size, for the other festivals', () => {
    const svg = render(Festival.Christmas).querySelector('app-icon svg');

    expect(svg?.getAttribute('width')).toBe(String(PILL_DIYA.size));
    expect(render(Festival.None).querySelector('app-icon')).not.toBeNull();
  });
});
