import { TestBed } from '@angular/core/testing';
import fakeDb from '@core/backends/fake/fake-db.json';
import {
  layoutStub,
  provideEditorTesting,
  provideLayout,
  provideSignedIn,
} from '../../testing/editor-testing';
import { ApprovalsPanelComponent } from './approvals-panel.component';

const MANAGER = { uid: 'manager', email: 'm@b.co' };
const REQUEST = {
  by: MANAGER.uid,
  email: MANAGER.email,
  paths: ['home/hero'],
  note: '',
  sentAt: '2026-10-31T09:00:00.000Z',
  status: 'waiting',
};

describe('ApprovalsPanelComponent', () => {
  function render(seed: Record<string, Record<string, unknown>>, user?: typeof MANAGER) {
    const testing = provideEditorTesting({
      'roles/manager': { email: MANAGER.email, pages: {}, uploads: true, addedAt: 'x' },
      ...seed,
    });
    TestBed.configureTestingModule({
      providers: [
        ...testing.providers,
        ...(user ? provideSignedIn(user) : []),
        provideLayout(layoutStub()),
      ],
    });
    const fixture = TestBed.createComponent(ApprovalsPanelComponent);
    fixture.detectChanges();
    return { fixture, element: fixture.nativeElement as HTMLElement, store: testing.store };
  }

  it('should show nothing when nothing is waiting', () => {
    const { element } = render({});

    expect(element.querySelector('section')).toBeNull();
  });

  it('should list the owner’s queue and approve from a card', async () => {
    const { fixture, element, store } = render({
      'approvals/r1': REQUEST,
      'drafts/home__hero': { path: 'home/hero', content: fakeDb.home.hero, savedAt: 'x' },
    });

    expect(element.querySelector('h2')?.textContent).toBe('Waiting for your approval (1)');
    expect(element.querySelector('.apl-lead')).not.toBeNull();
    element.querySelector<HTMLButtonElement>('.ap-actions button')?.click();
    await fixture.whenStable();

    expect(store.documents.get('approvals/r1')).toMatchObject({ status: 'approved' });
    expect(store.documents.get('home/hero')).toEqual(fakeDb.home.hero);
  });

  it('should send back from a card with the reason written', async () => {
    const { fixture, element, store } = render({ 'approvals/r1': REQUEST });

    element.querySelectorAll<HTMLButtonElement>('.ap-actions button')[1]?.click();
    fixture.detectChanges();
    const field = element.querySelector('textarea')!;
    field.value = 'Not yet';
    field.dispatchEvent(new Event('input'));
    element.querySelector<HTMLButtonElement>('.ap-reason button')?.click();
    await fixture.whenStable();

    expect(store.documents.get('approvals/r1')).toMatchObject({ answer: 'Not yet' });
  });

  it('should list a manager’s requests and act on them', async () => {
    const { fixture, element, store } = render(
      {
        'approvals/r1': REQUEST,
        'approvals/r2': { ...REQUEST, sentAt: '2026-10-30T09:00:00.000Z', status: 'approved' },
      },
      MANAGER,
    );

    expect(element.querySelector('h2')?.textContent).toBe('Your requests');
    expect(element.querySelector('.apl-lead')).toBeNull();
    const buttons = element.querySelectorAll<HTMLButtonElement>('.ap-actions button');
    buttons[0]?.click();
    await fixture.whenStable();
    element.querySelector<HTMLButtonElement>('.ap-actions button')?.click();
    await fixture.whenStable();

    expect(store.documents.has('approvals/r1')).toBe(false);
    expect(store.documents.has('approvals/r2')).toBe(false);
  });
});
