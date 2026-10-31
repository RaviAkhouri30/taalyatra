import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { SaveStatus } from '../models/save-status.enum';
import { EDITOR_ADMIN, provideEditorTesting } from '../testing/editor-testing';
import { EditorLayoutViewModel } from './editor-layout.view-model';

describe('EditorLayoutViewModel', () => {
  const draft = { path: 'home/hero', content: {}, savedAt: 'x' };

  function setUp() {
    const testing = provideEditorTesting({ 'drafts/home__hero': draft });
    TestBed.configureTestingModule({ providers: [...testing.providers, EditorLayoutViewModel] });
    const model = TestBed.inject(EditorLayoutViewModel);
    model.init().subscribe();
    return { model, ...testing };
  }

  it('should load the page copy, the signed-in email and the number of drafts', () => {
    const { model } = setUp();

    expect(model.data()?.home.signOut).toBe('Sign out');
    expect(model.email()).toBe(EDITOR_ADMIN.email);
    expect(model.changeCount()).toBe(1);
  });

  it('should report saving, saved and failed in the status line', () => {
    const { model } = setUp();

    expect(model.statusText()).toBe('Changes save automatically as a draft.');
    model.reportSaving();
    expect(model.status()).toBe(SaveStatus.Saving);
    model.reportFailed();
    expect(model.failed()).toBe(true);
    model.reportSaved();
    expect(model.statusText()).toContain('Saved in your draft');
  });

  it('should recount the drafts when asked', () => {
    const { model, store } = setUp();
    store.documents.delete('drafts/home__hero');

    model.refreshChanges();

    expect(model.changeCount()).toBe(0);
  });

  it('should pass retry requests on to the pages', () => {
    const { model } = setUp();
    const retried = vi.fn();
    model.retries$.subscribe(retried);

    model.retry();

    expect(retried).toHaveBeenCalledTimes(1);
  });

  it('should sign out once and go to the sign-in page', () => {
    const { model, signOut } = setUp();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);

    model.signOut();

    expect(signOut).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith('/admin/sign-in');
    expect(model.signingOut()).toBe(false);
  });

  it('should stay usable when signing out fails', () => {
    const { model, signOut } = setUp();
    signOut.mockReturnValue(throwError(() => new Error('network')));

    model.signOut();

    expect(model.signingOut()).toBe(false);
  });
});
