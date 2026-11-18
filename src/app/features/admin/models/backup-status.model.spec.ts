import { BackupStatus } from './backup-status.model';

const NOW = new Date('2026-11-18T10:00:00.000Z');

describe('BackupStatus', () => {
  it('should remind the owner when there has never been a backup', () => {
    const status = new BackupStatus(null, NOW);

    expect(status.due).toBe(true);
    expect(status.text).toContain('No backup yet');
  });

  it('should only say when it was, within 14 days', () => {
    const status = new BackupStatus('2026-11-04T10:00:00.000Z', NOW);

    expect(status.due).toBe(false);
    expect(status.text).toBe('Last backup: 4 Nov 2026, 3:30 pm.');
  });

  it('should remind the owner after 14 days, saying how long it has been', () => {
    const status = new BackupStatus('2026-11-03T09:00:00.000Z', NOW);

    expect(status.due).toBe(true);
    expect(status.text).toContain('That’s 15 days ago: download a new one.');
  });

  it('should treat an unreadable date as no backup', () => {
    const status = new BackupStatus('yesterday', NOW);

    expect(status.due).toBe(true);
    expect(status.text).toContain('No backup yet');
  });
});
