import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { type IChatMessage } from '../assistant.model';

/**
 * The conversation (design `.chat-b`): bubbles plus the typing indicator. The list is laid out
 * bottom-up (`column-reverse`), so the newest message stays in view without scripted scrolling.
 */
@Component({
  selector: 'app-assistant-messages',
  templateUrl: './assistant-messages.component.html',
  styleUrl: './assistant-messages.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'chat-b', role: 'log', '[attr.aria-label]': 'label()' },
})
export class AssistantMessagesComponent {
  /** Messages newest first. */
  public readonly messages = input.required<readonly IChatMessage[]>();
  public readonly typing = input.required<boolean>();
  /** Accessible name of the conversation log. */
  public readonly label = input.required<string>();
  /** Accessible name of the typing indicator. */
  public readonly typingLabel = input.required<string>();
}
