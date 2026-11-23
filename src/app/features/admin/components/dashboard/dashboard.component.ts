import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconName } from '@shared/enums/icon-name.enum';
import { BaseComponent } from '@shared/base/base-component';
import { AppRoute } from '@shared/enums/app-route.enum';
import { DashTone } from '../../models/dash-tone.enum';
import { type DashboardModel } from '../../models/dashboard.model';
import {
  LEADS_PATH,
  PUBLISH_PATH,
  RELEASES_PATH,
  VISITS_PATH,
} from '../../models/editor-nav.constants';
import { EditorTab } from '../../models/editor-tab.enum';
import { issueLink } from '../../schemas/editor-tabs';
import { DashboardViewModel } from '../../view-models/dashboard.view-model';
import { DashCardComponent } from '../dash-card/dash-card.component';
import { MiniBarsComponent } from '../mini-bars/mini-bars.component';
import { PublishBarComponent } from '../publish-bar/publish-bar.component';
import { SpeedReportComponent } from '../speed-report/speed-report.component';

/** One thing still to fill in, in plain words, with where to fix it (0017 U3). */
interface ITodo {
  /** The section of the site, e.g. "Offer". */
  readonly section: string;
  /** Where it is in that section, e.g. "Offer card 1 → Duration and price". */
  readonly where: string;
  readonly message: string;
  readonly url: string | null;
  readonly fragment: string;
}

/** The editor's home: one card per thing worth knowing, each linking to where it's changed. */
@Component({
  selector: 'app-dashboard',
  imports: [
    DashCardComponent,
    MiniBarsComponent,
    PublishBarComponent,
    RouterLink,
    SpeedReportComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DashboardViewModel],
})
export default class DashboardComponent extends BaseComponent<DashboardModel> {
  protected override readonly model = inject(DashboardViewModel);
  protected readonly tones = DashTone;
  protected readonly icons = IconName;
  protected readonly links = {
    publish: `${AppRoute.Admin}/${PUBLISH_PATH}`,
    offer: `${AppRoute.Admin}/${EditorTab.Offer}`,
    visibility: `${AppRoute.Admin}/${EditorTab.Visibility}`,
    releases: `${AppRoute.Admin}/${RELEASES_PATH}`,
    leads: `${AppRoute.Admin}/${LEADS_PATH}`,
    visits: `${AppRoute.Admin}/${VISITS_PATH}`,
  };
  /** Text still to fill in, each linked to its card. */
  protected readonly todos = computed<readonly ITodo[]>(() =>
    (this.model.data()?.warnings ?? []).map((warning) => {
      const link = issueLink(warning.sectionId);
      return {
        section: link?.tabLabel ?? warning.section,
        where: warning.field.split(' · ').join(' → '),
        message: warning.message,
        url: link?.url ?? null,
        fragment: link?.fragment ?? '',
      };
    }),
  );
  /** The to-do list by section of the site, in menu order. */
  protected readonly todoGroups = computed(() => {
    const groups = new Map<string, ITodo[]>();
    for (const todo of this.todos()) {
      groups.set(todo.section, [...(groups.get(todo.section) ?? []), todo]);
    }
    return [...groups].map(([label, items]) => ({ label, items }));
  });
}
