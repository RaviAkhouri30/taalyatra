import { app } from '@azure/functions';
import { toAzureResponse } from '../lib/api-handler.js';
import { LIVE_DEPENDENCIES } from '../lib/live-dependencies.js';
import { signUpload } from '../lib/sign-upload.js';

// authLevel anonymous: the platform's keys don't apply here; `signUpload` verifies the admin.
app.http('media-sign', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'media/sign',
  handler: (request, context) => toAzureResponse(signUpload(request, LIVE_DEPENDENCIES), context),
});
