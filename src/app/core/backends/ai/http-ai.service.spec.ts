import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { type Observable, firstValueFrom, of } from 'rxjs';
import { AiErrorKind } from '@core/enums/ai-error-kind.enum';
import { AiTask } from '@core/enums/ai-task.enum';
import { AiError, NO_AI } from '@core/interfaces/i-ai-service';
import { IAuthService } from '@core/interfaces/i-auth-service';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { environment } from '@env/environment';
import { AI_LEADS_URL, AI_STATUS_URL, AI_WRITE_URL } from './ai.constants';
import { HttpAiService } from './http-ai.service';

const SUMMARY = {
  total: 1,
  byStatus: { new: 1 },
  byEventType: {},
  byExperience: {},
  byGroupSize: {},
  byEventMonth: {},
  byReceivedMonth: {},
};

describe('HttpAiService', () => {
  let http: HttpTestingController;

  function create(token: string | null = 'id-token'): HttpAiService {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_ENVIRONMENT, useValue: environment },
        { provide: IAuthService, useValue: { idToken: () => of(token) } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    return TestBed.runInInjectionContext(() => new HttpAiService());
  }

  /** Resolves to the value, or to the failure's kind. */
  function settle<T>(source: Observable<T>): Promise<T | AiErrorKind> {
    return firstValueFrom(source).catch((error: unknown) =>
      error instanceof AiError ? error.kind : AiErrorKind.Unavailable,
    );
  }

  it('should send a request with the account’s token and return the suggestion', async () => {
    const service = create();
    const answer = settle(service.write({ task: AiTask.Suggest, label: 'Intro', page: 'Offer' }));

    const request = http.expectOne(AI_WRITE_URL);
    expect(request.request.headers.get('x-firebase-token')).toBe('id-token');
    expect(request.request.body).toEqual({ task: 'suggest', label: 'Intro', page: 'Offer' });
    request.flush({ text: 'A first version.' });

    await expect(answer).resolves.toBe('A first version.');
  });

  it('should send only the summary for an analysis', async () => {
    const service = create();
    const answer = settle(service.analyseLeads(SUMMARY));

    const request = http.expectOne(AI_LEADS_URL);
    expect(request.request.body).toEqual({ summary: SUMMARY });
    request.flush({ text: '• Busy December.' });

    await expect(answer).resolves.toBe('• Busy December.');
  });

  it.each([
    [429, AiErrorKind.Limit],
    [401, AiErrorKind.Refused],
    [403, AiErrorKind.Refused],
    [503, AiErrorKind.Unavailable],
  ])('should turn a %s into %s', async (status, kind) => {
    const service = create();
    const answer = settle(service.analyseLeads(SUMMARY));

    http.expectOne(AI_LEADS_URL).flush({ error: 'x' }, { status, statusText: 'x' });

    await expect(answer).resolves.toBe(kind);
  });

  it('should refuse without asking when nobody is signed in', async () => {
    const service = create(null);

    await expect(settle(service.analyseLeads(SUMMARY))).resolves.toBe(AiErrorKind.Refused);
    http.expectNone(AI_LEADS_URL);
  });

  it('should read which help is set up once, and share it', async () => {
    const service = create();
    const first = firstValueFrom(service.status());
    http.expectOne(AI_STATUS_URL).flush({ text: true, vision: false, extra: 1 });

    await expect(first).resolves.toEqual({ text: true, vision: false });
    await expect(firstValueFrom(service.status())).resolves.toEqual({ text: true, vision: false });
    http.expectNone(AI_STATUS_URL);
  });

  it('should treat a status it can’t read as no help', async () => {
    const service = create();
    const status = firstValueFrom(service.status());

    http.expectOne(AI_STATUS_URL).flush('', { status: 404, statusText: 'Not found' });

    await expect(status).resolves.toEqual(NO_AI);
  });
});
