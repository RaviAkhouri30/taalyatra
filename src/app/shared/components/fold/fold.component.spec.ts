import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FoldMode } from '@shared/enums/fold-mode.enum';
import { ViewportService } from '@shared/services/viewport.service';
import { FoldComponent } from './fold.component';

@Component({
  imports: [FoldComponent],
  template: '<app-fold [mode]="mode"><p>Inside</p></app-fold>',
})
class HostComponent {
  public mode = FoldMode.Never;
}

describe('FoldComponent', () => {
  const isPhone = signal(false);

  function render(mode: FoldMode, phone = false) {
    isPhone.set(phone);
    TestBed.configureTestingModule({
      providers: [{ provide: ViewportService, useValue: { isPhone: isPhone.asReadonly() } }],
    });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.mode = mode;
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      body: () => element.querySelector<HTMLElement>('.fold-body')!,
      button: () => element.querySelector<HTMLButtonElement>('.fold-toggle'),
    };
  }

  it('should show the content with no button when it never folds', () => {
    const { body, button } = render(FoldMode.Never);

    expect(body().hasAttribute('hidden')).toBe(false);
    expect(body().textContent).toContain('Inside');
    expect(button()).toBeNull();
  });

  it('should fold it, findable by the browser, behind Show more', () => {
    const { body, button } = render(FoldMode.Always);

    expect(body().getAttribute('hidden')).toBe('until-found');
    expect(button()?.textContent).toContain('Show more');
    expect(button()?.getAttribute('aria-expanded')).toBe('false');
    expect(button()?.getAttribute('aria-controls')).toBe(body().id);
  });

  it('should open and close it with the button', () => {
    const { fixture, body, button } = render(FoldMode.Always);

    button()?.click();
    fixture.detectChanges();
    expect(body().hasAttribute('hidden')).toBe(false);
    expect(button()?.getAttribute('aria-expanded')).toBe('true');
    expect(button()?.textContent).toContain('Show less');

    button()?.click();
    fixture.detectChanges();
    expect(body().getAttribute('hidden')).toBe('until-found');
  });

  it('should open when Find on page reveals the content', () => {
    const { fixture, body, button } = render(FoldMode.Always);

    body().dispatchEvent(new Event('beforematch'));
    fixture.detectChanges();

    expect(button()?.getAttribute('aria-expanded')).toBe('true');
  });

  it.each([
    [FoldMode.Phone, true, true],
    [FoldMode.Phone, false, false],
    [FoldMode.Desktop, false, true],
    [FoldMode.Desktop, true, false],
  ])('should fold in %s mode only on the right screen (phone: %s)', (mode, phone, folded) => {
    const { button } = render(mode, phone);

    expect(button() !== null).toBe(folded);
  });
});
