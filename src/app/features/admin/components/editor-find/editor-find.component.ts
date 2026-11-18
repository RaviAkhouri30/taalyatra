import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AppRoute } from '@shared/enums/app-route.enum';
import { type IFindEntry, buildFindIndex, findIn } from '../../models/find-index';
import { EDITOR_TABS } from '../../schemas/editor-tabs';
import { EditorJumpService } from '../../services/editor-jump.service';
import { EditorNavService } from '../../services/editor-nav.service';
import { EditorLayoutViewModel } from '../../view-models/editor-layout.view-model';

/** The Find box's element id, for the side panel's folded Find button. */
export const FIND_INPUT_ID = 'editor-find';

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
  protected readonly results = computed(() => findIn(this.index(), this.query()));

  private readonly jumper = inject(EditorJumpService);
  private readonly nav = inject(EditorNavService);
  private readonly layout = inject(EditorLayoutViewModel);
  /** Everything this account can open, indexed once per sign-in: no page a manager can't see. */
  private readonly index = computed(() => {
    const permissions = this.layout.permissions();
    return buildFindIndex(
      EDITOR_TABS.filter((entry) => permissions.canSee(entry.tab)),
      (tab) => `${AppRoute.Admin}/${tab}`,
    );
  });

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
