import { describe, expect, it } from 'vitest';
import { AI_ENV } from '../testing/api-testing.js';
import { readAiSettings } from './ai-settings.js';

describe('readAiSettings', () => {
  it('should read the provider, without a trailing slash, and no picture model by default', () => {
    expect(readAiSettings(AI_ENV)).toEqual({
      url: 'https://ai.example/v1',
      model: 'text-model',
      key: 'not-a-real-key',
      visionModel: null,
    });
  });

  it('should read a picture model when one is set', () => {
    expect(readAiSettings({ ...AI_ENV, AI_VISION_MODEL: ' vision ' })?.visionModel).toBe('vision');
  });

  it.each(['AI_API_URL', 'AI_MODEL', 'AI_API_KEY'])(
    'should say the help is not set up when %s is missing',
    (name) => {
      expect(readAiSettings({ ...AI_ENV, [name]: ' ' })).toBeNull();
    },
  );
});
