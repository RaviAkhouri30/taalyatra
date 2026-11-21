import { app } from '@azure/functions';
import { leadsAnalysis } from '../lib/ai-leads.js';
import { toAzureResponse } from '../lib/api-handler.js';
import { LIVE_DEPENDENCIES } from '../lib/live-dependencies.js';

// authLevel anonymous: the platform's keys don't apply here; `leadsAnalysis` verifies the caller.
app.http('ai-leads', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'ai/leads',
  handler: (request, context) =>
    toAzureResponse(leadsAnalysis(request, LIVE_DEPENDENCIES), context),
});
