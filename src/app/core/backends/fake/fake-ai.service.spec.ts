import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { AiStyle } from '@core/enums/ai-style.enum';
import { AiTask } from '@core/enums/ai-task.enum';
import { AiError } from '@core/interfaces/i-ai-service';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { environment } from '@env/environment';
import { FAKE_AI_DESCRIPTION, FAKE_AI_FAIL } from './fake-ai.constants';
import { FakeAiService } from './fake-ai.service';

describe('FakeAiService', () => {
  function create(): FakeAiService {
    TestBed.configureTestingModule({
      providers: [{ provide: APP_ENVIRONMENT, useValue: { ...environment, fakeLatencyMs: 0 } }],
    });
    return TestBed.runInInjectionContext(() => new FakeAiService());
  }

  const field = { label: 'Headline', page: 'Hero' };

  it('should say text and picture help are set up', async () => {
    await expect(firstValueFrom(create().status())).resolves.toEqual({ text: true, vision: true });
  });

  it.each([
    [{ ...field, task: AiTask.Rewrite, style: AiStyle.Warmer, text: 'Hi' }, 'warmer: Hi'],
    [{ ...field, task: AiTask.Suggest }, 'A first version for Headline.'],
    [{ ...field, task: AiTask.Describe, imageUrl: 'x' }, FAKE_AI_DESCRIPTION],
  ])('should answer %o predictably', async (request, text) => {
    await expect(firstValueFrom(create().write(request))).resolves.toBe(text);
  });

  it('should fail when the text asks it to, for e2e', async () => {
    const request = { ...field, task: AiTask.Rewrite, style: AiStyle.Clearer, text: FAKE_AI_FAIL };

    await expect(firstValueFrom(create().write(request))).rejects.toBeInstanceOf(AiError);
  });

  it('should analyse any counts the same way', async () => {
    const summary = {
      total: 4,
      byStatus: {},
      byEventType: {},
      byExperience: {},
      byGroupSize: {},
      byEventMonth: {},
      byReceivedMonth: {},
    };

    await expect(firstValueFrom(create().analyseLeads(summary))).resolves.toContain(
      'From 4 leads.',
    );
  });
});
