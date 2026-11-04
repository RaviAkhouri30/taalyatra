import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  afterNextRender,
  effect,
  inject,
  untracked,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from '@shared/base/base-component';
import { type IUnsavedChanges } from '../../guards/unsaved-changes.guard';
import { EditorNavService } from '../../services/editor-nav.service';
import { type IEditorPage, EditorPageViewModel } from '../../view-models/editor-page.view-model';
import { PreviewFrameComponent } from '../preview-frame/preview-frame.component';
import { PublishBarComponent } from '../publish-bar/publish-bar.component';
import { SchemaFieldsComponent } from '../schema-fields/schema-fields.component';

/**
 * One editor tab: a card per section, built from its schema, beside the live preview. Changes
 * save themselves as a draft.
 */
@Component({
  selector: 'app-editor-page',
  imports: [PreviewFrameComponent, PublishBarComponent, SchemaFieldsComponent],
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

  protected readonly nav = inject(EditorNavService);

  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly fragment = inject(ActivatedRoute).snapshot.fragment;
  private arrived = false;

  public constructor() {
    super();
    // Only a page with a preview column has a use for the top bar's Preview button.
    this.nav.previewAvailable.set(true);
    inject(DestroyRef).onDestroy(() => {
      this.nav.previewAvailable.set(false);
    });
    // The fields scroll in their own column, which the router's anchor scrolling can't reach. So a
    // link from the review page is followed here, once, when the cards exist.
    effect(() => {
      if (this.model.data() !== undefined && untracked(() => !this.arrived)) {
        this.arrived = true;
        afterNextRender(
          () => {
            if (this.fragment) {
              this.document.getElementById(this.fragment)?.scrollIntoView();
            }
          },
          { injector: this.injector },
        );
      }
    });
  }

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
