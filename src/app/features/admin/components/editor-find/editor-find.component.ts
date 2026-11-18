import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AppRoute } from '@shared/enums/app-route.enum';
import { type IFindEntry, buildFindIndex, findIn } from '../../models/find-index';
import { EDITOR_TABS } from '../../schemas/editor-tabs';
import { EditorJumpService } from '../../services/editor-jump.service';
import { EditorNavService } from '../../services/editor-nav.service';

/** The Find box's element id, for the side panel's folded Find button. */
export const FIND_INPUT_ID = 'editor-find';

/** Everything in the editor, indexed once: the schemas don't change while it runs. */
const INDEX = buildFindIndex(EDITOR_TABS, (tab) => `${AppRoute.Admin}/${tab}`);

/**
 * The side panel's Find box (0017 U2): type "phone", "about" or "Diwali" and go straight to the
 * field, wherever it is.
 */
@Component({
  selector: 'app-editor-find',
  templateUrl: './editor-find.component.html',
  styleUrl: './editor-find.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorFindComponent {
  protected readonly query = signal('');
  protected readonly results = computed(() => findIn(INDEX, this.query()));

  private readonly jumper = inject(EditorJumpService);
  private readonly nav = inject(EditorNavService);

  /** @param value What the owner typed. */
  protected search(value: string): void {
    this.query.set(value);
  }

  protected clear(): void {
    this.query.set('');
  }

  protected open(result: IFindEntry): void {
    this.clear();
    this.nav.closeDrawer();
    this.jumper.jump(result.url, result.fragment, result.fallback);
  }
}
