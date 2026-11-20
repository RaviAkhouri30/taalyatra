import { TestBed } from '@angular/core/testing';
import { throwError } from 'rxjs';
import fakeDb from '@core/backends/fake/fake-db.json';
import { ToastTone } from '@shared/enums/toast-tone.enum';
import { ToastService } from '@shared/services/toast.service';
import { ApprovalService } from '../services/approval.service';
import { MediaLibraryService } from '../services/media-library.service';
import {
  layoutStub,
  provideEditorTesting,
  provideLayout,
  provideSignedIn,
} from '../testing/editor-testing';
import { APPROVAL_MESSAGES, ApprovalsPanelViewModel } from './approvals-panel.view-model';

const MANAGER = { uid: 'manager', email: 'm@b.co' };
const REQUEST = {
  by: MANAGER.uid,
  email: MANAGER.email,
  paths: ['home/hero'],
  note: 'New title',
  sentAt: '2026-10-31T09:00:00.000Z',
  status: 'waiting',
};

describe('ApprovalsPanelViewModel', () => {
  function setUp(user?: typeof MANAGER, seed: Record<string, Record<string, unknown>> = {}) {
    const testing = provideEditorTesting({
      'roles/manager': { email: MANAGER.email, pages: {}, uploads: true, addedAt: 'x' },
      'home/hero': fakeDb.home.hero,
      'drafts/home__hero': {
        path: 'home/hero',
        content: { ...fakeDb.home.hero, title: 'New' },
        savedAt: '2026-10-31T09:00:00.000Z',
        savedBy: MANAGER.uid,
      },
      'approvals/r1': REQUEST,
      'locks/home__hero': { approval: 'r1' },
      ...seed,
    });
    const show = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        ...testing.providers,
        ...(user ? provideSignedIn(user) : []),
        provideLayout(layoutStub()),
        { provide: ToastService, useValue: { show } },
        ApprovalsPanelViewModel,
      ],
    });
    const model = TestBed.inject(ApprovalsPanelViewModel);
    model.init().subscribe();
    const first = () => model.data()!.requests[0]!.approval;
    return { model, show, first, store: testing.store };
  }

  it('should show the owner what waits for them', () => {
    const { model } = setUp();

    expect(model.heading()).toBe('Waiting for your approval (1)');
    expect(model.data()?.requests[0]?.title).toBe('Hero');
  });

  it('should approve: the change goes live, answered and unlocked', () => {
    const { model, show, first, store } = setUp();

    model.approve(first());

    expect(store.documents.get('home/hero')).toMatchObject({ title: 'New' });
    expect(store.documents.get('approvals/r1')).toMatchObject({ status: 'approved' });
    expect(store.documents.has('locks/home__hero')).toBe(false);
    expect(show).toHaveBeenCalledWith(APPROVAL_MESSAGES.approved);
    expect(model.heading()).toBe('');
    expect(model.busy()).toBe(false);
  });

  it('should send back with the reason', () => {
    const { model, show, first, store } = setUp();

    model.sendBack(first(), 'Wrong dates');

    expect(store.documents.get('approvals/r1')).toMatchObject({
      status: 'sent-back',
      answer: 'Wrong dates',
    });
    expect(show).toHaveBeenCalledWith(APPROVAL_MESSAGES.sentBack);
  });

  it('should show a manager their requests, and let them withdraw one', () => {
    const { model, show, first, store } = setUp(MANAGER);
    expect(model.heading()).toBe('Your requests');

    model.withdraw(first());

    expect(store.documents.has('approvals/r1')).toBe(false);
    expect(store.documents.has('locks/home__hero')).toBe(false);
    expect(show).toHaveBeenCalledWith(APPROVAL_MESSAGES.withdrawn);
  });

  it('should withdraw a request a manager approves themselves, saying what’s next (0023)', () => {
    const { model, show, first, store } = setUp(MANAGER);

    model.approveOwn(first());

    expect(store.documents.has('approvals/r1')).toBe(false);
    expect(show).toHaveBeenCalledWith(APPROVAL_MESSAGES.approveOwn);
  });

  it('should let a manager clear an answered request', () => {
    const { model, first, store } = setUp(MANAGER, {
      'approvals/r1': { ...REQUEST, status: 'sent-back', answer: 'No', answeredAt: 'x' },
    });

    model.dismiss(first());

    expect(store.documents.has('approvals/r1')).toBe(false);
  });

  it('should say so, and keep going, when an answer fails', () => {
    const { model, show, first } = setUp();
    vi.spyOn(TestBed.inject(ApprovalService), 'sendBack').mockReturnValueOnce(
      throwError(() => new Error('denied')),
    );

    model.sendBack(first(), 'No');
    model.sendBack(first(), 'No');

    expect(show).toHaveBeenNthCalledWith(1, APPROVAL_MESSAGES.failed, ToastTone.Error);
    expect(show).toHaveBeenNthCalledWith(2, APPROVAL_MESSAGES.sentBack);
  });

  it('should stay empty when the requests can’t be read', () => {
    vi.spyOn(ApprovalService.prototype, 'requests').mockReturnValue(
      throwError(() => new Error('denied')),
    );
    vi.spyOn(MediaLibraryService.prototype, 'assets').mockReturnValue(
      throwError(() => new Error('denied')),
    );

    const { model } = setUp();

    expect(model.data()).toBeUndefined();
    expect(model.heading()).toBe('');
  });
});
