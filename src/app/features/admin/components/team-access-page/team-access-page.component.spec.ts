import { TestBed } from '@angular/core/testing';
import { throwError } from 'rxjs';
import { RolesService } from '../../services/roles.service';
import { provideEditorTesting } from '../../testing/editor-testing';
import TeamAccessPageComponent from './team-access-page.component';

const ROLE = { email: 'm@b.co', pages: {}, uploads: true, addedAt: '2026-10-01T10:00:00.000Z' };

describe('TeamAccessPageComponent', () => {
  function render(seed: Parameters<typeof provideEditorTesting>[0]) {
    const testing = provideEditorTesting(seed);
    TestBed.configureTestingModule({ providers: testing.providers });
    const fixture = TestBed.createComponent(TeamAccessPageComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const click = async (selector: string) => {
      element.querySelector<HTMLButtonElement>(selector)!.click();
      await fixture.whenStable();
    };
    return { fixture, element, click, ...testing };
  }

  it('should list the managers with a count', () => {
    const { element } = render({ 'roles/manager-uid': ROLE });

    expect(element.querySelectorAll('app-manager-card')).toHaveLength(1);
    expect(element.querySelector('.ta-count')?.textContent).toBe('1 manager');
    expect(element.querySelector('app-manager-form')).toBeNull();
  });

  it('should say when there are no managers yet', () => {
    const { element } = render({});

    expect(element.querySelector('.ta-empty')?.textContent).toContain('No managers yet');
  });

  it('should open the form to add a manager, hiding the add button', async () => {
    const { element, click } = render({});

    await click('.ta-head button');

    expect(element.querySelector('app-manager-form h2')?.textContent).toBe('Add a manager');
    expect(element.querySelector('.ta-head button')).toBeNull();
  });

  it('should open the form to change a manager, and close it again', async () => {
    const { element, click } = render({ 'roles/manager-uid': ROLE });

    await click('.mgr-actions button');
    expect(element.querySelector('app-manager-form h2')?.textContent).toBe('Change m@b.co');
    await click('.mf-actions button[type="button"]');

    expect(element.querySelector('app-manager-form')).toBeNull();
  });

  it('should remove a manager after asking', async () => {
    const { element, click, store } = render({ 'roles/manager-uid': ROLE });

    await click('.mgr-actions button:last-child');
    await click('.mgr-confirm button');

    expect(store.documents.has('roles/manager-uid')).toBe(false);
    expect(element.querySelector('.ta-empty')).not.toBeNull();
  });

  it('should say when the managers could not be read', () => {
    vi.spyOn(RolesService.prototype, 'managers').mockReturnValue(
      throwError(() => new Error('denied')),
    );
    const { element } = render({});

    expect(element.querySelector('.ta-problem')?.textContent).toContain('Couldn’t load');
  });
});
