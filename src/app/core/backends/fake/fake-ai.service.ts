import { inject } from '@angular/core';
import { type Observable, delay, of, throwError } from 'rxjs';
import { AiErrorKind } from '@core/enums/ai-error-kind.enum';
import { AiTask } from '@core/enums/ai-task.enum';
import {
  AiError,
  type IAiService,
  type IAiStatus,
  type IAiWriteRequest,
  type ILeadsSummary,
} from '@core/interfaces/i-ai-service';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { FAKE_AI_ANALYSIS, FAKE_AI_DESCRIPTION, FAKE_AI_FAIL } from './fake-ai.constants';

/** Answers predictably, without a network (development, unit tests and e2e). */
export class FakeAiService implements IAiService {
  private readonly latencyMs = inject(APP_ENVIRONMENT).fakeLatencyMs;

  private static answer(request: IAiWriteRequest): string {
    if (request.task === AiTask.Describe) {
      return FAKE_AI_DESCRIPTION;
    }
    if (request.task === AiTask.Suggest) {
      return `A first version for ${request.label}.`;
    }
    return `${request.style ?? 'rewritten'}: ${request.text ?? ''}`;
  }
  public status(): Observable<IAiStatus> {
    return of({ text: true, vision: true });
  }

  public write(request: IAiWriteRequest): Observable<string> {
    if (request.text?.includes(FAKE_AI_FAIL) === true) {
      return throwError(() => new AiError(AiErrorKind.Unavailable)).pipe(delay(this.latencyMs));
    }
    return of(FakeAiService.answer(request)).pipe(delay(this.latencyMs));
  }

  public analyseLeads(summary: ILeadsSummary): Observable<string> {
    return of(`${FAKE_AI_ANALYSIS}\n• From ${String(summary.total)} leads.`).pipe(
      delay(this.latencyMs),
    );
  }
}
