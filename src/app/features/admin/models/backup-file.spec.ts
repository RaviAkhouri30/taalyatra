import {
  BACKUP_PROBLEMS,
  type IBackup,
  backupFileName,
  checkBackup,
  isBackupPath,
} from './backup-file';

const MEDIA_ID = '0f8fad5b-d9cb-469f-a165-70867728950e';

const BACKUP: IBackup = {
  format: 1,
  site: 'taal-yatra',
  version: '1.12.0',
  createdAt: '2026-11-18T05:12:00.000Z',
  documents: { 'home/hero': { title: 'Hello' }, [`media/${MEDIA_ID}`]: { name: 'a.jpg' } },
};

function text(change: Record<string, unknown>): string {
  return JSON.stringify({ ...BACKUP, ...change });
}

describe('backup files', () => {
  it('should name the file after the day it was made', () => {
    expect(backupFileName(BACKUP.createdAt)).toBe('taal-yatra-backup-2026-11-18.json');
  });

  it('should accept the editor’s content and library entries, and nothing else', () => {
    expect(isBackupPath('home/hero')).toBe(true);
    expect(isBackupPath('team')).toBe(true);
    expect(isBackupPath(`media/${MEDIA_ID}`)).toBe(true);
    expect(isBackupPath('drafts/home__hero')).toBe(false);
    expect(isBackupPath('media/not-an-id')).toBe(false);
  });

  it('should accept a saved theme by its id, and nothing else in that collection (0027)', () => {
    expect(isBackupPath(`savedThemes/${MEDIA_ID}`)).toBe(true);
    expect(isBackupPath('savedThemes/spring')).toBe(false);
  });

  it('should read back a backup it wrote', () => {
    expect(checkBackup(JSON.stringify(BACKUP))).toEqual({ backup: BACKUP });
  });

  it.each([
    ['text that is not JSON', 'hello', BACKUP_PROBLEMS.unreadable],
    ['JSON that is not an object', '[1, 2]', BACKUP_PROBLEMS.unreadable],
    ['another site’s file', text({ site: 'other' }), BACKUP_PROBLEMS.notOurs],
    ['a file without a format', text({ format: '1' }), BACKUP_PROBLEMS.notOurs],
    ['a newer format', text({ format: 2 }), BACKUP_PROBLEMS.newer],
    ['an unknown path', text({ documents: { 'secrets/x': {} } }), BACKUP_PROBLEMS.damaged],
    [
      'a lead with a made-up path',
      text({ documents: { 'proposals/../x': {} } }),
      BACKUP_PROBLEMS.damaged,
    ],
    [
      'a document that is not an object',
      text({ documents: { 'home/hero': 'x' } }),
      BACKUP_PROBLEMS.damaged,
    ],
    ['documents that are a list', text({ documents: [] }), BACKUP_PROBLEMS.damaged],
    ['a missing date', text({ createdAt: 5 }), BACKUP_PROBLEMS.damaged],
    ['a missing version', text({ version: null }), BACKUP_PROBLEMS.damaged],
  ])('should refuse %s, saying why', (_case, file, problem) => {
    expect(checkBackup(file)).toEqual({ problem });
  });
});
