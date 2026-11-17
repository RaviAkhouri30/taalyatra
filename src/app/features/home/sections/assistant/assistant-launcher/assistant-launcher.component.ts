import {
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  input,
  output,
  viewChild,
} from '@angular/core';
import { type AssistantModel } from '../assistant.model';
import { ContactFabsComponent } from '../contact-fabs/contact-fabs.component';

/**
 * Floating cluster (design `.fab`): call and WhatsApp shortcuts (`ContactFabsComponent`) plus the chat toggle, with a
 * one-time "Questions?" tease and badge until the visitor first opens the chat.
 */
@Component({
  selector: 'app-assistant-launcher',
  imports: [ContactFabsComponent],
  templateUrl: './assistant-launcher.component.html',
  styleUrl: './assistant-launcher.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssistantLauncherComponent {
  public readonly assistant = input.required<AssistantModel>();
  public readonly open = input.required<boolean>();
  /** Whether the visitor has opened the chat before (hides the tease and badge). */
  public readonly hasOpened = input.required<boolean>();
  /** Id of the panel the toggle controls. */
  public readonly panelId = input.required<string>();
  /** Emitted when the chat toggle is pressed. */
  public readonly toggled = output();

  private readonly toggleButton = viewChild.required<ElementRef<HTMLButtonElement>>('toggle');

  /** Moves focus back to the toggle, e.g. after the panel closes. */
  public focusToggle(): void {
    this.toggleButton().nativeElement.focus();
  }

  protected onToggle(): void {
    this.toggled.emit();
  }
}
