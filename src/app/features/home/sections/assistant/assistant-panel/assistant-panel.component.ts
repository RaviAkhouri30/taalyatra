import {
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  afterRenderEffect,
  input,
  output,
  viewChild,
} from '@angular/core';
import { type FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgOptimizedImage } from '@angular/common';
import { IconComponent } from '@shared/components/icon/icon.component';
import { IconName } from '@shared/enums/icon-name.enum';
import { AssistantMessagesComponent } from '../assistant-messages/assistant-messages.component';
import { type AssistantModel, type IChatMessage } from '../assistant.model';

/** Rendered avatar size in px (the logo file is 156 px square). */
const AVATAR_SIZE = 46;

/**
 * The chat panel (design `.chat`): header, conversation, quick questions, input and a WhatsApp
 * link. Presentational: the view model owns the conversation and answers questions.
 */
@Component({
  selector: 'app-assistant-panel',
  imports: [AssistantMessagesComponent, IconComponent, NgOptimizedImage, ReactiveFormsModule],
  templateUrl: './assistant-panel.component.html',
  styleUrl: './assistant-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(keydown.escape)': 'onClose()' },
})
export class AssistantPanelComponent {
  public readonly assistant = input.required<AssistantModel>();
  public readonly open = input.required<boolean>();
  /** Messages newest first. */
  public readonly messages = input.required<readonly IChatMessage[]>();
  public readonly typing = input.required<boolean>();
  public readonly question = input.required<FormControl<string>>();
  public readonly panelId = input.required<string>();
  /** Emitted with a quick question, or with no value when the typed question is sent. */
  public readonly asked = output<string | undefined>();
  /** Emitted when the visitor closes the panel (button or Escape). */
  public readonly closed = output();

  protected readonly icon = IconName;
  protected readonly avatarSize = AVATAR_SIZE;
  private readonly closeButton = viewChild.required<ElementRef<HTMLButtonElement>>('close');

  public constructor() {
    // Move focus into the panel when it opens; after render, once it is no longer inert.
    afterRenderEffect(() => {
      if (this.open()) {
        this.closeButton().nativeElement.focus({ preventScroll: true });
      }
    });
  }

  protected onClose(): void {
    if (this.open()) {
      this.closed.emit();
    }
  }

  protected onAsk(question?: string): void {
    this.asked.emit(question);
  }

  /** Sends the typed question without the browser's full-page form submission. */
  protected onSend(event: Event): void {
    event.preventDefault();
    this.asked.emit(undefined);
  }
}
