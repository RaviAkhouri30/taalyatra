import { TestBed } from '@angular/core/testing';
import { DeviceStoreService } from './device-store.service';
import { CHANGELOG_TEXT } from '@core/tokens/changelog.token';
import { RELEASE_SEEN_KEY, ReleaseNotesService } from './release-notes.service';

const CHANGELOG = [
  '## [1.2.0] - 2026-11-18',
  '### Added',
  '- New things.',
  '## [1.1.0] - 2026-11-01',
  '### Fixed',
  '- Old things.',
].join('\n');

describe('ReleaseNotesService', () => {
  let stored: Map<string, string>;

  function create(changelog = CHANGELOG): ReleaseNotesService {
    stored = new Map();
    TestBed.configureTestingModule({
      providers: [
        { provide: CHANGELOG_TEXT, useValue: changelog },
        {
          provide: DeviceStoreService,
          useValue: {
            get: (key: string) => stored.get(key) ?? null,
            set: (key: string, value: string) => stored.set(key, value),
          },
        },
      ],
    });
    return TestBed.inject(ReleaseNotesService);
  }

  it('should list the releases, the newest as the current one', () => {
    const notes = create();

    expect(notes.releases().map((release) => release.version)).toEqual(['1.2.0', '1.1.0']);
    expect(notes.current()?.version).toBe('1.2.0');
  });

  it('should say there is something new until the current release is seen', () => {
    const notes = create();
    stored.set(RELEASE_SEEN_KEY, '1.1.0');
    expect(notes.hasUnseen()).toBe(true);

    notes.markSeen();

    expect(stored.get(RELEASE_SEEN_KEY)).toBe('1.2.0');
    expect(notes.hasUnseen()).toBe(false);
  });

  it('should have nothing new, and remember nothing, when the CHANGELOG has no release', () => {
    const notes = create('# Changelog');

    notes.markSeen();

    expect(notes.hasUnseen()).toBe(false);
    expect(stored.size).toBe(0);
  });
});
