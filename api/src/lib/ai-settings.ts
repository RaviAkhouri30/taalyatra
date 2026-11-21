/** The provider's settings (0025 D2): any OpenAI-compatible chat API, e.g. Groq's. */
export interface IAiSettings {
  /** e.g. `https://api.groq.com/openai/v1`, without a trailing slash. */
  readonly url: string;
  readonly model: string;
  readonly key: string;
  /** A model that reads pictures, or `null` when none is set (D5). */
  readonly visionModel: string | null;
}

/** @returns A setting, trimmed; empty when missing. */
function setting(env: NodeJS.ProcessEnv, name: string): string {
  // A Map lookup: the names are this file's own, never the caller's.
  return (new Map(Object.entries(env)).get(name) ?? '').trim();
}

/** @returns The address without trailing slashes. A loop, not a pattern, so it stays linear. */
function withoutTrailingSlashes(url: string): string {
  let end = url.length;
  while (end > 0 && url.charAt(end - 1) === '/') {
    end -= 1;
  }
  return url.slice(0, end);
}

/**
 * @param env The function's settings.
 * @returns The provider's settings, or `null` when any required one is missing: the AI help is then
 *   simply not available, and nothing else changes.
 */
export function readAiSettings(env: NodeJS.ProcessEnv): IAiSettings | null {
  const url = withoutTrailingSlashes(setting(env, 'AI_API_URL'));
  const model = setting(env, 'AI_MODEL');
  const key = setting(env, 'AI_API_KEY');
  if (!url || !model || !key) {
    return null;
  }
  return { url, model, key, visionModel: setting(env, 'AI_VISION_MODEL') || null };
}
