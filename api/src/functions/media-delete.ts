import { app } from '@azure/functions';
import { toAzureResponse } from '../lib/api-handler.js';
import { deleteMedia } from '../lib/delete-media.js';
import { LIVE_DEPENDENCIES } from '../lib/live-dependencies.js';

// authLevel anonymous: the platform's keys don't apply here; `deleteMedia` verifies the admin.
app.http('media-delete', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'media/delete',
  handler: (request, context) => toAzureResponse(deleteMedia(request, LIVE_DEPENDENCIES), context),
});
