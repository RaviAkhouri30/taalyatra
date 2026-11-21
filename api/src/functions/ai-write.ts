import { app } from '@azure/functions';
import { writeHelp } from '../lib/ai-write.js';
import { toAzureResponse } from '../lib/api-handler.js';
import { LIVE_DEPENDENCIES } from '../lib/live-dependencies.js';

// authLevel anonymous: the platform's keys don't apply here; `writeHelp` verifies the caller.
app.http('ai-write', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'ai/write',
  handler: (request, context) => toAzureResponse(writeHelp(request, LIVE_DEPENDENCIES), context),
});
