import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BaseComponent } from '@shared/base/base-component';
import { AssistantLauncherComponent } from './assistant-launcher/assistant-launcher.component';
import { AssistantPanelComponent } from './assistant-panel/assistant-panel.component';
import { type AssistantModel } from './assistant.model';
import { HomeAssistantViewModel } from './home-assistant.view-model';

/** Chat assistant with its floating call/WhatsApp/chat cluster (home page only). */
@Component({
  selector: 'app-home-assistant',
  imports: [AssistantLauncherComponent, AssistantPanelComponent],
  templateUrl: './home-assistant.component.html',
  styleUrl: './home-assistant.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HomeAssistantViewModel],
})
export class HomeAssistantComponent extends BaseComponent<AssistantModel> {
  protected override readonly model = inject(HomeAssistantViewModel);
  protected readonly panelId = 'assistant-panel';

  protected onAsked(question?: string): void {
    this.model.ask(question);
  }

  protected onClosed(launcher: AssistantLauncherComponent): void {
    this.model.close();
    launcher.focusToggle();
  }
}
