import { TestBed } from '@angular/core/testing';
import { CHANGELOG_TEXT } from './changelog.token';

describe('CHANGELOG_TEXT', () => {
  it('should hold the bundled CHANGELOG when nothing overrides it', () => {
    const text = TestBed.inject(CHANGELOG_TEXT);

    expect(text.startsWith('# Changelog')).toBe(true);
    expect(text).toMatch(/^## \[1\.0\.0\] - \d{4}-\d{2}-\d{2}$/m);
  });
});
