import { inlineParts, parseChangelog } from './release-notes';

const CHANGELOG = [
  '# Changelog',
  '',
  'Format: [Keep a Changelog](https://keepachangelog.com).',
  '',
  '## [Unreleased]',
  '',
  '### Added',
  '',
  '- Not out yet.',
  '',
  '## [1.2.0] - 2026-11-18',
  '',
  '### Added',
  '',
  '- **Find** at the top of the menu: type',
  '  "phone" to go straight there.',
  '- A second note.',
  '',
  '### Fixed',
  '',
  '## [1.1.0] - 2026-11-01',
  '',
  '### Changed',
  '',
  '- See [the docs](docs/x.md) for `npm start`.',
].join('\n');

describe('parseChangelog', () => {
  it('should list the releases newest first, leaving out Unreleased', () => {
    const releases = parseChangelog(CHANGELOG);

    expect(releases.map((release) => [release.version, release.date])).toEqual([
      ['1.2.0', '2026-11-18'],
      ['1.1.0', '2026-11-01'],
    ]);
  });

  it('should join a note carried on to the next line, and drop empty lists', () => {
    const [newest] = parseChangelog(CHANGELOG);

    expect(newest?.groups.map((group) => group.heading)).toEqual(['Added']);
    expect(newest?.groups[0]?.items).toHaveLength(2);
    expect(newest?.groups[0]?.items[0]?.map((part) => part.text).join('')).toBe(
      'Find at the top of the menu: type "phone" to go straight there.',
    );
  });

  it('should find nothing in text that is not a changelog', () => {
    expect(parseChangelog('Hello\n- a stray item')).toEqual([]);
  });

  it('should read the CRLF line endings Windows editors write', () => {
    expect(parseChangelog(CHANGELOG.replaceAll('\n', '\r\n'))).toHaveLength(2);
  });
});

describe('inlineParts', () => {
  it('should split bold and code from plain text, and keep only a link’s text', () => {
    expect(inlineParts('See [the docs](docs/x.md) for **this** and `npm start`')).toEqual([
      { text: 'See the docs for ', strong: false, code: false },
      { text: 'this', strong: true, code: false },
      { text: ' and ', strong: false, code: false },
      { text: 'npm start', strong: false, code: true },
    ]);
  });

  it('should keep plain text as one part', () => {
    expect(inlineParts('Plain words.')).toEqual([
      { text: 'Plain words.', strong: false, code: false },
    ]);
  });
});
