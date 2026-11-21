import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  type Observable,
  Subject,
  catchError,
  combineLatest,
  defer,
  filter,
  map,
  mergeMap,
  shareReplay,
  switchMap,
  tap,
  timer,
} from 'rxjs';
import { SITE_CHAT_LOADER } from '@core/backends/ai/site-chat-loader.token';
import { SiteChatRole } from '@core/enums/site-chat-role.enum';
import { type ISiteChatTurn, SITE_CHAT_HISTORY } from '@core/interfaces/i-site-chat';
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
/** The longest earlier message `api/` accepts. */
const HISTORY_TEXT_MAX = 600;

/** A question as asked: typed ones may go to the AI chat; quick replies stay scripted (0025 V7). */
interface IQuestion {
  readonly text: string;
  readonly typed: boolean;
  /** The conversation before it, for a follow-up. */
  readonly history: readonly ISiteChatTurn[];
}

/**
 * Chat assistant state: whether the panel is open, the conversation, and the typing indicator.
 * Typed questions are answered by the site's AI chat when it can (0025 V7); quick replies, and any
 * question the AI can't answer, from the owner's scripted replies after a short pause.
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
  private readonly questions = new Subject<IQuestion>();
  private readonly loadChat = inject(SITE_CHAT_LOADER);
  /** Loaded on the first typed question, then shared; a failed load is tried again next time. */
  private readonly chat$ = defer(() => this.loadChat()).pipe(
    shareReplay({ bufferSize: 1, refCount: false }),
  );
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

  /**
   * Asks a quick reply, or the typed question when `text` is omitted, and clears the input.
   * @param text The quick reply chosen, if any.
   */
  public ask(text?: string): void {
    const question = {
      text: text ?? this.question.value,
      typed: text === undefined,
      history: this.history(),
    };
    this.question.reset();
    this.questions.next(question);
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
      map((question) => ({ ...question, text: question.text.trim() })),
      filter((question) => question.text.length > 0),
      tap((question) => {
        this.append(ChatRole.Visitor, question.text);
        this.pending.update((count) => count + 1);
      }),
      // mergeMap: every question gets its own answer, even when asked while one is pending.
      mergeMap((question) => this.answer(question)),
      tap((reply) => {
        this.pending.update((count) => count - 1);
        this.append(ChatRole.Bot, reply);
      }),
    );
  }

  /** The AI chat's answer to a typed question, else the scripted reply. */
  private answer(question: IQuestion): Observable<string> {
    const scripted = timer(REPLY_DELAY_MS).pipe(map(() => this.data()?.reply(question.text) ?? ''));
    if (!question.typed) {
      return scripted;
    }
    return this.chat$.pipe(
      // switchMap: the chat is loaded once; each typed question is one request.
      switchMap((chat) => chat.ask(question.text, question.history)),
      // Not turned on, a limit, a failure, offline or slow: the script answers, as before 2.7.0.
      catchError(() => scripted),
    );
  }

  /** The last few messages after the greeting, as the AI chat takes them. */
  private history(): ISiteChatTurn[] {
    return this.messages()
      .slice(1)
      .slice(-SITE_CHAT_HISTORY)
      .map((message) => ({
        role: message.role === ChatRole.Visitor ? SiteChatRole.Visitor : SiteChatRole.Bot,
        text: message.text.slice(0, HISTORY_TEXT_MAX),
      }));
  }

  private append(role: ChatRole, text: string): void {
    this.messages.update((list) => [...list, this.message(role, text)]);
  }

  private message(role: ChatRole, text: string): IChatMessage {
    this.nextId += 1;
    return { id: this.nextId, role, text };
  }
}
