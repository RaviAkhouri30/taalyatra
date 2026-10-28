import { TestBed } from '@angular/core/testing';
import { FakeClipboardService } from '@core/backends/fake/fake-clipboard.service';
import { IClipboardService } from '@core/interfaces/i-clipboard-service';
import { CopyTextComponent } from './copy-text.component';

describe('CopyTextComponent', () => {
  function render() {
    const clipboard = new FakeClipboardService();
    TestBed.configureTestingModule({
      providers: [{ provide: IClipboardService, useValue: clipboard }],
    });
    const fixture = TestBed.createComponent(CopyTextComponent);
    fixture.componentRef.setInput('text', 'Parmar Square, Kharadi, Pune');
    fixture.componentRef.setInput('action', 'Copy address');
    fixture.componentRef.setInput('copied', 'Copied');
    fixture.componentRef.setInput('failed', 'Failed');
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    return { fixture, element, clipboard, button: element.querySelector('button')! };
  }

  it('should name the button with the action and the full text', () => {
    const { button } = render();

    expect(button.getAttribute('aria-label')).toBe('Copy address: Parmar Square, Kharadi, Pune');
  });

  it('should copy the full text when clicked', () => {
    const { button, clipboard } = render();

    button.click();

    expect(clipboard.copied).toEqual(['Parmar Square, Kharadi, Pune']);
  });

  it('should show the tooltip on hover and focus, and hide it on Escape and blur', () => {
    const { fixture, element, button } = render();
    const tip = () => element.querySelector('.tip')!.classList.contains('tip--open');

    element.dispatchEvent(new Event('mouseenter'));
    fixture.detectChanges();
    expect(tip()).toBe(true);
    element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(tip()).toBe(false);
    button.dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    expect(tip()).toBe(true);
    button.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(tip()).toBe(false);
    element.dispatchEvent(new Event('mouseenter'));
    element.dispatchEvent(new Event('mouseleave'));
    fixture.detectChanges();
    expect(tip()).toBe(false);
  });
});
