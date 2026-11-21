/**
 * The Fake AI's fixed phrases (0025), in their own file with no imports, so the e2e suite can
 * use them as it does the fake accounts.
 */
/** Text that makes the Fake fail, so e2e can show what the owner sees then. */
export const FAKE_AI_FAIL = 'fail with AI';

/** The Fake's description of any picture. */
export const FAKE_AI_DESCRIPTION = 'Children drumming together in a circle.';

/** The Fake's analysis, whatever the counts. */
export const FAKE_AI_ANALYSIS =
  '• Most enquiries are for corporate events.\n• December is the busiest month.';

/** A typed chat question with this in it makes the Fake chat fail, so e2e can show the script answering. */
export const FAKE_CHAT_FAIL = 'ask the script';

/** How the Fake chat starts each answer, so e2e can tell an AI answer from a scripted one. */
export const FAKE_CHAT_PREFIX = 'From the site:';
