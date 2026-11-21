/** What the editor asks the AI for (0025 V8). The values are what `api/` accepts. */
export enum AiTask {
  /** A better version of the field's text, in a style. */
  Rewrite = 'rewrite',
  /** A first version for an empty field. */
  Suggest = 'suggest',
  /** A picture's description, for people who can't see it. */
  Describe = 'describe',
}
