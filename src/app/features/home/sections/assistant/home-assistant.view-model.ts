import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { type Observable, Subject, combineLatest, filter, map, mergeMap, tap, timer } from 'rxjs';
import { ViewModel } from '@shared/base/view-model';
import { OverlayStateService } from '@shared/services/overlay-state.service';
import { SiteConfigService } from '@shared/services/site-config.service';
import { AssistantModel, type IChatMessage } from './assistant.model';
import { ChatRole } from './chat-role.enum';
import { HomeAssistantService } from './home-assistant.service';

/** Pause before the assistant answers, so the typing indicator reads naturally (design: 800 ms). */
const REPLY_DELAY_MS = 800;
/** Messages kept on screen (design). */
const VISIBLE_MESSAGES = 8;

/**
 * Chat assistant state: whether the panel is open, the conversation, and the typing indicator.
 * Questions are answered locally from canned replies after a short pause.
 */
@Injectable()
export class HomeAssistantViewModel extends ViewModel<AssistantModel> {
  public readonly question = new FormControl('', { nonNullable: true });
  public readonly isOpen = signal(false);
  /** False until the visitor first opens the chat; drives the tease bubble and badge. */
  public readonly hasOpened = signal(false);
  public readonly typing = computed(() => this.pending() > 0);
  /** Latest messages, newest first (the list is laid out bottom-up). */
  public readonly recent = computed(() => this.messages().slice(-VISIBLE_MESSAGES).reverse());

  private readonly assistantService = inject(HomeAssistantService);
  private readonly siteConfigService = inject(SiteConfigService);
  private readonly overlay = inject(OverlayStateService);
  private readonly messages = signal<readonly IChatMessage[]>([]);
  private readonly pending = signal(0);
  private readonly questions = new Subject<string>();
  private nextId = 0;

  public constructor() {
    super();
    // Leaving the home page with the chat open must not keep the promo badge hidden.
    inject(DestroyRef).onDestroy(() => {
      this.overlay.setPanelOpen(false);
    });
  }

  /** Opens or closes the panel. */
  public toggle(): void {
    this.isOpen.update((open) => !open);
    this.hasOpened.set(true);
    this.overlay.setPanelOpen(this.isOpen());
  }

  /** Closes the panel. */
  public close(): void {
    this.isOpen.set(false);
    this.overlay.setPanelOpen(false);
  }

  /** Asks `text`, or the typed question when omitted, and clears the input. */
  public ask(text: string = this.question.value): void {
    this.question.reset();
    this.questions.next(text);
  }

  protected override attachViewHandler(): Observable<unknown> {
    return combineLatest([
      this.assistantService.attachViewDataHandler(),
      this.siteConfigService.getSiteConfig(),
    ]).pipe(
      tap(([dto, site]) => {
        const model = new AssistantModel(dto, site.contact, site.brand);
        this.messages.set([this.message(ChatRole.Bot, model.greeting)]);
        this.setData(model);
      }),
    );
  }

  protected override attachCommandHandler(): Observable<unknown> {
    return this.questions.pipe(
      map((text) => text.trim()),
      filter((text) => text.length > 0),
      tap((text) => {
        this.append(ChatRole.Visitor, text);
        this.pending.update((count) => count + 1);
      }),
      // mergeMap: every question gets its own answer, even when asked while one is pending.
      mergeMap((text) => timer(REPLY_DELAY_MS).pipe(map(() => this.data()?.reply(text) ?? ''))),
      tap((reply) => {
        this.pending.update((count) => count - 1);
        this.append(ChatRole.Bot, reply);
      }),
    );
  }

  private append(role: ChatRole, text: string): void {
    this.messages.update((list) => [...list, this.message(role, text)]);
  }

  private message(role: ChatRole, text: string): IChatMessage {
    this.nextId += 1;
    return { id: this.nextId, role, text };
  }
}
