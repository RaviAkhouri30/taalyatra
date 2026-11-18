import { TestBed } from '@angular/core/testing';
import { CHANGELOG_TEXT } from '@core/tokens/changelog.token';
import { layoutStub, provideEditorTesting, provideLayout } from '../../testing/editor-testing';
import ReleasesComponent from './releases.component';

const CHANGELOG = [
  '## [1.12.0] - 2026-11-18',
  '### Added',
  '- **Backups** of the `site`.',
  '## [1.11.0] - 2026-11-17',
  '### Changed',
  '- A plain note.',
].join('\n');

describe('ReleasesComponent', () => {
  function render(changelog = CHANGELOG) {
    const layout = layoutStub();
    TestBed.configureTestingModule({
      providers: [
        ...provideEditorTesting().providers,
        provideLayout(layout),
        { provide: CHANGELOG_TEXT, useValue: changelog },
      ],
    });
    const fixture = TestBed.createComponent(ReleasesComponent);
    fixture.detectChanges();
    return { element: fixture.nativeElement as HTMLElement, layout };
  }

  it('should list every release, newest first and open, with its notes', () => {
    const { element } = render();
    const [newest, older] = Array.from(element.querySelectorAll('details'));

    expect(older?.open).toBe(false);
    expect(newest?.open).toBe(true);
    expect(newest?.querySelector('summary')?.textContent).toContain('Version 1.12.0');
    expect(newest?.querySelector('summary')?.textContent).toContain('This version');
  });

  it('should show bold and code in a note as written', () => {
    const { element } = render();
    const note = element.querySelector('details li');

    expect(note?.querySelector('b')?.textContent).toBe('Backups');
    expect(note?.querySelector('code')?.textContent).toBe('site');
  });

  it('should clear the New marker once opened', () => {
    const { layout } = render();

    expect(layout.markReleasesSeen).toHaveBeenCalledOnce();
  });

  it('should say when there are no release notes', () => {
    const { element } = render('# Changelog');

    expect(element.textContent).toContain('No release notes yet.');
  });
});
