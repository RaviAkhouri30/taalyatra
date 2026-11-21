import { firstValueFrom } from 'rxjs';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  AI_ENV,
  type ITestKeys,
  createTestKeys,
  fakeDependencies,
  fakeRequest,
  signToken,
} from '../testing/api-testing.js';
import { aiStatus } from './ai-status.js';

describe('aiStatus', () => {
  let test: ITestKeys;

  beforeAll(async () => {
    test = await createTestKeys();
  });

  it.each([
    ['nothing set up', {}, { text: false, vision: false }],
    ['text only', AI_ENV, { text: true, vision: false }],
    ['text and pictures', { ...AI_ENV, AI_VISION_MODEL: 'v' }, { text: true, vision: true }],
  ])('should report %s', async (_case, env, status) => {
    const token = await signToken(test.privateKey);

    const response = await firstValueFrom(
      aiStatus(fakeRequest(token), fakeDependencies(test.keys, { env })),
    );

    expect(response.jsonBody).toEqual(status);
  });
});
