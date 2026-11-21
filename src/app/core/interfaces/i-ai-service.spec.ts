import { AiErrorKind } from '@core/enums/ai-error-kind.enum';
import { AI_ERROR_MESSAGES, AiError } from './i-ai-service';

describe('AiError', () => {
  it.each([AiErrorKind.Unavailable, AiErrorKind.Limit, AiErrorKind.Refused])(
    'should tell the owner what %s means',
    (kind) => {
      expect(AiError.messageOf(new AiError(kind))).toBe(AI_ERROR_MESSAGES[kind]);
    },
  );

  it('should say the help is unavailable for any other failure', () => {
    expect(AiError.messageOf(new Error('x'))).toBe(AI_ERROR_MESSAGES[AiErrorKind.Unavailable]);
  });

  it('should keep the original failure for the logs', () => {
    const cause = new Error('offline');

    expect(new AiError(AiErrorKind.Unavailable, cause)).toMatchObject({ name: 'AiError', cause });
  });
});
