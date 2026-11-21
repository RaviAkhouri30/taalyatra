import { app } from '@azure/functions';
import { aiStatus } from '../lib/ai-status.js';
import { toAzureResponse } from '../lib/api-handler.js';
import { LIVE_DEPENDENCIES } from '../lib/live-dependencies.js';

// authLevel anonymous: the platform's keys don't apply here; `aiStatus` verifies the caller.
app.http('ai-status', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'ai/status',
  handler: (request, context) => toAzureResponse(aiStatus(request, LIVE_DEPENDENCIES), context),
});
