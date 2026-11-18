import { TestBed } from '@angular/core/testing';
import { throwError } from 'rxjs';
import { VisitsService } from '../../services/visits.service';
import { provideEditorTesting } from '../../testing/editor-testing';
import VisitsPageComponent from './visits-page.component';

describe('VisitsPageComponent', () => {
  function render(seed: Parameters<typeof provideEditorTesting>[0] = {}) {
    TestBed.configureTestingModule({ providers: provideEditorTesting(seed).providers });
    const fixture = TestBed.createComponent(VisitsPageComponent);
    fixture.detectChanges();
    return { fixture, element: fixture.nativeElement as HTMLElement };
  }

  it('should show both graphs, by day to start with, and where visitors arrive', () => {
    const { element } = render({
      'visitDays/2026-10-30': { total: 3, pages: { '/shows': 3 }, devices: { tablet: 3 } },
    });

    expect(
      Array.from(element.querySelectorAll('app-bar-chart h2')).map((h) => h.textContent),
    ).toEqual(['Visits', 'Proposals']);
    expect(element.querySelector('[aria-pressed="true"]')?.textContent.trim()).toBe('By day');
    expect(element.querySelector('.vp-since')?.textContent).toContain(
      'Visits are counted from 30 Oct 2026',
    );
    expect(element.querySelector('.vp-rows')?.textContent).toContain('Shows');
  });

  it('should switch the period when the owner picks one', async () => {
    const { fixture, element } = render();
    const byYear = Array.from(element.querySelectorAll<HTMLButtonElement>('.vp-period')).at(-1)!;

    byYear.click();
    await fixture.whenStable();

    expect(byYear.getAttribute('aria-pressed')).toBe('true');
  });

  it('should say when nothing is counted yet', () => {
    const { element } = render();

    expect(element.querySelector('.vp-since')?.textContent).toContain('No visits counted yet');
    expect(element.textContent).toContain('No visits in this period.');
  });

  it('should say when the numbers could not be read', () => {
    vi.spyOn(VisitsService.prototype, 'load').mockReturnValue(
      throwError(() => new Error('denied')),
    );

    const { element } = render();

    expect(element.querySelector('[role="alert"]')?.textContent).toContain('Couldn’t load');
  });
});
