import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ButtonSize, ButtonVariant } from '@shared/enums/button-variant.enum';
import { ButtonDirective } from './button.directive';

@Component({
  imports: [ButtonDirective],
  template: `<button appButton type="button" [variant]="variant()" [size]="size()">Go</button>`,
})
class HostComponent {
  public readonly variant = signal(ButtonVariant.Primary);
  public readonly size = signal(ButtonSize.Regular);
}

describe('ButtonDirective', () => {
  function render() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const button = (fixture.nativeElement as HTMLElement).querySelector('button')!;
    return { fixture, button };
  }

  it('should apply the base class only for a regular primary button', () => {
    const { button } = render();

    expect(button.className).toBe('btn');
  });

  it.each([
    [ButtonVariant.Ghost, 'btn--ghost'],
    [ButtonVariant.Dark, 'btn--dark'],
    [ButtonVariant.Line, 'btn--line'],
  ])('should apply the %s variant class', (variant, cssClass) => {
    const { fixture, button } = render();

    fixture.componentInstance.variant.set(variant);
    fixture.detectChanges();

    expect(button.classList).toContain(cssClass);
  });

  it('should apply the compact size class', () => {
    const { fixture, button } = render();

    fixture.componentInstance.size.set(ButtonSize.Compact);
    fixture.detectChanges();

    expect(button.classList).toContain('btn--compact');
  });
});
