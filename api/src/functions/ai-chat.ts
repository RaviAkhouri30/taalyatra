import { app } from '@azure/functions';
import { siteChat } from '../lib/ai-chat.js';
import { toAzureResponse } from '../lib/api-handler.js';
import { LIVE_DEPENDENCIES } from '../lib/live-dependencies.js';

// authLevel anonymous: the public chat has no sign-in; `siteChat` applies its limits (0025 V7).
app.http('ai-chat', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'ai/chat',
  handler: (request, context) => toAzureResponse(siteChat(request, LIVE_DEPENDENCIES), context),
});
