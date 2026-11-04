import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { IDocumentStore } from '@core/interfaces/i-document-store';
import { provideEditorTesting } from '../../testing/editor-testing';
import { MemoryDocumentStore } from '../../testing/memory-document-store';
import { SpeedReportComponent } from './speed-report.component';

describe('SpeedReportComponent', () => {
  const visit = { device: 'phone', lcp: 1000, fcp: 800, ttfb: 100, ready: 900, cls: 0 };

  function render(store = new MemoryDocumentStore({ 'vitals/a': visit })) {
    TestBed.configureTestingModule({
      providers: [
        ...provideEditorTesting().providers,
        { provide: IDocumentStore, useValue: store },
      ],
    });
    const fixture = TestBed.createComponent(SpeedReportComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    return { fixture, element, store, button: element.querySelector('button')! };
  }

  it('should read nothing until asked', () => {
    const store = new MemoryDocumentStore();
    const readAll = vi.spyOn(store, 'readAll');

    const { button } = render(store);

    expect(readAll).not.toHaveBeenCalled();
    expect(button.textContent.trim()).toBe('Load speed report');
  });

  it('should show the table and the answer when loaded', async () => {
    const { fixture, element, button } = render();

    button.click();
    await fixture.whenStable();

    expect(element.querySelector('[role="status"]')?.textContent).toContain('phone visits');
    expect(element.querySelector('tbody th')?.textContent).toBe('Phone');
    expect(button.textContent.trim()).toBe('Refresh speed report');
  });

  it('should show no table when there are no visits', async () => {
    const { fixture, element, button } = render(new MemoryDocumentStore());

    button.click();
    await fixture.whenStable();

    expect(element.querySelector('[role="status"]')?.textContent).toBe('No visits reported yet.');
    expect(element.querySelector('table')).toBeNull();
  });

  it('should say so when it fails, and work on the next try', async () => {
    const store = new MemoryDocumentStore({ 'vitals/a': visit });
    const readAll = vi
      .spyOn(store, 'readAll')
      .mockReturnValueOnce(throwError(() => new Error('denied')));
    const { fixture, element, button } = render(store);

    button.click();
    await fixture.whenStable();
    expect(element.querySelector('[role="alert"]')?.textContent).toContain('couldn’t be loaded');

    readAll.mockReturnValueOnce(of(new Map([['a', visit]])));
    button.click();
    await fixture.whenStable();

    expect(element.querySelector('[role="alert"]')).toBeNull();
    expect(element.querySelector('table')).not.toBeNull();
  });
});
