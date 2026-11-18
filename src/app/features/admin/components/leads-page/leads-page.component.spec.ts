import { TestBed } from '@angular/core/testing';
import { throwError } from 'rxjs';
import { LeadsService } from '../../services/leads.service';
import { provideEditorTesting } from '../../testing/editor-testing';
import LeadsPageComponent from './leads-page.component';

describe('LeadsPageComponent', () => {
  function render(seed: Parameters<typeof provideEditorTesting>[0]) {
    const testing = provideEditorTesting(seed);
    TestBed.configureTestingModule({ providers: testing.providers });
    const fixture = TestBed.createComponent(LeadsPageComponent);
    fixture.detectChanges();
    return { fixture, element: fixture.nativeElement as HTMLElement, ...testing };
  }

  it('should list the leads with filters and a count', () => {
    const { element } = render({
      'proposals/a': { name: 'Asha' },
      'proposals/b': { name: 'Ravi' },
    });

    expect(element.querySelectorAll('app-lead-card')).toHaveLength(2);
    expect(element.querySelector('app-lead-filters')).not.toBeNull();
    expect(element.querySelector('.lp-count')?.textContent).toBe('2 leads');
  });

  it('should say when there are no proposals yet', () => {
    const { element } = render({});

    expect(element.querySelector('.lp-empty')?.textContent).toContain('No proposals yet');
    expect(element.querySelector('app-lead-filters')).toBeNull();
  });

  it('should export from the button, and remove after asking', async () => {
    const { fixture, element, files, store } = render({ 'proposals/a': { name: 'Asha' } });

    element.querySelector<HTMLButtonElement>('.lp-head button')!.click();
    element.querySelector<HTMLButtonElement>('.lc-foot button')!.click();
    await fixture.whenStable();
    element.querySelector<HTMLButtonElement>('.lc-confirm button')!.click();
    await fixture.whenStable();

    expect(files.downloads).toHaveLength(1);
    expect(store.documents.has('proposals/a')).toBe(false);
  });

  it('should change a status from the card', () => {
    const { element, store } = render({ 'proposals/a': { name: 'Asha' } });
    const select = element.querySelector<HTMLSelectElement>('.lc-status select')!;

    select.value = 'contacted';
    select.dispatchEvent(new Event('change'));

    expect(store.documents.get('proposals/a')).toMatchObject({ status: 'contacted' });
  });

  it('should say when the leads could not be read', () => {
    vi.spyOn(LeadsService.prototype, 'leads').mockReturnValue(
      throwError(() => new Error('denied')),
    );

    const { element } = render({});

    expect(element.querySelector('[role="alert"]')?.textContent).toContain(
      'Couldn’t load the leads',
    );
  });
});
