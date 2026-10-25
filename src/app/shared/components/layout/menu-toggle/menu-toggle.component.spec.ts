import { TestBed } from '@angular/core/testing';
import { MenuToggleComponent } from './menu-toggle.component';

describe('MenuToggleComponent', () => {
  it('should expose its state to assistive tech and emit on click', () => {
    const fixture = TestBed.createComponent(MenuToggleComponent);
    fixture.componentRef.setInput('controls', 'menu');
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    const button = (fixture.nativeElement as HTMLElement).querySelector('button')!;
    const toggled = vi.fn();
    fixture.componentInstance.toggled.subscribe(toggled);

    button.click();

    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(button.getAttribute('aria-controls')).toBe('menu');
    expect(button.classList).toContain('open');
    expect(toggled).toHaveBeenCalledTimes(1);
  });
});
