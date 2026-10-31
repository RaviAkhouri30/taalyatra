import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BaseComponent } from '@shared/base/base-component';
import { type IUnsavedChanges } from '../../guards/unsaved-changes.guard';
import { type IEditorPage, EditorPageViewModel } from '../../view-models/editor-page.view-model';
import { PreviewFrameComponent } from '../preview-frame/preview-frame.component';
import { SchemaFieldsComponent } from '../schema-fields/schema-fields.component';

/**
 * One editor tab: a card per section, built from its schema, beside the live preview. Changes
 * save themselves as a draft.
 */
@Component({
  selector: 'app-editor-page',
  imports: [PreviewFrameComponent, SchemaFieldsComponent],
  templateUrl: './editor-page.component.html',
  styleUrl: './editor-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [EditorPageViewModel],
  host: { '(window:beforeunload)': 'onBeforeUnload($event)' },
})
export default class EditorPageComponent
  extends BaseComponent<IEditorPage>
  implements IUnsavedChanges
{
  protected override readonly model = inject(EditorPageViewModel);

  public hasUnsavedChanges(): boolean {
    return this.model.hasUnsavedChanges();
  }

  /** Asks the browser to confirm closing the tab while a change could be lost. */
  protected onBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.hasUnsavedChanges()) {
      event.preventDefault();
    }
  }
}
