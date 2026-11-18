import { TestBed } from '@angular/core/testing';
import { CHANGELOG_TEXT } from '@core/tokens/changelog.token';
import { layoutStub, provideEditorTesting, provideLayout } from '../testing/editor-testing';
import { ReleasesPageViewModel } from './releases-page.view-model';

describe('ReleasesPageViewModel', () => {
  it('should load the releases at once and mark them seen', () => {
    const layout = layoutStub();
    TestBed.configureTestingModule({
      providers: [
        ...provideEditorTesting().providers,
        provideLayout(layout),
        { provide: CHANGELOG_TEXT, useValue: '## [1.0.0] - 2026-10-24\n### Added\n- First.' },
        ReleasesPageViewModel,
      ],
    });
    const model = TestBed.inject(ReleasesPageViewModel);

    model.init().subscribe();

    expect(model.data()?.entries.map((entry) => entry.release.version)).toEqual(['1.0.0']);
    expect(layout.markReleasesSeen).toHaveBeenCalled();
  });
});
