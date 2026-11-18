import { TestBed } from '@angular/core/testing';
import { layoutStub, provideEditorTesting, provideLayout } from '../../testing/editor-testing';
import { BackupPanelComponent } from './backup-panel.component';

const BACKUP = JSON.stringify({
  format: 1,
  site: 'taal-yatra',
  version: '1.11.0',
  createdAt: '2026-10-30T10:00:00.000Z',
  documents: { 'home/hero': { title: 'Backed up' } },
});

describe('BackupPanelComponent', () => {
  function render(justPublished = false) {
    const testing = provideEditorTesting();
    TestBed.configureTestingModule({
      providers: [...testing.providers, provideLayout(layoutStub())],
    });
    const fixture = TestBed.createComponent(BackupPanelComponent);
    fixture.componentRef.setInput('justPublished', justPublished);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const button = (name: string) =>
      Array.from(element.querySelectorAll('button')).find(
        (candidate) => candidate.textContent.trim() === name,
      );
    return { fixture, element, button, ...testing };
  }

  it('should remind the owner, and offer a download and a restore from a file', () => {
    const { element, button } = render();

    expect(element.querySelector('.bk-due')?.textContent).toContain('No backup yet');
    expect(button('Download a backup')).toBeDefined();
    expect(element.querySelector('[data-testid="backup-file"]')).not.toBeNull();
  });

  it('should suggest a backup straight after a publish', () => {
    const { element } = render(true);

    expect(element.querySelector('.bk-due')?.textContent).toContain('Published.');
  });

  it('should ask before restoring a chosen file, then clear the picker', () => {
    const { fixture, element, button, files } = render();
    files.text = BACKUP;
    const picker = element.querySelector<HTMLInputElement>('input[type="file"]')!;
    Object.defineProperty(picker, 'files', {
      value: { item: () => new File([BACKUP], 'backup.json') },
    });

    picker.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(element.textContent).toContain('Put the backup from 30 Oct 2026, 3:30 pm');
    expect(button('Yes, restore it')).toBeDefined();
  });

  it('should do nothing when the picker closes without a file', () => {
    const { fixture, element } = render();
    const picker = element.querySelector<HTMLInputElement>('input[type="file"]')!;
    Object.defineProperty(picker, 'files', { value: null });

    picker.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(element.querySelector('.bk-confirm')).toBeNull();
  });

  it('should show why a file was refused', () => {
    const { fixture, element, files } = render();
    files.text = 'not a backup';
    const picker = element.querySelector<HTMLInputElement>('input[type="file"]')!;
    Object.defineProperty(picker, 'files', { value: { item: () => new File([''], 'x.txt') } });

    picker.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(element.querySelector('[role="alert"]')?.textContent).toContain('can’t be read');
  });
});
