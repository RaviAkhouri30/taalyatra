import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseComponent } from '@shared/base/base-component';
import { ButtonDirective } from '@shared/directives/button.directive';
import { ButtonVariant } from '@shared/enums/button-variant.enum';
import { BackupPanelViewModel, type IBackupPanel } from '../../view-models/backup-panel.view-model';

/** The backups card on Review & publish (0016 V13). */
@Component({
  selector: 'app-backup-panel',
  imports: [ButtonDirective, ReactiveFormsModule],
  templateUrl: './backup-panel.component.html',
  styleUrl: './backup-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [BackupPanelViewModel],
})
export class BackupPanelComponent extends BaseComponent<IBackupPanel> {
  /** A publish just finished: the card suggests keeping a copy of what's live now. */
  public readonly justPublished = input(false);
  /** Restoring a backup is the owner's only (0022 D3). */
  public readonly canRestore = input(true);
  /** "Include leads" needs Leads too (0022). */
  public readonly canIncludeLeads = input(true);

  protected override readonly model = inject(BackupPanelViewModel);
  protected readonly ghost = ButtonVariant.Ghost;

  /** Hands the chosen file over, and clears the picker so the same file can be chosen again. */
  protected choose(picker: HTMLInputElement): void {
    const file = picker.files?.item(0);
    picker.value = '';
    if (file) {
      this.model.chooseFile(file);
    }
  }
}
