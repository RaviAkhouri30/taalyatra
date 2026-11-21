import { inject } from '@angular/core';
import { HttpAiService } from '@core/backends/ai/http-ai.service';
import { FakeAiService } from '@core/backends/fake/fake-ai.service';
import { BackendType } from '@core/enums/backend-type.enum';
import { type IAiService } from '@core/interfaces/i-ai-service';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';

/**
 * Picks the AI adapter (0025): the Azure Function for a Firebase build, the Fake otherwise
 * (development and e2e). Where the function has no AI settings, or isn't there at all (the emulator
 * build), its status says so and the admin shows no AI buttons.
 *
 * @returns The active AI adapter.
 */
export function aiServiceFactory(): IAiService {
  return inject(APP_ENVIRONMENT).backend === BackendType.Firebase
    ? new HttpAiService()
    : new FakeAiService();
}
