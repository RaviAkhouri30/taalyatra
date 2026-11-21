import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { SiteChatRole } from '@core/enums/site-chat-role.enum';
import { AI_CHAT_URL } from './ai.constants';
import { HttpSiteChat, SITE_CHAT_TIMEOUT_MS } from './http-site-chat';

describe('HttpSiteChat', () => {
  function create(): { chat: HttpSiteChat; http: HttpTestingController } {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    return {
      chat: new HttpSiteChat(TestBed.inject(HttpClient)),
      http: TestBed.inject(HttpTestingController),
    };
  }

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should send the question and the conversation, with no sign-in, and return the answer', async () => {
    const { chat, http } = create();
    const history = [{ role: SiteChatRole.Visitor, text: 'Hi' }];
    const answer = firstValueFrom(chat.ask('How long?', history));

    const request = http.expectOne(AI_CHAT_URL);
    expect(request.request.body).toEqual({ question: 'How long?', history });
    expect(request.request.headers.has('x-firebase-token')).toBe(false);
    request.flush({ text: 'Two hours.' });

    await expect(answer).resolves.toBe('Two hours.');
  });

  it('should fail on a refusal, so the script answers', async () => {
    const { chat, http } = create();
    const answer = firstValueFrom(chat.ask('Hi', []));

    http.expectOne(AI_CHAT_URL).flush({ error: 'x' }, { status: 429, statusText: 'Too many' });

    await expect(answer).rejects.toBeDefined();
  });

  it('should give up after 12 s', async () => {
    vi.useFakeTimers();
    const { chat } = create();
    const answer = firstValueFrom(chat.ask('Hi', []));

    vi.advanceTimersByTime(SITE_CHAT_TIMEOUT_MS);

    await expect(answer).rejects.toMatchObject({ name: 'TimeoutError' });
  });
});
